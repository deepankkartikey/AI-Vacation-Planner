import { GetPhotoRef } from './GooglePlaceApi';

export const fetchTripImages = async (tripPlan, locationName) => {
    console.log('📸 Starting to fetch images for trip...');
    const imageRefs = {};
    
    try {
        // 1. Fetch destination image
        if (locationName) {
            console.log(`🏞️ Fetching destination image for: ${locationName}`);
            const destinationPhoto = await GetPhotoRef(locationName);
            if (destinationPhoto) {
                imageRefs.destination = destinationPhoto;
                console.log(`✅ Destination image found: ${destinationPhoto.substring(0, 50)}...`);
            }
        }
        
        // 2. Fetch hotel images
        if (tripPlan?.travelPlan?.hotels && Array.isArray(tripPlan.travelPlan.hotels)) {
            console.log(`🏨 Fetching images for ${tripPlan.travelPlan.hotels.length} hotels...`);
            imageRefs.hotels = {};
            
            for (let i = 0; i < tripPlan.travelPlan.hotels.length; i++) {
                const hotel = tripPlan.travelPlan.hotels[i];
                const hotelName = hotel.hotelName || hotel.name;
                
                if (hotelName) {
                    console.log(`🏨 Fetching image for hotel: ${hotelName}`);
                    const hotelPhoto = await GetPhotoRef(hotelName, locationName);
                    if (hotelPhoto) {
                        imageRefs.hotels[i.toString()] = hotelPhoto; // Convert to string key
                        console.log(`✅ Hotel ${i + 1} image found`);
                    }
                    
                    // Add small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        // 3. Fetch place images from itinerary
        if (tripPlan?.travelPlan?.itinerary) {
            console.log(`🎯 Fetching place images from itinerary...`);
            imageRefs.places = {};
            
            const itinerary = tripPlan.travelPlan.itinerary;
            
            for (const dayKey of Object.keys(itinerary)) {
                const dayData = itinerary[dayKey];
                
                if (dayData?.plan && Array.isArray(dayData.plan)) {
                    imageRefs.places[dayKey] = {};
                    
                    for (let i = 0; i < dayData.plan.length; i++) {
                        const place = dayData.plan[i];
                        const placeName = place.placeName || place.name;
                        
                        if (placeName) {
                            console.log(`🎯 Fetching image for place: ${placeName}`);
                            const placePhoto = await GetPhotoRef(placeName, locationName);
                            if (placePhoto) {
                                imageRefs.places[dayKey][i.toString()] = placePhoto; // Convert to string key
                                console.log(`✅ ${dayKey} place ${i + 1} image found`);
                            }
                            
                            // Add small delay to avoid rate limiting
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                }
            }
        }
        
        console.log('📸 Image fetching completed!');
        console.log('📊 Image summary:', {
            destination: !!imageRefs.destination,
            hotels: Object.keys(imageRefs.hotels || {}).length,
            places: Object.keys(imageRefs.places || {}).reduce((total, day) => 
                total + Object.keys(imageRefs.places[day] || {}).length, 0)
        });
        
        return imageRefs;
        
    } catch (error) {
        console.error('❌ Error fetching trip images:', error);
        return imageRefs; // Return whatever we managed to fetch
    }
};