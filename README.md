
# AI Vacation Planner

This project is a mobile app created using React Native (Expo), integrated with Google Gemini API, Google Places API, and Firebase. The app allows users to create a vacation itinerary by providing their destination, number of days, number of people, and budget.

## Features

- **User Authentication:** Firebase authentication is used for SignUp/SignIn.
- **Create Vacation Itineraries:** Users can input their destination, number of days, number of people, and budget to create custom itineraries.
- **Location Autocomplete:** Utilizes the Google Places API for destination search suggestions as the user types.
- **AI Itinerary Generation:** Uses Google Gemini API to generate an itinerary based on the user's input.
- **Data Storage:** Firebase Firestore is used to store users' searched results and created itineraries.

## Technologies Used

- **React Native (Expo):** For building the mobile app.
- **Google Places API:** For destination autocomplete functionality.
- **Google Gemini API:** For AI-driven itinerary creation.
- **Firebase:** For authentication (SignUp/SignIn) and data storage (itineraries and search results).

## Application Design 

[Checkout the Application Design Here](https://app.eraser.io/workspace/hBYDX9l1imG3v5oycMZR?origin=share)

## App [Screenshots](./screenshots/)

## Getting Started

Follow the steps below to run the project locally.

### Prerequisites

- **Node.js** (v18 or higher) and **npm** should be installed on your machine.
- **iOS Simulator** (macOS only) or **Android Studio** for mobile testing.
- **Expo Go** app on your physical device (optional).

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your API keys in `.env`:**
   ```bash
   # Google Maps API Key (required for location search)
   EXPO_PUBLIC_GOOGLE_MAP_KEY=your_google_maps_api_key_here
   
   # Google Gemini AI API Key (required for AI itinerary generation)
   GEMINI_MODEL_API_KEY=your_gemini_ai_api_key_here
   
   # Firebase Configuration (optional for authentication)
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Get API Keys:**
   - **Google Maps:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **Google Gemini AI:** [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Firebase:** [Firebase Console](https://console.firebase.google.com/)

### Development Commands

#### **🚀 Primary Development Command (Recommended)**
```bash
npm run dev
```
Starts the development server with the latest Expo CLI, clears cache, and ensures Node.js v25+ compatibility.

#### **📱 Platform-Specific Commands**
```bash
npm run ios          # Start and open iOS simulator
npm run android      # Start and open Android emulator  
npm run web          # Start web development server
npm start            # Original start command
```

#### **🛠️ Utility Commands**
```bash
npm run install-clean    # Clean install dependencies
npm run reset-project    # Reset project to initial state
npm test                 # Run tests with Jest
npm run lint             # Run ESLint code checking
```

### Running the App

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Choose your testing method:**
   - **iOS Simulator:** Press `i` in the terminal or run `npm run ios`
   - **Android Emulator:** Press `a` in the terminal or run `npm run android`  
   - **Web Browser:** Press `w` in the terminal or run `npm run web`
   - **Physical Device:** Scan the QR code with Expo Go app

3. **Development Tips:**
   - Press `r` to reload the app
   - Press `m` to open developer menu
   - Press `j` to open debugger
   - Press `?` to see all available commands

### Troubleshooting

If you encounter issues:

- **File descriptor limit errors (macOS):** Restart your terminal and VS Code
- **Node.js compatibility issues:** Use `npm run dev` instead of `expo start`
- **Cache issues:** The dev command automatically clears cache, or manually run with `--clear` flag
- **Simulator not opening:** Ensure Xcode is installed (iOS) or Android Studio (Android)

## Disclaimer

For now, the API keys (Google Places, Google Gemini, and Firebase) are available in the repository so that the project can be run smoothly for viewing purposes. These keys will be removed soon, so please note that future commits may require you to provide your own API keys.
