import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GetPhotoRef } from './GooglePlaceApi';

export const generateMorePlaces = async (tripId, location, filterType, filterLabel, tripData) => {
    console.log(`🎯 Generating more places for filter: ${filterType}`);
    
    try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('API key not found');
        }

        // Create a specific prompt for the filter type
        const prompt = createFilterPrompt(location, filterType, filterLabel, tripData);
        
        console.log('📝 Prompt created:', prompt.substring(0, 200) + '...');
        
        // Call Gemini API
        const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];
        let responseText = null;
        
        for (const modelName of models) {
            try {
                console.log(`🔄 Trying model: ${modelName}`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.8,
                                topK: 40,
                                topP: 0.95,
                                maxOutputTokens: 4096,
                            }
                        })
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        responseText = data.candidates[0].content.parts[0].text;
                        console.log(`✅ Successfully generated with ${modelName}`);
                        break;
                    }
                }
            } catch (error) {
                console.warn(`❌ Model ${modelName} failed:`, error.message);
                continue;
            }
        }

        if (!responseText) {
            throw new Error('Failed to generate places with all models');
        }

        // Parse the JSON response
        const newPlaces = cleanAndParseJSON(responseText);
        console.log('📦 Parsed new places:', newPlaces);

        if (!newPlaces || newPlaces.length === 0) {
            throw new Error('No places generated');
        }

        // Fetch images for new places in parallel
        console.log('📸 Fetching images for new places...');
        const imagePromises = newPlaces.map(place => 
            GetPhotoRef(place.placeName, location)
                .then(photoRef => ({ ...place, photoRef }))
                .catch(() => place) // If image fetch fails, continue without image
        );
        
        const placesWithImages = await Promise.all(imagePromises);
        console.log('✅ Images fetched');

        // Get current trip document
        const tripDoc = await getDoc(doc(db, 'UserTrips', tripId));
        if (!tripDoc.exists()) {
            throw new Error('Trip not found');
        }

        const tripDetails = tripDoc.data();
        const itinerary = tripDetails.tripPlan?.travelPlan?.itinerary || {};
        
        // Distribute new places across days
        const days = Object.keys(itinerary).sort((a, b) => {
            const dayNumA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const dayNumB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return dayNumA - dayNumB;
        });

        let placeIndex = 0;
        const updatedItinerary = { ...itinerary };
        const newImageRefs = { ...tripDetails.imageRefs };

        // Add places to days in round-robin fashion
        for (const place of placesWithImages) {
            if (placeIndex >= days.length) placeIndex = 0;
            const day = days[placeIndex];
            
            if (!updatedItinerary[day]) {
                updatedItinerary[day] = { plan: [] };
            }
            
            updatedItinerary[day].plan.push({
                placeName: place.placeName,
                placeDetails: place.placeDetails,
                ticketPricing: place.ticketPricing || 'Free',
                timeToTravel: place.timeToTravel || '1-2 hours',
                rating: place.rating || 4.0,
                geoCoordinates: place.geoCoordinates || null
            });

            // Add image reference if available
            if (place.photoRef) {
                if (!newImageRefs.places) newImageRefs.places = {};
                if (!newImageRefs.places[day]) newImageRefs.places[day] = {};
                
                const placeIndexInDay = updatedItinerary[day].plan.length - 1;
                newImageRefs.places[day][placeIndexInDay.toString()] = place.photoRef;
            }

            placeIndex++;
        }

        // Update Firestore
        const updatedTripPlan = {
            ...tripDetails.tripPlan,
            travelPlan: {
                ...tripDetails.tripPlan.travelPlan,
                itinerary: updatedItinerary
            }
        };

        await updateDoc(doc(db, 'UserTrips', tripId), {
            tripPlan: updatedTripPlan,
            imageRefs: newImageRefs,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Trip updated with new places');
        return { success: true, placesAdded: placesWithImages.length };

    } catch (error) {
        console.error('❌ Error generating more places:', error);
        throw error;
    }
};

// Helper function to create filter-specific prompts
const createFilterPrompt = (location, filterType, filterLabel, tripData) => {
    const activityDescriptions = {
        attractions: 'tourist attractions, landmarks, monuments, museums, towers, historic sites',
        restaurants: 'restaurants, cafes, dining spots, local cuisine, food markets, bars',
        nature: 'parks, gardens, beaches, lakes, mountains, forests, botanical gardens, nature reserves',
        shopping: 'shopping malls, markets, bazaars, boutiques, local shops, street markets',
        entertainment: 'theaters, cinemas, shows, performances, concerts, nightlife, clubs, entertainment venues'
    };

    const activityType = activityDescriptions[filterType] || 'activities';
    const budget = tripData?.dailyBudget || 100;
    const budgetCategory = tripData?.budget?.title || 'Moderate';

    return `Generate 3-5 additional ${activityType} recommendations for ${location}.

IMPORTANT: Return ONLY a valid JSON array, no other text.

Budget: ${budgetCategory} (${budget} per day)
Preferences: ${tripData?.activityPreferences?.join(', ') || 'General tourism'}
Cost Preference: ${tripData?.activityCostPreference || 'Mixed'}

Requirements:
- Focus specifically on ${activityType}
- Include places suitable for ${tripData?.traveler?.title || 'Solo travelers'}
- Provide accurate ticket pricing
- Include realistic time estimates
- Add ratings (1-5 scale)

Return format (JSON array only):
[
  {
    "placeName": "Place Name",
    "placeDetails": "Brief description (50-80 words)",
    "ticketPricing": "Price or 'Free'",
    "timeToTravel": "X-Y hours",
    "rating": 4.5,
    "geoCoordinates": {"latitude": 0.0, "longitude": 0.0}
  }
]`;
};

// Helper function to clean and parse JSON
const cleanAndParseJSON = (text) => {
    try {
        // Remove markdown code blocks
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Try to find JSON array
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            cleaned = arrayMatch[0];
        }

        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        console.error('JSON parsing error:', error);
        console.log('Raw text:', text.substring(0, 500));
        throw new Error('Failed to parse AI response');
    }
};
