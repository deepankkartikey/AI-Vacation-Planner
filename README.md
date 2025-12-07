
# AI Vacation Planner

This project is a mobile app created using React Native (Expo), integrated with Google Gemini API, Google Places API, and Firebase. The app allows users to create a vacation itinerary by providing their destination, number of days, number of people, and budget.

## Features

- **User Authentication:** Firebase authentication is used for SignUp/SignIn.
- **Create Vacation Itineraries:** Users can input their destination, number of days, number of people, and budget to create custom itineraries.
- **Location Autocomplete:** Utilizes the Google Places API for destination search suggestions as the user types.
- **AI Itinerary Generation:** Uses Google Gemini API to generate an itinerary based on the user's input.
- **Data Storage:** Firebase Firestore is used to store users' searched results and created itineraries.

## Technologies Used

- **React Native (Expo SDK 51):** For building the mobile app with modern features.
- **Google Places API:** For destination autocomplete functionality.
- **Google Gemini AI:** For AI-driven itinerary creation.
- **Firebase v11:** For authentication (SignUp/SignIn) with AsyncStorage persistence and Firestore data storage.
- **TypeScript:** For type safety and better development experience.
- **Expo Router:** For navigation and routing.

## Technical Highlights

- ✅ **Zero Security Vulnerabilities:** All dependencies updated and secure
- ✅ **Node.js v25 Compatible:** Works with latest Node.js versions
- ✅ **Firebase AsyncStorage Integration:** Persistent authentication across app sessions
- ✅ **Optimized Metro Bundler:** Configured for better performance and reduced file watching
- ✅ **Error Handling:** Robust error handling for API calls and data parsing
- ✅ **Development Environment:** Streamlined setup with automated cache clearing

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
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_ai_api_key_here
   
   # Firebase Configuration (optional for authentication)
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Get API Keys:**

   #### **🗺️ Google Maps API Key**
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Enable the following APIs:
      - **Maps JavaScript API**
      - **Places API (New)** - Required for autocomplete
      - **Geocoding API** - For coordinate conversion
   4. Go to **APIs & Services → Credentials**
   5. Click **"Create Credentials" → "API key"**
   6. **Important:** Set up API key restrictions:
      - Application restrictions: Choose "HTTP referrers" for web or "Android/iOS apps" for mobile
      - API restrictions: Select only the APIs listed above
   7. **Enable billing** on your project (required for Places API)
   8. Copy your API key to `EXPO_PUBLIC_GOOGLE_MAP_KEY`

   #### **🤖 Google Gemini AI API Key**
   1. Go to [Google AI Studio](https://aistudio.google.com/)
   2. Sign in with your Google account
   3. Click **"Get API Key"** in the top menu
   4. Click **"Create API Key"**
   5. Choose **"Create API key in new project"** or select an existing project
   6. Copy your API key to `EXPO_PUBLIC_GEMINI_API_KEY`
   7. **Note:** Free tier includes generous limits for testing and development

   #### **💰 API Costs & Limits**
   
   **Google Maps APIs:**
   - **Free tier:** $200 credit per month (typically covers 28,000+ map loads or 17,000+ place searches)
   - **Places API:** ~$0.032 per autocomplete session
   - **Billing required** but you can set usage limits to avoid unexpected charges
   
   **Google Gemini AI:**
   - **Free tier:** 15 requests per minute, 1,500 requests per day
   - **Gemini 1.5 Flash:** Free up to rate limits, then pay-per-use
   - Very generous for development and small-scale apps
   
   **Firebase:**
   - **Authentication:** 50,000 monthly active users free
   - **Firestore:** 50,000 reads, 20,000 writes, 20,000 deletes per day free
   - **Hosting:** 10 GB bandwidth per month free

   #### **🔥 Firebase Configuration (Optional but Recommended)**
   1. Go to [Firebase Console](https://console.firebase.google.com/)
   2. Click **"Add project"** or select existing project
   3. Set up **Authentication**:
      - Go to **Authentication → Sign-in method**
      - Enable **"Email/Password"** provider
   4. Set up **Firestore Database**:
      - Go to **Firestore Database → Create database**
      - Choose **"Start in test mode"** for development
   5. Get your config:
      - Go to **Project Settings → General → Your apps**
      - Click **"Add app"** → **"Web app"**
      - Copy the configuration values to your `.env` file
   6. **Security Rules:** Update Firestore rules for production:
      ```javascript
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /{document=**} {
            allow read, write: if request.auth != null;
          }
        }
      }
      ```

### Development Commands

#### **🚀 Primary Development Command (Recommended)**
```bash
npm run dev
```
Starts the web development server with the latest Expo CLI, clears cache, and ensures optimal development experience.

#### **📱 Platform-Specific Commands**
```bash
npm run dev-native       # Start native development server (iOS/Android)
npm run dev-optimized    # Optimized dev server with file descriptor handling (macOS)
npm run ios              # Start and open iOS simulator with cache clearing
npm run android          # Start and open Android emulator with cache clearing
npm run web              # Start web development server with cache clearing
npm start                # Original start command
```

#### **🛠️ Utility Commands**
```bash
npm run install-clean    # Clean install dependencies
npm run reset-project    # Reset project to initial state
npm run fix-calendar     # Fix calendar picker issues
npm run test-gemini      # Test Gemini API configuration
npm test                 # Run tests with Jest
npm run lint             # Run ESLint code checking
```

### Running the App

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Choose your testing method:**
   - **Web Browser (Default):** Automatically opens at http://localhost:8082
   - **iOS Simulator:** Run `npm run ios` or press `i` in the terminal
   - **Android Emulator:** Run `npm run android` or press `a` in the terminal
   - **Physical Device:** Run `npm run dev-native` and scan QR code with Expo Go app

3. **Development Tips:**
   - Web version provides fastest development cycle and debugging
   - Press `r` to reload the app
   - Press `m` to open developer menu
   - Press `j` to open debugger
   - Press `?` to see all available commands

### Troubleshooting

#### **🔧 General Issues**
If you encounter issues:

- **File descriptor limit errors (macOS):** Restart your terminal and VS Code
- **Node.js compatibility issues:** Use `npm run dev` instead of `expo start`
- **Cache issues:** The dev command automatically clears cache, or manually run with `--clear` flag
- **Simulator not opening:** Ensure Xcode is installed (iOS) or Android Studio (Android)

#### **🔑 API Key Issues**

**Google Places Autocomplete not working:**
- Verify `EXPO_PUBLIC_GOOGLE_MAP_KEY` is set in `.env`
- Ensure **Places API (New)** is enabled in Google Cloud Console
- Check that **billing is enabled** on your Google Cloud project
- Verify API key has proper restrictions (don't over-restrict during development)
- Error message about billing? Enable billing at https://console.cloud.google.com/billing

**Trip generation failing:**
- Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set in `.env`
- Check console for quota exceeded errors
- Gemini free tier has rate limits - wait a few minutes if exceeded
- Ensure your Gemini API key is from Google AI Studio, not Google Cloud

**Authentication issues:**
- Verify all Firebase config variables are set in `.env`
- Check Firebase console for project setup completion
- Ensure Authentication and Firestore are enabled in Firebase console
- For iOS/Android, add your app's bundle ID to Firebase project settings

**Environment variables not loading:**
- All client-side variables must start with `EXPO_PUBLIC_`
- Restart development server after changing `.env` file
- Use `console.log(process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY)` to debug
- Ensure `.env` file is in the root directory (same level as `package.json`)

## Firebase Hosting

The app is deployed and accessible at:
**🌐 [https://ai-vacation-planner-f40c0.web.app](https://ai-vacation-planner-f40c0.web.app)**

### Deploy Updates
```bash
# Export web build
npx expo export --platform web

# Deploy to Firebase
firebase deploy --only hosting
```

## Disclaimer

For now, the API keys (Google Places, Google Gemini, and Firebase) are available in the repository so that the project can be run smoothly for viewing purposes. These keys will be removed soon, so please note that future commits may require you to provide your own API keys.
