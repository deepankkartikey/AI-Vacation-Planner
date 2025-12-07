// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

// Only import React Native specific modules on native platforms
let getReactNativePersistence, AsyncStorage;
if (Platform.OS !== 'web') {
  const authModule = require('firebase/auth');
  getReactNativePersistence = authModule.getReactNativePersistence;
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// Environment configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingVars);
  throw new Error(
    `Firebase configuration error: Missing environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set.'
  );
}

// Debug logging (only in development)
if (__DEV__) {
  console.log('🔥 Firebase Debug:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
    allConfigured: missingVars.length === 0
  });
}

// Initialize Firebase app (only once)
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    if (__DEV__) {
      console.log('✅ Firebase app initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase app initialization failed:', error);
    throw error;
  }
} else {
  app = getApps()[0];
  if (__DEV__) {
    console.log('📱 Using existing Firebase app instance');
  }
}

// Initialize Auth with platform-specific persistence
let auth;
try {
  // Use browser persistence for web, AsyncStorage for native
  const persistenceConfig = Platform.OS === 'web' 
    ? { persistence: browserLocalPersistence }
    : { persistence: getReactNativePersistence(AsyncStorage) };
    
  auth = initializeAuth(app, persistenceConfig);
  if (__DEV__) {
    console.log(`✅ Firebase Auth initialized with ${Platform.OS === 'web' ? 'browser' : 'AsyncStorage'} persistence`);
  }
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    if (__DEV__) {
      console.log('📱 Using existing Firebase Auth instance');
    }
  } else {
    console.error('❌ Firebase Auth initialization error:', error);
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage, app };
