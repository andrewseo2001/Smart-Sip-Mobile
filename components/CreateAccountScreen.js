import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const CreateAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation(); // Use the useNavigation hook

  const handleCreateAccount = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account created successfully");
      await signOut(auth);
      navigation.navigate('Login'); // Navigates back to the Login screen

    } catch (error) {
      console.log("Account creation failed", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <Button title="Create Account" onPress={handleCreateAccount} />
      {/* Add a button to go back to the main screen */}
      <Button title="Back to Main Screen" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default CreateAccountScreen;
