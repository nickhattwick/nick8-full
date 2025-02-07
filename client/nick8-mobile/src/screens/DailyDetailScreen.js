import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const DailyDetailScreen = ({ route }) => {
  const { date } = route.params;
  const [currentDate, setCurrentDate] = useState(date);
  const [foodItems, setFoodItems] = useState([]);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    fetchDailyDetails();
  }, [currentDate]);

  const fetchDailyDetails = async () => {
    try {
      // Retrieve token from SecureStore
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        console.warn('No token found');
        navigation.replace('Login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(
        `https://nick-8.com/api/food-entries/daily`,
        {
          params: { date: currentDate },
          headers,
        }
      );
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching daily details:', error);
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access
        navigation.replace('Login');
      }
    }
  };

  const renderFoodItem = ({ item }) => {
    const nutritionFacts = item.NutritionFacts || {};

    const calories = parseFloat(nutritionFacts.calories) || 0;
    const protein = parseFloat(nutritionFacts.protein) || 0;
    const carbs = parseFloat(nutritionFacts.carbs) || 0;
    const fats = parseFloat(nutritionFacts.fats) || 0;

    return (
      <View style={styles.foodItem}>
        <Text style={styles.foodName}>{item.FoodName || 'Unknown Food'}</Text>
        <Text>Calories: {calories.toFixed(2)} kcal</Text>
        <Text>Protein: {protein.toFixed(2)} g</Text>
        <Text>Carbs: {carbs.toFixed(2)} g</Text>
        <Text>Fats: {fats.toFixed(2)} g</Text>
      </View>
    );
  };

  const navigateToPreviousDay = () => {
    const previousDate = moment(currentDate)
      .subtract(1, 'days')
      .format('YYYY-MM-DD');
    setCurrentDate(previousDate);
  };

  const navigateToNextDay = () => {
    const nextDate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
    setCurrentDate(nextDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Food Log for {currentDate}</Text>
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.EntryId}
        renderItem={renderFoodItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No food entries for this day.</Text>
        }
      />
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={navigateToPreviousDay}
        >
          <Text style={styles.navButtonText}>Previous Day</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={navigateToNextDay}>
          <Text style={styles.navButtonText}>Next Day</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Weekly View</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2b2b2b',
  },
  foodItem: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#999',
  },
});

export default DailyDetailScreen;
