import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import config from '../../config/config.js';
import * as WebBrowser from 'expo-web-browser';
// No need to import Linking and SecureStore here since deep linking is handled in App.js

const Login = () => {
  const handleGoogleSignIn = async () => {
    try {
      const authUrl = `${config.SERVER_URL}/auth/google/mobile`;

      // Open the authentication URL in the system's browser
      await WebBrowser.openAuthSessionAsync(authUrl);

      // No need to handle the result here; the deep link listener in App.js will manage the redirect
    } catch (error) {
      console.log(`An error occurred: ${error.message}`);
    }
  };

  return (
    <ImageBackground source={require('../assets/nick8mob.png')} style={styles.backgroundImage}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Nick8</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  loginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 36,
    color: 'rgb(88, 255, 249)',
    textShadowColor: '#000',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#00b4d8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Login;
