import 'react-native-get-random-values'; // Must be imported before any crypto operations
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from "expo-router";
import {CreateTripContext} from '../context/CreateTripContext'
import { useState, useEffect } from "react";
import { LogBox } from 'react-native';

// Suppress specific warnings from third-party libraries
LogBox.ignoreLogs([
  'Warning: Day: Support for defaultProps will be removed',
  'Warning: CalendarPicker: Support for defaultProps will be removed',
  'Warning: DaysGridView: Support for defaultProps will be removed',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

const [fontsLoaded] = useFonts({
    'outfit':require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium':require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf'),
  });

  const [tripData,setTripData]=useState([]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <CreateTripContext.Provider value={{tripData,setTripData}}>
    <Stack screenOptions={{
      headerShown:false
    }}>
    <Stack.Screen name="(tabs)"/>
    </Stack>
    </CreateTripContext.Provider>
  );
}
