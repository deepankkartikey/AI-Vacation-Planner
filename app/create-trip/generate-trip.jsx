import { View, Text, Image, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Colors } from '../../constants/Colors'
import { CreateTripContext } from '../../context/CreateTripContext'
import { AI_SKELETON_PROMPT, AI_DETAIL_PROMPT } from '../../constants/Options';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './../../configs/FirebaseConfig'
import { fetchTripImages } from '../../services/TripImageService'
import ProfileService from '../../services/ProfileService'

export default function GenerateTrip() {
    const { tripData, setTripData } = useContext(CreateTripContext);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Finding places for you...');
    const [generationPhase, setGenerationPhase] = useState('skeleton'); // 'skeleton' or 'details'
    const router = useRouter();
    
    // Loading messages to rotate through
    const skeletonMessages = [
        'Finding places for you...',
        'Planning your days...',
        'Creating itinerary structure...',
    ];
    
    const detailMessages = [
        'Adding detailed descriptions...',
        'Finding ticket prices...',
        'Getting location details...',
        'Polishing your trip...',
    ];
    
    useEffect(() => {
        // Check authentication first
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('❌ User not authenticated - redirecting to sign in');
            Alert.alert(
                'Authentication Required',
                'Please sign in to create a trip.',
                [
                    {
                        text: 'Sign In',
                        onPress: () => router.replace('/auth/sign-in')
                    }
                ]
            );
            return;
        }
        
        // Rotate loading messages every 3 seconds
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            const messages = generationPhase === 'skeleton' ? skeletonMessages : detailMessages;
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 3000);
        
        // Add small delay to ensure auth state is ready
        const timer = setTimeout(() => {
            GenerateAiTrip();
        }, 100);
        
        return () => {
            clearTimeout(timer);
            clearInterval(messageInterval);
        };
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
                    // Use Gemini 2.5 models in order of preference
                    const models = [
                        'gemini-2.5-flash-lite',  // Fastest, lightweight
                        'gemini-2.5-flash',       // Balanced speed and quality
                        'gemini-2.5-pro',         // Most capable
                    ];
                    let lastError = null;
                    
                    for (const modelName of models) {
                        try {
                            console.log(`🔄 Trying with model: ${modelName}`);
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
                                        temperature: 0.7,
                                        topK: 40,
                                        topP: 0.95,
                                        maxOutputTokens: 16384,
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
            // PHASE 1: Generate Quick Skeleton
            console.log('🚀 PHASE 1: Generating quick skeleton...');
            setGenerationPhase('skeleton');
            setLoadingMessage('Creating itinerary structure...');
            
            const skeletonTrip = await generateSkeleton();
            console.log('✅ Skeleton generated successfully');
            
            // Save skeleton immediately so user can see it
            const docId = (Date.now()).toString();
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('User not authenticated. Please sign in again.');
            }
            
            const skeletonDocument = {
                userEmail: currentUser.email,
                tripPlan: skeletonTrip,
                tripData: JSON.stringify(tripData),
                imageRefs: {},
                docId: docId,
                createdAt: new Date().toISOString(),
                userId: currentUser.uid,
                isEnhanced: false // Flag to show this is just skeleton
            };
            
            await setDoc(doc(db, "UserTrips", docId), skeletonDocument);
            console.log('✅ Skeleton saved to Firebase');
            
            // Navigate directly to trip details page with the skeleton
            router.push({
                pathname: '/trip-details',
                params: {
                    trip: JSON.stringify(skeletonDocument)
                }
            });
            
            // PHASE 2: Enhance with details in background
            console.log('🎨 PHASE 2: Enhancing with details (background)...');
            setGenerationPhase('details');
            setLoadingMessage('Adding detailed information...');
            
            enhanceWithDetails(skeletonTrip, docId, skeletonDocument)
                .then(() => console.log('✅ Details enhancement complete'))
                .catch(err => console.log('⚠️ Detail enhancement failed (non-critical):', err.message));
            
            // Update user stats in background
            ProfileService.incrementTripCount(currentUser.uid, skeletonDocument)
                .then(() => console.log('✅ User stats updated'))
                .catch(err => console.log('⚠️ Stats update failed (non-critical):', err.message));
                
        } catch (error) {
            console.error('❌ Error generating trip:', error);
            handleGenerationError(error);
        } finally {
            setLoading(false);
        }
    }

    const generateSkeleton = async () => {
        const freshChatSession = await createFreshChatSession();
        
        // Format activity preferences
        const activityPreferencesText = tripData?.activityPreferences?.length > 0 
            ? tripData.activityPreferences.join(', ')
            : 'No specific preferences';
        
        const activityCostPreferenceText = tripData?.activityCostPreference || 'mixed';
        const dailyBudgetAmount = tripData?.dailyBudget || 150;
        
        const SKELETON_PROMPT = AI_SKELETON_PROMPT
            .replace('{location}', tripData?.locationInfo?.name)
            .replace('{totalDays}', tripData.totalNoOfDays)
            .replace('{totalNight}', tripData.totalNoOfDays - 1)
            .replace('{traveler}', tripData.traveler?.title)
            .replace('{budget}', tripData.budget)
            .replace('{activityPreferences}', activityPreferencesText)
            .replace('{activityCostPreference}', activityCostPreferenceText)
            .replace(/{dailyBudget}/g, dailyBudgetAmount);

        console.log('📝 Skeleton prompt ready');
        
        const result = await freshChatSession.sendMessage(SKELETON_PROMPT);
        const responseText = result.response.text();
        
        console.log('📄 Skeleton response length:', responseText.length);
        
        const cleanedJSON = cleanAndParseJSON(responseText);
        return cleanedJSON;
    }

    const enhanceWithDetails = async (skeleton, docId, originalDocument) => {
        try {
            const freshChatSession = await createFreshChatSession();
            
            // Format activity preferences
            const activityPreferencesText = tripData?.activityPreferences?.length > 0 
                ? tripData.activityPreferences.join(', ')
                : 'No specific preferences';
            
            const activityCostPreferenceText = tripData?.activityCostPreference || 'mixed';
            const dailyBudgetAmount = tripData?.dailyBudget || 150;
            
            const DETAIL_PROMPT = AI_DETAIL_PROMPT
                .replace('{skeleton}', JSON.stringify(skeleton, null, 2))
                .replace('{location}', tripData?.locationInfo?.name)
                .replace('{traveler}', tripData.traveler?.title)
                .replace(/{dailyBudget}/g, dailyBudgetAmount)
                .replace('{activityPreferences}', activityPreferencesText)
                .replace('{activityCostPreference}', activityCostPreferenceText);

            console.log('� Detail enhancement prompt ready');
            
            const result = await freshChatSession.sendMessage(DETAIL_PROMPT);
            const responseText = result.response.text();
            
            console.log('📄 Enhanced response length:', responseText.length);
            
            const enhancedTrip = cleanAndParseJSON(responseText);
            
            // Update document with enhanced details
            await setDoc(doc(db, "UserTrips", docId), {
                ...originalDocument,
                tripPlan: enhancedTrip,
                isEnhanced: true
            });
            
            console.log('✅ Enhanced trip saved to Firebase');
            
            // Fetch images in background
            fetchTripImages(enhancedTrip, tripData?.locationInfo?.name)
                .then(async (imageRefs) => {
                    await setDoc(doc(db, "UserTrips", docId), {
                        ...originalDocument,
                        tripPlan: enhancedTrip,
                        imageRefs: imageRefs,
                        isEnhanced: true
                    });
                    console.log('✅ Images added to trip');
                })
                .catch(err => console.log('⚠️ Image fetch failed:', err.message));
                
        } catch (error) {
            console.error('❌ Error enhancing details:', error);
            // Non-critical error - skeleton is already saved
        }
    }

    const cleanAndParseJSON = (responseText) => {
        // Clean the response text
        let cleanText = responseText.trim();
        
        // Remove markdown code blocks
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove any leading/trailing whitespace
        cleanText = cleanText.trim();
        
        // Extract JSON object
        const jsonStart = cleanText.indexOf('{');
        if (jsonStart !== -1) {
            let jsonCandidate = cleanText.substring(jsonStart);
            
            // Find matching closing brace
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
                cleanText = jsonCandidate;
            }
        }
        
        console.log('🧹 Cleaned JSON length:', cleanText.length);
        
        // Validate and fix truncated JSON if needed
        if (!cleanText.startsWith('{')) {
            throw new Error('Invalid JSON format');
        }
        
        if (!cleanText.endsWith('}')) {
            console.warn('⚠️ JSON truncated, attempting to fix...');
            cleanText = fixTruncatedJSON(cleanText);
        }
        
        // Parse and return
        try {
            return JSON.parse(cleanText);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError.message);
            throw new Error(`JSON parsing failed: ${parseError.message}`);
        }
    }

    const fixTruncatedJSON = (text) => {
        let fixedText = text;
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
        
        // Close unclosed structures
        if (inString) fixedText += '"';
        for (let i = 0; i < bracketCount; i++) fixedText += ']';
        for (let i = 0; i < braceCount; i++) fixedText += '}';
        
        return fixedText;
    }

    const handleGenerationError = (error) => {
        if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
            alert('API quota exceeded. Please try again later.');
        } else if (error.message.includes('API_KEY')) {
            alert('Invalid API key. Please check configuration.');
        } else if (error.message.includes('not found')) {
            alert('AI model temporarily unavailable. Please try again.');
        } else if (error.name === 'SyntaxError') {
            alert('Received invalid response from AI. Please try again.');
        } else {
            alert('Failed to generate trip. Please check your internet connection and try again.');
        }
    }

    return (
        <View style={{
            padding: 25,
            paddingTop: 75,
            backgroundColor: Colors.WHITE,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Text style={{
                fontFamily: 'outfit-bold',
                fontSize: 35,
                textAlign: 'center'
            }}>
                Please Wait...
            </Text>

            <Image source={require('./../../assets/images/plane.gif')}
                style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'contain',
                    marginVertical: 30
                }}
            />

            <Text style={{
                fontFamily: 'outfit-medium',
                fontSize: 22,
                textAlign: 'center',
                color: Colors.PRIMARY,
                marginBottom: 20
            }}>
                {loadingMessage}
            </Text>

            <Text style={{
                fontFamily: 'outfit',
                color: Colors.GRAY,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 20
            }}>
                {generationPhase === 'skeleton' ? 'Creating your trip...' : 'Adding details in background...'}
            </Text>
        </View>
    )
}