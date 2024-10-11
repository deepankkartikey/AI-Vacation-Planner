
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

## Demo 

[Link to Video Demo]()

## Getting Started

Follow the steps below to run the project locally.

### Prerequisites

- **Node.js** and **npm** should be installed on your machine.
- You should have **Expo CLI** installed globally. You can install it by running:

  ```bash
  npm install -g expo-cli
  ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/deepankkartikey/AI-Vacation-Planner.git
   ```

2. Navigate into the project directory:

   ```bash
   cd AI-Vacation-Planner
   ```

3. Install the necessary dependencies:

   ```bash
   npm install
   ```

4. Start the Expo development server:

   ```bash
   npm start -- --reset-cache
   ```

   This command will launch the Expo app, and you can either use an emulator or your physical device to run the app.

## Disclaimer

For now, the API keys (Google Places, Google Gemini, and Firebase) are available in the repository so that the project can be run smoothly for viewing purposes. These keys will be removed soon, so please note that future commits may require you to provide your own API keys.
