#!/bin/bash

# AI Vacation Planner - Development Server Launcher
# This script handles file descriptor limits and starts the Expo development server

echo "🔧 Configuring file descriptor limits..."

# Set maximum file descriptor limits
ulimit -n 200000

echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache
rm -rf .expo

echo "📱 Starting Expo development server..."

# Start Expo with minimal options to reduce file watching
EXPO_NO_DOTENV=1 npx expo start --clear

echo "✅ Development server ready!"
echo "Press 'i' to launch iOS simulator"