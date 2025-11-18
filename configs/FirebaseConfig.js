// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBK45T2SDNvHMhhmDqqAcKgP_Gn56m-eb4",
  authDomain: "ai-trip-planner-a205e.firebaseapp.com",
  projectId: "ai-trip-planner-a205e",
  storageBucket: "ai-trip-planner-a205e.appspot.com",
  messagingSenderId: "860438279564",
  appId: "1:860438279564:web:5d07002ff7b972ba1152a9",
  measurementId: "G-QK5LHRSENP"
};

// Initialize Firebase app (only once)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  // Always try to initialize with AsyncStorage first
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    // If already initialized, get the existing auth instance
    auth = getAuth(app);
    console.log('✅ Firebase Auth instance retrieved (already initialized with default persistence)');
    console.log('⚠️  Note: Auth was initialized elsewhere without AsyncStorage. Consider moving Firebase initialization earlier.');
  } else {
    // Some other error occurred
    console.error('❌ Firebase Auth initialization error:', error);
    throw error;
  }
}

export { auth };
export const db = getFirestore(app);
