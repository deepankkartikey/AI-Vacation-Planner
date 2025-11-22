import { GetPhotoRef } from './GooglePlaceApi';

export const fetchTripImages = async (tripPlan, locationName) => {
    console.log('📸 Starting to fetch images for trip (parallel mode)...');
    const imageRefs = {};
    
    try {
        // Create array of all image fetch promises to run in parallel
        const fetchPromises = [];
        
        // 1. Fetch destination image
        if (locationName) {
            console.log(`🏞️ Queuing destination image for: ${locationName}`);
            fetchPromises.push(
                GetPhotoRef(locationName)
                    .then(photo => {
                        if (photo) {
                            imageRefs.destination = photo;
                            console.log(`✅ Destination image found`);
                        }
                    })
                    .catch(err => console.log(`⚠️ Destination image failed: ${err.message}`))
            );
        }
        
        // 2. Fetch hotel images
        if (tripPlan?.travelPlan?.hotels && Array.isArray(tripPlan.travelPlan.hotels)) {
            console.log(`🏨 Queuing images for ${tripPlan.travelPlan.hotels.length} hotels...`);
            imageRefs.hotels = {};
            
            tripPlan.travelPlan.hotels.forEach((hotel, i) => {
                const hotelName = hotel.hotelName || hotel.name;
                
                if (hotelName) {
                    fetchPromises.push(
                        GetPhotoRef(hotelName, locationName)
                            .then(photo => {
                                if (photo) {
                                    imageRefs.hotels[i.toString()] = photo;
                                    console.log(`✅ Hotel ${i + 1} image found`);
                                }
                            })
                            .catch(err => console.log(`⚠️ Hotel ${i + 1} image failed: ${err.message}`))
                    );
                }
            });
        }
        
        // 3. Fetch place images from itinerary
        if (tripPlan?.travelPlan?.itinerary) {
            console.log(`🎯 Queuing place images from itinerary...`);
            imageRefs.places = {};
            
            const itinerary = tripPlan.travelPlan.itinerary;
            
            Object.keys(itinerary).forEach(dayKey => {
                const dayData = itinerary[dayKey];
                
                if (dayData?.plan && Array.isArray(dayData.plan)) {
                    imageRefs.places[dayKey] = {};
                    
                    dayData.plan.forEach((place, i) => {
                        const placeName = place.placeName || place.name;
                        
                        if (placeName) {
                            fetchPromises.push(
                                GetPhotoRef(placeName, locationName)
                                    .then(photo => {
                                        if (photo) {
                                            imageRefs.places[dayKey][i.toString()] = photo;
                                            console.log(`✅ ${dayKey} place ${i + 1} image found`);
                                        }
                                    })
                                    .catch(err => console.log(`⚠️ ${dayKey} place ${i + 1} failed: ${err.message}`))
                            );
                        }
                    });
                }
            });
        }
        
        // Execute all fetch promises in parallel
        console.log(`⚡ Fetching ${fetchPromises.length} images in parallel...`);
        await Promise.allSettled(fetchPromises);
        
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