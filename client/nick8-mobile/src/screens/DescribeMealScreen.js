import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { OPENAI_API_KEY } from '@env';

// Use the API key in your request
const apiKey = OPENAI_API_KEY;

const DescribeMealScreen = () => {
  const [mealDescription, setMealDescription] = useState('');
  const navigation = useNavigation();

  const analyzeMeal = async () => {
    if (!mealDescription.trim()) {
      Alert.alert('Error', 'Please describe your meal.');
      return;
    }

    try {
      const prompt = `Analyze the food described in this text: "${mealDescription}" and provide an explanation of the nutrition facts followed by a JSON object in the form of a list of objects of the following structure:
      {
        "foodName": "string",
        "servingSize": "string",
        "calories": "number",
        "totalFat": "number",
        "saturatedFat": "number",
        "transFat": "number",
        "cholesterol": "number",
        "sodium": "number",
        "totalCarbohydrate": "number",
        "dietaryFiber": "number",
        "totalSugars": "number",
        "addedSugars": "number",
        "protein": "number"
      }
      Nutrition facts should be based on the described quantity of food rather than a serving size.`;

      const requestBody = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      };

      const openAiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = openAiResponse.data.choices[0].message.content;

      // Extract the JSON part from the content
      const jsonString = content.match(/```json([\s\S]*?)```/);
      if (jsonString && jsonString[1]) {
        const nutritionDataList = JSON.parse(jsonString[1].trim());

        // Validate the parsed data
        if (Array.isArray(nutritionDataList)) {
          console.log('Parsed Nutrition Data List:', nutritionDataList);

          // Navigate to NutritionScreen with the structured data
          navigation.navigate('NutritionScreen', { data: nutritionDataList, explanation: content });
        } else {
          console.error('Parsed data is not an array:', nutritionDataList);
          Alert.alert('Error', 'Invalid nutrition data format. Please try again.');
        }
      } else {
        console.error('JSON not found in response:', content);
        Alert.alert('Error', 'Failed to analyze meal. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      } else if (error.request) {
        console.error('Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      Alert.alert('Error', 'Failed to analyze meal. Please try again.');
    }
  };

  return (
    <ImageBackground source={require('../assets/foodlogscreen.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Describe Your Meal</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your meal description"
          value={mealDescription}
          onChangeText={setMealDescription}
          multiline={true}
        />
        <Button title="Analyze Meal" onPress={analyzeMeal} />
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
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default DescribeMealScreen;
