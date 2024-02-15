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
// import firebase from "firebase/app";
import TopBar from "./components/TopBar";
// import {firebaseConfig} from "./firebaseConfig";

const bleManager = new BleManager();
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const STEP_DATA_CHAR_UUID = "beefcafe-36e1-4688-b7f5-00000000000b";


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

requestPermission();

export default function App() {

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
          <View style={styles.container}>
              <View style={styles.content}>
                  <TopBar/>
                  <Bottomnav/>
              </View>
              <StatusBar style="auto" />
          </View>
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


// export default function App() {
//   const [deviceID, setDeviceID] = useState(null);
//   const [stepCount, setStepCount] = useState(0);
//   const [stepDataChar, setStepDataChar] = useState(null); // Not Used
//   const [connectionStatus, setConnectionStatus] = useState("Searching...");

//   const progress = (stepCount / 1000) * 100;

//   const deviceRef = useRef(null);

//   const searchAndConnectToDevice = () => {
//     bleManager.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.error(error);
//         setConnectionStatus("Error searching for devices");
//         return;
//       }
//       if (device.name === "Smart-sip") {
//         bleManager.stopDeviceScan();
//         setConnectionStatus("Connecting...");
//         connectToDevice(device);
//       }
//     });
//   };

//   useEffect(() => {
//     searchAndConnectToDevice();
//   }, []);

//   const connectToDevice = (device) => {
//     return device
//       .connect()
//       .then((device) => {
//         setDeviceID(device.id);
//         setConnectionStatus("Connected");
//         deviceRef.current = device;
//         return device.discoverAllServicesAndCharacteristics();
//       })
//       .then((device) => {
//         return device.services();
//       })
//       .then((services) => {
//         let service = services.find((service) => service.uuid === SERVICE_UUID);
//         return service.characteristics();
//       })
//       .then((characteristics) => {
//         let stepDataCharacteristic = characteristics.find(
//           (char) => char.uuid === STEP_DATA_CHAR_UUID
//         );
//         setStepDataChar(stepDataCharacteristic);
//         stepDataCharacteristic.monitor((error, char) => {
//           if (error) {
//             console.error(error);
//             return;
//           }
//           const rawStepData = atob(char.value);
//           console.log("Received step data:", rawStepData);
//           setStepCount(rawStepData);
//         });
//       })
//       .catch((error) => {
//         console.log(error);
//         setConnectionStatus("Error in Connection");
//       });
//   };

//   useEffect(() => {
//     const subscription = bleManager.onDeviceDisconnected(
//       deviceID,
//       (error, device) => {
//         if (error) {
//           console.log("Disconnected with error:", error);
//         }
//         setConnectionStatus("Disconnected");
//         console.log("Disconnected device");
//         setStepCount(0); // Reset the step count
//         if (deviceRef.current) {
//           setConnectionStatus("Reconnecting...");
//           connectToDevice(deviceRef.current)
//             .then(() => setConnectionStatus("Connected"))
//             .catch((error) => {
//               console.log("Reconnection failed: ", error);
//               setConnectionStatus("Reconnection failed");
//             });
//         }
//       }
//     );
//     return () => subscription.remove();
//   }, [deviceID]);

//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your apps!</Text>
//       <Text>{stepCount}</Text>
//       <Text>{connectionStatus}</Text>

//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   contentWrapper: {
//     flex: 1,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     paddingTop: 40,
//     width: "100%",
//   },
//   topTitle: {
//     paddingVertical: 20,
//     width: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   stepTitleWrapper: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(251, 151, 92, 0.5)",
//     borderRadius: 15,
//   },
//   title: {
//     fontSize: 18,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     color: "white",
//   },
//   stepWrapper: {
//     justifyContent: "center",
//     alignItems: "flex-end",
//   },
//   steps: {
//     fontSize: 48,
//     color: "white",
//     fontWeight: "bold",
//     fontFamily: "Verdana",
//   },
//   percent: {
//     fontSize: 18,
//     color: "white",
//     marginTop: 10,
//   },
//   bottomWrapper: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(251, 151, 92, 0.5)",
//     marginBottom: 20,
//     height: "15%",
//     borderRadius: 20,
//     width: "90%",
//   },
//   connectionStatus: {
//     fontSize: 20,

//     color: "white",
//     fontWeight: "bold",
//     fontFamily: "System",
//   },
// });