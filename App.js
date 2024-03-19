    import { StatusBar } from 'expo-status-bar';
    import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    PermissionsAndroid,
    } from "react-native";
    // import { requestPermission } from './BLE.jsx';
    import { BleManager } from 'react-native-ble-plx';
    import { useEffect, useState, useRef } from 'react';
    import { atob } from 'react-native-quick-base64';
    import Bottomnav from "./components/Bottomnav"
    import {DefaultTheme, Provider as PaperProvider} from "react-native-paper";
    import TopBar from "./components/TopBar";
    import LoginScreen from './components/LoginScreen'; // Ensure this component handles user logins
    import CreateAccountScreen from './components/CreateAccountScreen';

    import { AppRegistry } from 'react-native';
    import valuesToPercentage, {today} from "./utilities";
    import firebase from "firebase/app" ;
    import { app, database, auth } from './firebase-config'; 
    import { onAuthStateChanged } from 'firebase/auth';

    import { createNativeStackNavigator } from '@react-navigation/native-stack';
    import { NavigationContainer } from '@react-navigation/native';
    import AuthNavigator from './components/AuthNavigator'; // Adjust the path according to your file structure
    import { getDatabase, ref, get, update } from 'firebase/database';

    const Stack = createNativeStackNavigator();




    // import {firebaseConfig} from "./firebaseConfig";

    const bleManager = new BleManager();
    const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
    const DATA_CHAR_UUID = "beefcafe-36e1-4688-b7f5-00000000000b";


    // Android Bluetooth Permission
    async function requestPermission(){
    try{
        const bluetoothScanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
            title: "Scan Permission",
            message: "App requires Bluetooth scanning",
            buttonPositive: "Ok",
            });

        const bluetoothConnectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
            title: "Connect Permission",
            message: "App requires Bluetooth connecting",
            buttonPositive: "Ok",
            });

        const bluetoothCoarseLocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
            title: "Location permission for bluetooth scanning",
            message: "Grant permission to allow the app to scan for Bluetooth devices",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "Ok",
            });

            const bluetoothFineLocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
            title: "Fine Location permission for bluetooth scanning",
            message: "Grant permission to allow the app to scan for Bluetooth devices",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "Ok",
            });

        if (bluetoothScanPermission == "granted" &&
            bluetoothConnectPermission == "granted" &&
            bluetoothCoarseLocationPermission == "granted" &&
            bluetoothFineLocationPermission == "granted"){
            console.log("Bluetooth permissions granted");
            }
        else{
            console.log("Bluetooth permissions denied");
        }

    } catch (err){
        console.warn(err);
    }

    }

    export default function App() {

        const [deviceID, setDeviceID] = useState(null);
        const [connectionStatus, setConnectionStatus] = useState("Searching...");
        const [stepCount, setStepCount] = useState(0);
        const [stepDataChar, setStepDataChar] = useState(null); // Not Used
        const [user, setUser] = useState(null);
        const [initializing, setInitializing] = useState(true); // State to handle initial loading
        const [showCreateAccount, setShowCreateAccount] = useState(false);


        const deviceRef = useRef(null);

        useEffect(() => {
            requestPermission();
        
            // Firebase Auth state listener for the modular approach
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
              setUser(currentUser.uid);
              if (initializing) setInitializing(false);
            });
        
            // Cleanup function
            return () => unsubscribe();
          }, [initializing]);
        


        const searchAndConnectToDevice = () => {
            bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error(error);
                setConnectionStatus("Error searching for devices");
                return;
            }
            if (device.name === "Smart-sip") {
                bleManager.stopDeviceScan();
                setConnectionStatus("Connecting...");
                connectToDevice(device);
            }
            });
        };

        useEffect(() => {
            if (user) { // Only attempt to connect if a user is logged in
            searchAndConnectToDevice();
            }
        }, [user]);

        const connectToDevice = (device) => {
            return device
            .connect()
            .then((device) => {
                setDeviceID(device.id);
                setConnectionStatus("Connected");
                deviceRef.current = device;
                return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
                return device.services();
            })
            .then((services) => {
                let service = services.find((service) => service.uuid === SERVICE_UUID);
                return service.characteristics();
            })
            .then((characteristics) => {
                let stepDataCharacteristic = characteristics.find(
                (char) => char.uuid === DATA_CHAR_UUID
                );
                setStepDataChar(stepDataCharacteristic);
                stepDataCharacteristic.monitor(async (error, char) => {
                    if (error) {
                        console.log("here")
                        console.error(error);
                        return;
                        }
                        
                        // Convert from Base64 to ArrayBuffer
                        const raw = atob(char.value);
                        const rawLength = raw.length;
                        const arrayBuffer = new ArrayBuffer(rawLength);
                        const dataArray = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < rawLength; i++) {
                            dataArray[i] = raw.charCodeAt(i);
                        }
                        console.log(dataArray);
                        // Assuming the first 4 bytes are float (weight), and then date & time
                        const dataView = new DataView(arrayBuffer);
                        const weight = dataView.getFloat32(0, true); // true for little endian
                        // Assuming next bytes are for date and time (as described)
                        const year = dataView.getUint16(4, true);
                        const month = dataView.getUint8(6);
                        const day = dataView.getUint8(7);
                        const hour = dataView.getUint8(8);
                        const minute = dataView.getUint8(9);
                        const second = dataView.getUint8(10);
                        const zeroPad = (num, places) => String(num).padStart(places, '0');

                        const timestamp = `${year}-${zeroPad(month, 2)}-${zeroPad(day, 2)}T${zeroPad(hour, 2)}:${zeroPad(minute, 2)}:${zeroPad(second, 2)}`;
                        const waterAmountRef = ref(database,  `users/${user}/${today()}/waterAmount`);

                        // Retrieve the current water amount
                        const waterSnapshot = await get(waterAmountRef);
                        let currentWaterAmount = waterSnapshot.exists() ? waterSnapshot.val() : 0;

                        const targetRef = ref(database,  `users/${user}/target`);

                        // Retrieve the current water amount
                        const targetSnapshot = await get(targetRef);
                        let currentTarget = targetSnapshot.exists() ? targetSnapshot.val() : 0;
                      
                        // Calculate the new water amount
                        const newWaterAmount = currentWaterAmount + weight;
                        console.log(user);
                        update(ref(database, `users/${user}/${today()}`), {
                        'waterAmount': newWaterAmount, // Increment water amount by the new value
                        'date': timestamp,
                        // Assuming valuesToPercentage and target are available/defined. Adjust as necessary.
                        'percentage': valuesToPercentage(currentTarget, newWaterAmount) // Update percentage accordingly
                    }).then(() => {
                        console.log('Database updated with new water intake');
                    }).catch((error) => {
                        console.error('Failed to update database', error);
                    });
                });
            })
            .catch((error) => {
                console.log(error);
                setConnectionStatus("Error in Connection");
            });
        };

        useEffect(() => {
        const subscription = bleManager.onDeviceDisconnected(
            deviceID,
            (error, device) => {
            if (error) {
                console.log("Disconnected with error:", error);
            }
            setConnectionStatus("Disconnected");
            console.log("Disconnected device");
            if (deviceRef.current) {
                setConnectionStatus("Reconnecting...");
                console.log(connectionStatus);
                connectToDevice(deviceRef.current)
                .then(() => setConnectionStatus("Connected"))
                .catch((error) => {
                    console.log("Reconnection failed: ", error);
                    setConnectionStatus("Reconnection failed");
                    console.log(connectionStatus);

                });
            }
            }
        );
        return () => subscription.remove();
        }, [deviceID]);

        // if (!user) {
        //     return (
        //       <NavigationContainer>
        //         <AuthNavigator />
        //       </NavigationContainer>
        //     );
        //   }
        
        
    const theme = {
        ...DefaultTheme,
        dark: true,
        mode: 'adaptive',
        roundness: 15,
        colors: {
            ...DefaultTheme.colors,
            primary: '#2176FF',
            accent: '#33A1FD',
            surface: '#131A26',
            background: '#131A26',
            text: '#FFFFFF'
        },
    };

    return (
        <PaperProvider theme={theme}>
        <NavigationContainer>
          {user ? (
            // If logged in, show main app interface
            <View style={styles.container}>
              <TopBar />
              <Bottomnav />
              <StatusBar style="auto" />
            </View>
          ) : (
            // Otherwise, show authentication screens
            <AuthNavigator />
          )}
        </NavigationContainer>
      </PaperProvider>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    content: {
        flex: 10,
    }
    });

    AppRegistry.registerComponent("smart-sip", () => App);
