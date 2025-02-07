import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import base64 from 'base-64'; // Import base64 library
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation, route }) => {
  const [userName, setUserName] = useState('');
  const [streak, setStreak] = useState(0); // Added streak state
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64Str = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = base64.decode(base64Str);
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  };

  const fetchStreak = async (token) => {
    try {
      const response = await fetch('https://nick-8.com/api/user/streak', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setStreak(data.streak);
      } else {
        console.error('Failed to fetch streak:', data.error);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        let token = route.params?.token;

        if (token) {
          await SecureStore.setItemAsync('token', token);
        } else {
          token = await SecureStore.getItemAsync('token');
        }

        if (token) {
          let decodedToken;
          try {
            decodedToken = decodeJWT(token);
          } catch (error) {
            await SecureStore.deleteItemAsync('token');
            navigation.replace('Login');
            setIsLoading(false);
            return;
          }

          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            await SecureStore.deleteItemAsync('token');
            navigation.replace('Login');
          } else {
            setUserName(decodedToken.name || decodedToken.email || 'User');
            await fetchStreak(token); // Fetch streak
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        navigation.replace('Login');
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused) {
      getUserData();
    }
  }, [isFocused, route.params]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/homescreen.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Welcome {userName} to Nick8</Text>
        <Text style={styles.streakText}>Current Streak: {streak} days</Text>

        {/* Log Food Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LogChoiceScreen')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Log Food</Text>
        </TouchableOpacity>

        {/* Food Log Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('HistoryScreen')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Food Log</Text>
        </TouchableOpacity>

        {/* Badges Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BadgesScreen')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>View Badges</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  button: {
    width: 200,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 150, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  }
});

export default HomeScreen;
