import { View, Text, Image, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Colors } from '../../constants/Colors'
import { CreateTripContext } from '../../context/CreateTripContext'
import { AI_SKELETON_PROMPT, AI_DETAIL_PROMPT } from '../../constants/Options';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './../../firebase/config'
import { fetchTripImages } from '../../services/TripImageService'
import ProfileService from '../../services/ProfileService'
import GeminiService from '../../services/GeminiService'

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
        const chatSession = await GeminiService.createChatSession();
        
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
        
        const result = await chatSession.sendMessage(SKELETON_PROMPT);
        const responseText = result.response.text();
        
        console.log('📄 Skeleton response length:', responseText.length);
        
        const cleanedJSON = GeminiService.cleanAndParseJSON(responseText);
        return cleanedJSON;
    }

    const enhanceWithDetails = async (skeleton, docId, originalDocument) => {
        try {
            const chatSession = await GeminiService.createChatSession();
            
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

            console.log('🎨 Detail enhancement prompt ready');
            
            const result = await chatSession.sendMessage(DETAIL_PROMPT);
            const responseText = result.response.text();
            
            console.log('📄 Enhanced response length:', responseText.length);
            
            const enhancedTrip = GeminiService.cleanAndParseJSON(responseText);
            
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

    const handleGenerationError = (error) => {
        const errorMessage = GeminiService.getErrorMessage(error);
        alert(errorMessage);
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