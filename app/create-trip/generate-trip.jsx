import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Colors } from '../../constants/Colors'
import { CreateTripContext } from '../../context/CreateTripContext'
import { AI_PROMPT } from '../../constants/Options';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './../../configs/FirebaseConfig'
import { fetchTripImages } from '../../services/TripImageService'
import ProfileService from '../../services/ProfileService'

export default function GenerateTrip() {
    const { tripData, setTripData } = useContext(CreateTripContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        // Add small delay to ensure auth state is ready
        const timer = setTimeout(() => {
            GenerateAiTrip();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [])

    const createFreshChatSession = async () => {
        try {
            console.log('🔧 Creating fresh Gemini chat session...');
            
            // Direct API call approach since SDK has model issues
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('API key not found');
            }
            
            console.log('🤖 Using direct Gemini API call...');
            
            return {
                sendMessage: async (prompt) => {
                    // Use only v1 API with Gemini 2.5 models
                    const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];
                    let lastError = null;
                    
                    for (const modelName of models) {
                        try {
                            console.log(`🔄 Trying v1 API with model: ${modelName}`);
                            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    contents: [{
                                        parts: [{
                                            text: prompt
                                        }]
                                    }],
                                    generationConfig: {
                                        temperature: 0.9,
                                        topK: 1,
                                        topP: 1,
                                        maxOutputTokens: 8192,
                                    }
                                })
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                console.log(`✅ Successfully used model: ${modelName}`);
                                console.log('📊 API response structure:', JSON.stringify(data, null, 2));
                                
                                // Check if response was truncated due to token limit
                                if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === "MAX_TOKENS") {
                                    console.warn(`⚠️ Response truncated due to token limit for ${modelName}. Will try to parse partial response...`);
                                    // Don't continue here - let's try to work with the partial response
                                }
                                
                                // Handle different response structures
                                let responseText = '';
                                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                                    responseText = data.candidates[0].content.parts[0].text;
                                } else if (data.candidates && data.candidates[0] && data.candidates[0].content && typeof data.candidates[0].content === 'string') {
                                    responseText = data.candidates[0].content;
                                } else if (data.text) {
                                    responseText = data.text;
                                } else if (data.response) {
                                    responseText = data.response;
                                } else {
                                    console.error('❌ Unexpected response structure:', data);
                                    lastError = new Error(`Unexpected API response structure from ${modelName}`);
                                    continue; // Try next model
                                }
                                
                                console.log('📝 Response text length:', responseText.length);
                                
                                // If response is too short, try next model
                                if (responseText.length < 500) {
                                    console.warn(`⚠️ Response too short (${responseText.length} chars). Trying next model...`);
                                    lastError = new Error(`Response too short for ${modelName}`);
                                    continue;
                                }
                                
                                return {
                                    response: {
                                        text: () => responseText
                                    }
                                };
                            } else {
                                const errorText = await response.text();
                                lastError = new Error(`API Error with ${modelName}: ${response.status} - ${errorText}`);
                                console.warn(`❌ Model ${modelName} failed:`, lastError.message);
                                continue; // Try next model
                            }
                        } catch (modelError) {
                            lastError = modelError;
                            console.warn(`❌ Model ${modelName} failed:`, modelError.message);
                            continue; // Try next model
                        }
                    }
                    
                    // If we get here, all models failed
                    throw lastError || new Error('All Gemini models failed');
                }
            };
        } catch (error) {
            console.error('❌ Error creating chat session:', error);
            throw error;
        }
    };

    const GenerateAiTrip = async () => {
        setLoading(true);
        
        try {
            // Create fresh session to avoid any cached model references
            const freshChatSession = await createFreshChatSession();
            
            // Format activity preferences as a readable string
            const activityPreferencesText = tripData?.activityPreferences?.length > 0 
                ? tripData.activityPreferences.join(', ')
                : 'No specific preferences';
            
            const activityCostPreferenceText = tripData?.activityCostPreference || 'mixed';
            const dailyBudgetAmount = tripData?.dailyBudget || 150; // Default to $150 if not set
            
            const FINAL_PROMPT = AI_PROMPT
                .replace('{location}', tripData?.locationInfo?.name)
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1)
                .replace('{traveler}', tripData.traveler?.title)
                .replace('{budget}', tripData.budget)
                .replace('{activityPreferences}', activityPreferencesText)
                .replace('{activityCostPreference}', activityCostPreferenceText)
                .replace(/{dailyBudget}/g, dailyBudgetAmount) // Replace all occurrences
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1);

            console.log('🚀 Sending prompt to Gemini:', FINAL_PROMPT);

            const result = await freshChatSession.sendMessage(FINAL_PROMPT);
            console.log('✅ Gemini response received');
            
            const responseText = result.response.text();
            console.log('📄 Raw response length:', responseText.length);
            console.log('📄 Raw response preview:', responseText.substring(0, 300) + '...');
            
            // Clean the response text more thoroughly
            let cleanText = responseText.trim();
            
            // Remove markdown code blocks
            cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove any leading/trailing whitespace and newlines
            cleanText = cleanText.trim();
            
            // Better JSON extraction - find the complete JSON object
            const jsonStart = cleanText.indexOf('{');
            if (jsonStart !== -1) {
                // Extract from the first { to the end, then we'll validate it's complete JSON
                let jsonCandidate = cleanText.substring(jsonStart);
                
                // Try to find the matching closing brace by counting braces
                let braceCount = 0;
                let jsonEnd = -1;
                
                for (let i = 0; i < jsonCandidate.length; i++) {
                    if (jsonCandidate[i] === '{') {
                        braceCount++;
                    } else if (jsonCandidate[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            jsonEnd = i;
                            break;
                        }
                    }
                }
                
                if (jsonEnd !== -1) {
                    cleanText = jsonCandidate.substring(0, jsonEnd + 1);
                } else {
                    // Fallback - use the whole text from first { onwards
                    cleanText = jsonCandidate;
                }
            }
            
            console.log('🧹 Cleaned response length:', cleanText.length);
            console.log('🧹 Cleaned response preview:', cleanText.substring(0, 300) + '...');
            console.log('🧹 Cleaned response end:', '...' + cleanText.substring(cleanText.length - 100));
            
            // Validate JSON before parsing
            if (!cleanText.startsWith('{')) {
                console.error('❌ Invalid JSON format - does not start with brace');
                throw new Error('Invalid JSON format received from AI');
            }
            
            // If JSON doesn't end with }, try to fix truncated JSON
            if (!cleanText.endsWith('}')) {
                console.warn('⚠️ JSON appears truncated. Attempting to fix...');
                console.log('🔍 Original length:', cleanText.length);
                console.log('🔍 Last 200 characters:', cleanText.substring(cleanText.length - 200));
                
                // Try to close incomplete JSON structures
                let fixedText = cleanText;
                
                // Count open braces and brackets to see what's missing
                let braceCount = 0;
                let bracketCount = 0;
                let inString = false;
                let escapeNext = false;
                
                for (let i = 0; i < fixedText.length; i++) {
                    const char = fixedText[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    if (char === '"' && !escapeNext) {
                        inString = !inString;
                        continue;
                    }
                    
                    if (!inString) {
                        if (char === '{') braceCount++;
                        else if (char === '}') braceCount--;
                        else if (char === '[') bracketCount++;
                        else if (char === ']') bracketCount--;
                    }
                }
                
                // If we're in a string, close it
                if (inString) {
                    fixedText += '"';
                }
                
                // Close any open brackets
                for (let i = 0; i < bracketCount; i++) {
                    fixedText += ']';
                }
                
                // Close any open braces
                for (let i = 0; i < braceCount; i++) {
                    fixedText += '}';
                }
                
                cleanText = fixedText;
                console.log('🔧 Fixed JSON length:', cleanText.length);
                console.log('🔧 Fixed JSON ends with:', cleanText.substring(cleanText.length - 10));
            }
            
            // Additional validation - try to parse first to catch syntax errors
            try {
                JSON.parse(cleanText);
            } catch (parseError) {
                console.error('❌ JSON syntax error:', parseError.message);
                console.log('🔍 Problematic JSON length:', cleanText.length);
                console.log('🔍 JSON starts with:', cleanText.substring(0, 100));
                console.log('🔍 JSON ends with:', cleanText.substring(cleanText.length - 100));
                throw new Error(`JSON parsing failed: ${parseError.message}`);
            }
            
            const tripResp = JSON.parse(cleanText);
            console.log('✅ Trip data parsed successfully');
            
            // Debug user authentication status
            const currentUser = auth.currentUser;
            console.log('👤 Current user status:', {
                uid: currentUser?.uid,
                email: currentUser?.email,
                isAuthenticated: !!currentUser
            });
            
            if (!currentUser) {
                throw new Error('User not authenticated. Please sign in again.');
            }
            
            const docId = (Date.now()).toString();
            console.log('💾 Saving trip immediately (images will load in background)...');
            
            try {
                // Save trip immediately with empty imageRefs
                const tripDocument = {
                    userEmail: currentUser.email,
                    tripPlan: tripResp,// AI Result 
                    tripData: JSON.stringify(tripData),//User Selection Data
                    imageRefs: {}, // Empty for now - will update in background
                    docId: docId,
                    createdAt: new Date().toISOString(),
                    userId: currentUser.uid
                };
                
                await setDoc(doc(db, "UserTrips", docId), tripDocument);
                console.log('✅ Trip saved to Firebase successfully');
                
                // Navigate immediately - don't wait for images
                router.push('(tabs)/mytrip');
                
                // Fetch images in background and update the trip document
                console.log('📸 Fetching images in background...');
                fetchTripImages(tripResp, tripData?.locationInfo?.name)
                    .then(async (imageRefs) => {
                        console.log('✅ Background images fetched, updating trip...');
                        await setDoc(doc(db, "UserTrips", docId), {
                            ...tripDocument,
                            imageRefs: imageRefs
                        });
                        console.log('✅ Trip updated with images');
                    })
                    .catch(err => console.log('⚠️ Background image fetch failed:', err.message));
                
                // Update user stats (don't wait for it - run in background)
                ProfileService.incrementTripCount(currentUser.uid, tripDocument)
                    .then(() => console.log('✅ User stats updated'))
                    .catch(err => console.log('⚠️ Stats update failed (non-critical):', err.message));
                
            } catch (firestoreError) {
                console.error('❌ Firestore save error:', firestoreError);
                console.error('❌ Error code:', firestoreError.code);
                console.error('❌ Error message:', firestoreError.message);
                
                // Try alternative approach - let user know about the error but still show success
                alert('Trip generated successfully! However, there was an issue saving to your account. Please try again or contact support.');
                router.push('(tabs)/mytrip');
            }
            
        } catch (error) {
            console.error('❌ Error generating trip:', error);
            
            if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
                alert('API quota exceeded. Please try again later or contact support for a new API key.');
            } else if (error.message.includes('API_KEY')) {
                alert('Invalid API key. Please check your Gemini API configuration.');
            } else if (error.message.includes('models/') && error.message.includes('not found')) {
                alert('The AI model is temporarily unavailable. Please try again in a few minutes.');
            } else if (error.message.includes('404')) {
                alert('AI service is temporarily unavailable. Please try again later.');
            } else if (error.name === 'SyntaxError') {
                console.error('❌ JSON parsing error - invalid response format');
                alert('Received invalid response from AI. Please try again.');
            } else {
                console.error('❌ Full error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                alert('Failed to generate trip. Please check your internet connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{
            padding: 25,
            paddingTop: 75,
            backgroundColor: Colors.WHITE,
            height: '100%'
        }}>
            <Text style={{
                fontFamily: 'outfit-bold',
                fontSize: 35,
                textAlign: 'center'
            }}>
                Please Wait...
            </Text>
            <Text style={{
                fontFamily: 'outfit-medium',
                fontSize: 20,
                textAlign: 'center',
                marginTop: 40
            }}>
                We are working to generate your dream trip
            </Text>

            <Image source={require('./../../assets/images/plane.gif')}
                style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'contain'
                }}

            />

            <Text style={{
                fontFamily: 'outfit',
                color: Colors.GRAY,
                fontSize: 20,
                textAlign: 'center'
            }}>Do not Go Back</Text>
        </View>
    )
}