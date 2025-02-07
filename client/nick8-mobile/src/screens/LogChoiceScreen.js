import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const LogChoiceScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../assets/foodlogscreen.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Log Your Food</Text>

        {/* Take Photo Option */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('CameraScreen')} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {/* Describe Meal Option */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DescribeMealScreen')} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Describe Meal</Text>
        </TouchableOpacity>

        {/* Voice Log Option */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('VoiceLogScreen')} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Voice Log</Text>
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
    backgroundColor: 'rgba(0, 150, 0, 0.8)', // Solid darker green, less transparency
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
    fontWeight: 'bold', // Bold text for emphasis
    textAlign: 'center',
    backgroundColor: 'transparent', // Remove any background from the text
    paddingHorizontal: 0, // Ensure no extra padding
    paddingVertical: 0,  // Ensure no extra padding
  },
});

export default LogChoiceScreen;
