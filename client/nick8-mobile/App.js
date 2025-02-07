import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Removed unnecessary imports
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from './src/screens/Login';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import FoodLogScreen from './src/screens/FoodLogScreen';
import TextEntryScreen from './src/screens/TextEntryScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import DetailScreen from './src/screens/DetailScreen';
import DailyDetailScreen from './src/screens/DailyDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LogChoiceScreen from './src/screens/LogChoiceScreen';
import DescribeMealScreen from './src/screens/DescribeMealScreen';
import VoiceLogScreen from './src/screens/VoiceLogScreen';
import BadgesScreen from './src/screens/BadgesScreen';

const Stack = createStackNavigator();

function App() {
  const navigationRef = useRef();

  // Linking configuration
  const linking = {
    prefixes: ['nk8://'],
    config: {
      screens: {
        Login: 'login',
        Home: {
          path: 'home',
          parse: {
            token: (token) => token,
          },
        },
        DetailScreen: 'detail',
        DailyDetailScreen: 'daily-detail',
        CameraScreen: 'camera',
        NutritionScreen: 'nutrition',
        FoodLog: 'food-log',
        TextEntryScreen: 'text-entry',
        SummaryScreen: 'summary',
        HistoryScreen: 'history',
        LogChoiceScreen: 'log-choice',
        VoiceLogScreen: 'voice-log',
        DescribeMealScreen: 'describe-meal',
        // Add paths for other screens if needed
      },
    },
  };

  return (
    <>
      <StatusBar hidden={true} />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DetailScreen" component={DetailScreen} />
            <Stack.Screen
              name="DailyDetailScreen"
              component={DailyDetailScreen}
            />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen
              name="NutritionScreen"
              component={NutritionScreen}
            />
            <Stack.Screen name="FoodLog" component={FoodLogScreen} />
            <Stack.Screen
              name="TextEntryScreen"
              component={TextEntryScreen}
            />
            <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
            <Stack.Screen
              name="LogChoiceScreen"
              component={LogChoiceScreen}
            />
            <Stack.Screen name="VoiceLogScreen" component={VoiceLogScreen} />
            <Stack.Screen
              name="DescribeMealScreen"
              component={DescribeMealScreen}
            />
            <Stack.Screen name="BadgesScreen" component={BadgesScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
