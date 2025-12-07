import 'react-native-get-random-values'; // Must be imported before any crypto operations
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, useSegments } from "expo-router";
import {CreateTripContext} from '../context/CreateTripContext'
import { useState, useEffect } from "react";
import { LogBox, Linking, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Suppress specific warnings from third-party libraries
LogBox.ignoreLogs([
  'Warning: Day: Support for defaultProps will be removed',
  'Warning: DaysGridView: Support for defaultProps will be removed',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

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

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      console.log('Deep link received:', url);
      
      if (url) {
        // Parse the URL
        const route = url.replace(/.*?:\/\//g, '');
        const id = route.match(/trip-details\?trip=(.+)/)?.[1];
        
        if (id) {
          try {
            const decodedTrip = decodeURIComponent(id);
            router.push(`/trip-details?trip=${decodedTrip}`);
          } catch (error) {
            console.error('Error handling deep link:', error);
          }
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CreateTripContext.Provider value={{tripData,setTripData}}>
        <Stack screenOptions={{
          headerShown:false
        }}>
          <Stack.Screen name="(tabs)"/>
        </Stack>
      </CreateTripContext.Provider>
    </GestureHandlerRootView>
  );
}
