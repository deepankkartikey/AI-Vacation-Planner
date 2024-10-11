// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
