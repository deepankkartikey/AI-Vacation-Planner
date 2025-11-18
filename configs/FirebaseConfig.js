// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Fallback configuration if environment variables are not loaded
const fallbackConfig = {
  apiKey: "AIzaSyCScbi6yBHawnFCUNlwDJS5CfsUiNFzl3s",
  authDomain: "ai-vacation-planner-f40c0.firebaseapp.com",
  projectId: "ai-vacation-planner-f40c0",
  storageBucket: "ai-vacation-planner-f40c0.firebasestorage.app",
  messagingSenderId: "352522558798",
  appId: "1:352522558798:web:5df69ac381e2dd628c121f",
  measurementId: "G-E29PXHL6NL"
};

// Use environment config if available, otherwise fallback
const finalConfig = firebaseConfig.apiKey ? firebaseConfig : fallbackConfig;

// Debug logging (only in development)
if (__DEV__) {
  console.log('� Firebase Debug:', {
    hasApiKey: !!finalConfig.apiKey,
    hasProjectId: !!finalConfig.projectId,
    hasAppId: !!finalConfig.appId,
    usingFallback: !firebaseConfig.apiKey
  });
}

// Initialize Firebase app (only once)
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(finalConfig);
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

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  if (__DEV__) {
    console.log('✅ Firebase Auth initialized with AsyncStorage');
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

export { auth, db, app };
