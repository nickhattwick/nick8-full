// FoodLogScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FoodLogScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Button title="Take a Photo" onPress={() => navigation.navigate('CameraScreen')} />
      <Button title="Upload a Photo" onPress={() => {/* Handle photo upload */}} />
      <Button title="Enter Details" onPress={() => navigation.navigate('TextEntryScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FoodLogScreen;
