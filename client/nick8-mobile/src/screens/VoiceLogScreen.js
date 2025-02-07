import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VoiceLogScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voice Log Feature Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VoiceLogScreen;
