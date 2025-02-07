import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import moment from 'moment';

const HistoryScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../assets/historyscreen.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>History</Text>

        {/* Daily View Button */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DailyDetailScreen', { 
            date: moment().format('YYYY-MM-DD') 
          })} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Daily View</Text>
        </TouchableOpacity>

        {/* Weekly View Button */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DetailScreen', { 
            timeframe: 'weekly', 
            weekStart: moment().startOf('isoWeek').format('YYYY-MM-DD'), 
            weekEnd: moment().endOf('isoWeek').format('YYYY-MM-DD') 
          })} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Weekly View</Text>
        </TouchableOpacity>

        {/* Monthly View Button */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DetailScreen', { timeframe: 'monthly' })} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Monthly View</Text>
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

export default HistoryScreen;
