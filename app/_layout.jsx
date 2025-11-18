import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from "expo-router";
import {CreateTripContext} from '../context/CreateTripContext'
import { useState, useEffect } from "react";

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
