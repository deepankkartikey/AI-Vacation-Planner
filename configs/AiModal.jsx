import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY is not set in environment variables');
  throw new Error('Gemini API key is required. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file');
}

if (!API_KEY.startsWith('AIza')) {
  console.warn('⚠️ Gemini API key format may be incorrect. Expected format: AIza...');
  console.warn('Current key format:', API_KEY.substring(0, 10) + '...');
}

console.log('🔍 Gemini API Key validation:', {
  hasKey: !!API_KEY,
  keyFormat: API_KEY ? API_KEY.substring(0, 10) + '...' : 'Missing',
  isCorrectFormat: API_KEY?.startsWith('AIza') ? '✅' : '❌'
});

const genAI = new GoogleGenerativeAI(API_KEY);

// Try different model options in order of preference
const AVAILABLE_MODELS = [
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro', 
  'gemini-pro',
  'gemini-pro-latest'
];

let model;
let modelName = 'gemini-pro'; // fallback

// Function to test and select working model
const initializeModel = () => {
  try {
    // For now, use gemini-pro as it's most stable
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    modelName = 'gemini-pro';
    console.log('✅ Using Gemini model:', modelName);
    return model;
  } catch (error) {
    console.error('❌ Error initializing model:', error);
    throw error;
  }
};

model = initializeModel();
  
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

// Create a fresh chat session without history to avoid model conflicts
export const chatSession = model.startChat({
    generationConfig,
    history: [] // Empty history to start fresh
  });

 