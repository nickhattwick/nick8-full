import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Platform } from 'react-native';

const NutritionScreen = ({ route }) => {
  const { data: nutritionDataList, explanation } = route.params;
  const [dataList, setDataList] = useState(
    nutritionDataList.map((item) => ({
      ...item,
      dateTime: new Date(),
    }))
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false); // Modal visibility state
  const [selectedIndex, setSelectedIndex] = useState(null); // Index of the selected item for the picker
  const navigation = useNavigation();

  const showPicker = (index) => {
    setSelectedIndex(index);
    setPickerVisible(true);
  };
  
  const hidePicker = () => {
    setPickerVisible(false);
    setSelectedIndex(null);
  };
  
  const handleConfirm = (selectedDate) => {
    if (selectedIndex !== null) {
      setDataList((prev) =>
        prev.map((item, i) =>
          i === selectedIndex ? { ...item, dateTime: selectedDate } : item
        )
      );
    }
    hidePicker();
  };

  const renderExplanation = (text) => {
    const parts = text
      .split(/(\*\*.*?\*\*|```json[\s\S]*?```)/g)
      .map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={styles.bold}>
              {part.replace(/\*\*/g, '')}
            </Text>
          );
        } else if (part.startsWith('```json') && part.endsWith('```')) {
          return (
            <Text key={index} style={styles.codeBlock}>
              {part.replace(/```json|```/g, '')
              }</Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      });
    return parts;
  };

  const updateStreakAndBadges = async () => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in.');
      navigation.replace('Login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let newStreak = 0;
    let streakUpdatedToday = false;

    try {
      // Fetch current streak
      const streakResponse = await axios.get('https://nick-8.com/api/user/streak', { headers });
      const { streak, lastUpdated } = streakResponse.data;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      if (lastUpdated === today) {
        streakUpdatedToday = true;
        newStreak = streak;
      } else if (lastUpdated === yesterdayString) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }

      // Update streak only if it hasn't been updated today
      if (!streakUpdatedToday) {
        await axios.post(
          'https://nick-8.com/api/user/update-streak',
          { streak: newStreak },
          { headers }
        );
      }
    } catch (error) {
      console.error('Error fetching or updating streak:', error.response?.data || error.message);
      newStreak = 0; // Default streak in case of error
    }

    // Streak badge thresholds
    const streakBadges = [
      { threshold: 7, badge: 'Solar Spark' },
      { threshold: 30, badge: 'Lunar Cycle' },
      { threshold: 100, badge: 'Aurora Glow' },
      { threshold: 180, badge: 'Sustained Radiance' },
      { threshold: 365, badge: 'Eternal Light' },
    ];

    // Check and add streak badges
    for (const { threshold, badge } of streakBadges) {
      if (newStreak === threshold) {
        try {
          await axios.post(
            'https://nick-8.com/api/user/add-badge',
            { badge },
            { headers }
          );
        } catch (error) {
          console.error(`Failed to add badge ${badge}:`, error.response?.data || error.message);
        }
      }
    }

    // Fetch current badges
    const badgeResponse = await axios.get('https://nick-8.com/api/user/badges', { headers });
    const currentBadges = badgeResponse.data.badges || [];

    // Fetch total logs
    const countResponse = await axios.get('https://nick-8.com/api/user/log-count', { headers });
    const totalLogs = countResponse.data.totalLogs;

    // Food log badge thresholds
    const foodLogBadges = [
      { threshold: 1, badge: 'First Bite' },
      { threshold: 10, badge: 'Tasty Ten' },
      { threshold: 25, badge: 'Fresh Twenty-Five' },
      { threshold: 50, badge: 'Harvest Feast' },
      { threshold: 100, badge: 'Bounty of 100' },
    ];

    // Check and add food log badges
    for (const { threshold, badge } of foodLogBadges) {
      if (totalLogs === threshold && !currentBadges.includes(badge)) {
        try {
          await axios.post(
            'https://nick-8.com/api/user/add-badge',
            { badge },
            { headers }
          );
        } catch (error) {
          console.error(`Failed to add badge ${badge}:`, error.response?.data || error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error updating streak or badges:', error.response?.data || error.message);
    Alert.alert('Error', 'Failed to update streak or badges.');
  }
};

  const logFood = async (item, index) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to log food.');
        navigation.replace('Login');
        return;
      }
  
      const headers = { Authorization: `Bearer ${token}` };
  
      // Log food entry
      const response = await axios.post(
        'https://nick-8.com/api/log-food',
        {
          foodName: item.foodName,
          ingredients: [],
          nutritionFacts: item,
          dateTime: item.dateTime.toISOString(),
        },
        { headers }
      );
  
      if (response.data.message) {
        Alert.alert('Success', `${item.foodName} logged successfully!`);
        setDataList((prev) =>
          prev.map((d, i) => (i === index ? { ...d, logged: true } : d))
        );
        await axios.post('https://nick-8.com/api/user/increment-log-count', {}, { headers });
        await updateStreakAndBadges();
      } else {
        Alert.alert('Error', 'Failed to log food.');
      }
    } catch (error) {
      console.error('Error logging food:', error);
      Alert.alert('Error', 'Failed to log food.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nutrition Facts</Text>
      <View style={styles.divider} />

      {/* Explanation Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalText}>{renderExplanation(explanation)}</Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </ScrollView>
      </Modal>

      {/* Render each nutrition item */}
      {dataList.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Date & Time:</Text>
            <Button
              title={item.dateTime.toLocaleString()}
              onPress={() => showPicker(index)} // Open the picker for this item
            />
          </View>

          <DateTimePickerModal
            isVisible={isPickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hidePicker}
          />

          <Text style={styles.foodName}>{item.foodName || 'Unnamed Food'}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Serving Size:</Text>
            <TextInput
              style={styles.textInput}
              value={item.servingSize || ''}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) => (i === index ? { ...d, servingSize: text } : d))
                )
              }
              placeholder="Serving Size"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Calories:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.calories || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, calories: parseInt(text, 10) } : d
                  )
                )
              }
              placeholder="Calories"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Total Fat:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.totalFat || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, totalFat: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Total Fat"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Saturated Fat:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.saturatedFat || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, saturatedFat: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Saturated Fat"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Trans Fat:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.transFat || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, transFat: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Trans Fat"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Cholesterol:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.cholesterol || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, cholesterol: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Cholesterol"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Sodium:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.sodium || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, sodium: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Sodium"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Total Carbohydrate:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.totalCarbohydrate || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index
                      ? { ...d, totalCarbohydrate: parseFloat(text) }
                      : d
                  )
                )
              }
              placeholder="Total Carbohydrate"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Dietary Fiber:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.dietaryFiber || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, dietaryFiber: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Dietary Fiber"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Total Sugars:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.totalSugars || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, totalSugars: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Total Sugars"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Added Sugars:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.addedSugars || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, addedSugars: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Added Sugars"
            />
          </View>
      
          <View style={styles.row}>
            <Text style={styles.label}>Protein:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(item.protein || '')}
              onChangeText={(text) =>
                setDataList((prev) =>
                  prev.map((d, i) =>
                    i === index ? { ...d, protein: parseFloat(text) } : d
                  )
                )
              }
              placeholder="Protein"
            />
          </View>

          <Button
            title={item.logged ? 'Logged' : 'Log Food'}
            disabled={item.logged}
            onPress={() => logFood(item, index)}
          />
        </View>
      ))}

      <Button title="See Explanation" onPress={() => setModalVisible(true)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  itemContainer: {
    marginVertical: 8,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'white',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default NutritionScreen;