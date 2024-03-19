import { getDatabase } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCIwH8fl-qcC4iqoDZD5kXQVDUPmr54tJI",
    authDomain: "smart-sip-mobile.firebaseapp.com",
    projectId: "smart-sip-mobile",
    storageBucket: "smart-sip-mobile.appspot.com",
    messagingSenderId: "533174878789",
    appId: "1:533174878789:web:1f785c1d8bc260ab4b992c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


export { app, database, auth };