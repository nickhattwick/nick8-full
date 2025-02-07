import React from 'react';
import { Button, View, Text, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { OPENAI_API_KEY } from '@env';

// Use the API key in your request
const apiKey = OPENAI_API_KEY;

const PendingView = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

const CameraScreen = () => {
  const navigation = useNavigation();

  const takePicture = async (camera) => {
    try {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);

      // Update the prompt to ask for an explanation followed by a single nutrition label in JSON format
      const prompt = `Analyze the food items in this image and provide an explanation of the nutrition facts, followed by a JSON object in the form of a list of objects of the following structure:
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
Nutrition facts should be based on the quantity of food in the image rather than a serving size, assume I ate everything in an image unless otherwise specified.`;

      const requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${data.base64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
      };

      // Send the image to OpenAI's API for analysis
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

      // Log the response data
      console.log('OpenAI Response:', openAiResponse.data);
      const content = openAiResponse.data.choices[0].message.content;

      // Extract the JSON part from the content
      const jsonString = content.match(/```json([\s\S]*?)```/);
      if (jsonString && jsonString[1]) {
        const nutritionDataList = JSON.parse(jsonString[1].trim()); // Parse the list of nutrition data objects
      
        // Log the parsed data
        console.log('Parsed Nutrition Data List:', nutritionDataList);
      
        // Navigate to NutritionScreen with the structured nutrition data list and explanation
        navigation.navigate('NutritionScreen', { data: nutritionDataList, explanation: content });
      } else {
        console.error('JSON not found in the response content.');
        Alert.alert('Error', 'No valid nutrition data found. Please try again.');
      }

    } catch (error) {
      // Enhanced error handling with detailed logging
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      console.error('Config:', error.config);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    }
  };

  return (
    <RNCamera
      style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
      type={RNCamera.Constants.Type.back}
      captureAudio={false}
    >
      {({ camera, status }) => {
        if (status !== 'READY') return <PendingView />;
        return (
          <Button title="Take Photo" onPress={() => takePicture(camera)} />
        );
      }}
    </RNCamera>
  );
};

export default CameraScreen;
