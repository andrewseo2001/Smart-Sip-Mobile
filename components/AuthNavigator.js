// AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import CreateAccountScreen from './CreateAccountScreen';
import MainScreen from './MainScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AuthNavigator;
