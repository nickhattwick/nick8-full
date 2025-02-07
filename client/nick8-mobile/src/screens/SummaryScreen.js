// SummaryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SummaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Log Summary</Text>
      {/* Display summaries here */}
      <Text>Today: 2000 kcal</Text>
      <Text>This Week: 15000 kcal</Text>
      <Text>This Month: 60000 kcal</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SummaryScreen;
