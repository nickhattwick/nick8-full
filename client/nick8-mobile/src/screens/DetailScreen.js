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

const DetailScreen = ({ route }) => {
  const { timeframe } = route.params;
  const [entries, setEntries] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [initialWeekStart, setInitialWeekStart] = useState(
    route.params.weekStart || null
  );
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    fetchDetails();
  }, [timeframe, weekOffset, monthOffset]);

  // Fetch data from backend
  const fetchDetails = async () => {
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

      let url;
      let params = {};

      if (timeframe === 'weekly') {
        const calculatedWeekStart = initialWeekStart
          ? moment(initialWeekStart)
              .add(weekOffset, 'weeks')
              .format('YYYY-MM-DD')
          : moment()
              .startOf('isoWeek')
              .add(weekOffset, 'weeks')
              .format('YYYY-MM-DD');

        const calculatedWeekEnd = moment(calculatedWeekStart)
          .endOf('isoWeek')
          .format('YYYY-MM-DD');

        url = `https://nick-8.com/api/food-entries/weekly`;
        params = {
          weekStart: calculatedWeekStart,
          weekEnd: calculatedWeekEnd,
          offset: weekOffset,
        };
      } else if (timeframe === 'monthly') {
        url = `https://nick-8.com/api/food-entries/monthly`;
        params = {
          offset: monthOffset,
        };
      } else if (timeframe === 'daily') {
        const date = route.params.date || moment().format('YYYY-MM-DD');
        url = `https://nick-8.com/api/food-entries/daily`;
        params = {
          date,
        };
      }

      console.log('Fetching details with params:', params);

      const response = await axios.get(url, { params, headers });
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access, e.g., navigate to Login
        navigation.replace('Login');
      }
    }
  };

  // Group days into weeks and calculate average calories
  const groupByWeek = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const weekStart = moment(item.date)
        .startOf('isoWeek')
        .format('YYYY-MM-DD');
      const weekEnd = moment(item.date).endOf('isoWeek').format('YYYY-MM-DD');

      if (!grouped[weekStart]) {
        grouped[weekStart] = {
          start: weekStart,
          end: weekEnd,
          totalCalories: 0,
          days: 0,
        };
      }

      grouped[weekStart].totalCalories += item.calories || 0;
      grouped[weekStart].days += 1;
    });

    // Calculate the average daily calories for each week
    return Object.values(grouped).map((week) => ({
      ...week,
      averageCalories: week.totalCalories / week.days,
    }));
  };

  const weeklyData = groupByWeek(entries);

  // Render a week item with the correct dates and average calories
  const renderWeekItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setInitialWeekStart(item.start); // Update initialWeekStart on week click
        setWeekOffset(0); // Reset offset when clicking from month view
        navigation.navigate('DetailScreen', {
          timeframe: 'weekly',
          weekStart: moment(item.start).format('YYYY-MM-DD'), // Pass the correct weekStart from the clicked week
          weekEnd: moment(item.end).format('YYYY-MM-DD'), // Pass the correct weekEnd from the clicked week
        });
      }}
    >
      <View style={styles.entry}>
        <Text>
          Week of {moment(item.start).format('MMM D')} -{' '}
          {moment(item.end).format('MMM D')}
        </Text>
        <Text>
          Average Daily Calories: {item.averageCalories.toFixed(2)} kcal
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDayItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('DailyDetailScreen', { date: item.date })
      }
    >
      <View style={styles.entry}>
        <Text>Date: {moment(item.date).format('YYYY-MM-DD')}</Text>
        <Text>Calories: {item.calories.toFixed(2)} kcal</Text>
        <Text>Protein: {item.protein.toFixed(2)} g</Text>
        <Text>Carbs: {item.carbs.toFixed(2)} g</Text>
        <Text>Fats: {item.fats.toFixed(2)} g</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {timeframe === 'monthly'
          ? `${moment(entries[0]?.date).format('MMMM YYYY')}`
          : `Week of ${moment(entries[0]?.date)
              .startOf('isoWeek')
              .format('MMM D')} - ${moment(entries[0]?.date)
              .endOf('isoWeek')
              .format('MMM D')}`}
      </Text>
      <FlatList
        data={timeframe === 'monthly' ? weeklyData : entries}
        keyExtractor={(item) => item.start || item.date}
        renderItem={timeframe === 'monthly' ? renderWeekItem : renderDayItem}
      />
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (timeframe === 'monthly') {
              setMonthOffset(monthOffset - 1); // Move to the previous month
            } else {
              setWeekOffset(weekOffset - 1); // Move to the previous week
            }
          }}
        >
          <Text style={styles.buttonText}>
            Previous {timeframe === 'monthly' ? 'Month' : 'Week'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            (weekOffset === 0 && timeframe === 'weekly') ||
            (monthOffset === 0 && timeframe === 'monthly')
              ? styles.disabledButton
              : null,
          ]}
          onPress={() => {
            if (timeframe === 'monthly') {
              setMonthOffset(monthOffset + 1); // Move to the next month
            } else {
              setWeekOffset(weekOffset + 1); // Move to the next week
            }
          }}
          disabled={
            (weekOffset === 0 && timeframe === 'weekly') ||
            (monthOffset === 0 && timeframe === 'monthly')
          }
        >
          <Text style={styles.buttonText}>
            Next {timeframe === 'monthly' ? 'Month' : 'Week'}
          </Text>
        </TouchableOpacity>
      </View>
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
  entry: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default DetailScreen;
