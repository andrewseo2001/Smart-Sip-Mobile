import { PermissionsAndroid } from "react-native";
import { BleManager } from "react-native-ble-plx";

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
            title: "Scan Permission",
            message: "App requires Bluetooth connecting",
            buttonPositive: "Ok",
            });

        // const bluetoothCoarseLocationPermission = await PermissionsAndroid.request(
        //     PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        //     {
        //     title: "Location permission for bluetooth scanning",
        //     message: "Grant permission to allow the app to scan for Bluetooth devices",
        //     buttonNeutral: "Ask Me Later",
        //     buttonNegative: "Cancel",
        //     buttonPositive: "Ok",
        //     });

        const bluetoothFineLocation = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
            title: "Scan Permission",
            message: "App requires Bluetooth scanning",
            buttonPositive: "Ok",
            });
 
        if (bluetoothScanPermission == "granted" &&
            bluetoothConnectPermission == "granted" &&
            bluetoothFineLocation == "granted"){
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