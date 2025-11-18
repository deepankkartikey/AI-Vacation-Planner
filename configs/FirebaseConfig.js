// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
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

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence (only if not already initialized)
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
