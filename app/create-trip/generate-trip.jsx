import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Colors } from '../../constants/Colors'
import { CreateTripContext } from '../../context/CreateTripContext'
import { AI_PROMPT } from '../../constants/Options';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './../../configs/FirebaseConfig'

export default function GenerateTrip() {
    const { tripData, setTripData } = useContext(CreateTripContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const user = auth.currentUser;
    
    useEffect(() => {
        GenerateAiTrip()
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
                                        maxOutputTokens: 2048,
                                    }
                                })
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                console.log(`✅ Successfully used model: ${modelName}`);
                                return {
                                    response: {
                                        text: () => data.candidates[0].content.parts[0].text
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
            
            const FINAL_PROMPT = AI_PROMPT
                .replace('{location}', tripData?.locationInfo?.name)
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1)
                .replace('{traveler}', tripData.traveler?.title)
                .replace('{budget}', tripData.budget)
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1);

            console.log('🚀 Sending prompt to Gemini:', FINAL_PROMPT);

            const result = await freshChatSession.sendMessage(FINAL_PROMPT);
            console.log('✅ Gemini response received');
            
            const responseText = result.response.text();
            console.log('📄 Raw response length:', responseText.length);
            console.log('📄 Raw response preview:', responseText.substring(0, 200) + '...');
            
            // Clean the response text more thoroughly
            let cleanText = responseText.trim();
            
            // Remove markdown code blocks
            cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove any leading/trailing whitespace and newlines
            cleanText = cleanText.trim();
            
            // Find JSON content if it's wrapped in other text
            const jsonStart = cleanText.indexOf('{');
            const jsonEnd = cleanText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
            }
            
            console.log('🧹 Cleaned response preview:', cleanText.substring(0, 200) + '...');
            
            const tripResp = JSON.parse(cleanText);
            console.log('✅ Trip data parsed successfully');
            
            const docId = (Date.now()).toString();
            const result_ = await setDoc(doc(db, "UserTrips", docId), {
                userEmail: user.email,
                tripPlan: tripResp,// AI Result 
                tripData: JSON.stringify(tripData),//User Selection Data
                docId: docId
            });
            
            console.log('✅ Trip saved to Firebase successfully');
            router.push('(tabs)/mytrip');
            
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