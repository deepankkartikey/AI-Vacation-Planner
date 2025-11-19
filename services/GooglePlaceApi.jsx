export const GetPhotoRef = async (placeName, location) => {
    console.log(`🔍 Fetching photo for: ${placeName}${location ? ` in location: ${location}` : ''}`);
    
    try {
        // Clean the place name for better search results
        const cleanedName = placeName.replace(/[^\w\s\-\(\)&]/g, '').trim();
        
        // Create multiple search strategies for the new Places API
        const searchStrategies = [
            cleanedName,
            cleanedName.replace(/\s+\(.*?\)/g, ''), // Remove content in parentheses
            `${cleanedName} ${location}`,
            `${cleanedName} tourist attraction`,
            `${cleanedName} landmark`,
            `${location} ${cleanedName}`
        ].filter(Boolean);

        for (const query of searchStrategies) {
            console.log(`🔄 Trying query: ${query}`);
            
            try {
                // Use the new Places API (New) Text Search endpoint
                const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY,
                        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
                    },
                    body: JSON.stringify({
                        textQuery: query,
                        maxResultCount: 5,
                        languageCode: 'en'
                    })
                });

                console.log(`📊 API Response status: ${response.status}`);
                
                if (response.status === 200) {
                    const data = await response.json();
                    console.log(`📊 Results count: ${data.places ? data.places.length : 0}`);
                    
                    if (data.places && data.places.length > 0) {
                        // Look for a place that has photos
                        for (const place of data.places) {
                            if (place.photos && place.photos.length > 0) {
                                const photoReference = place.photos[0].name;
                                console.log(`✅ Found photo reference: ${photoReference}`);
                                return photoReference;
                            }
                        }
                    }
                } else if (response.status === 403) {
                    const errorData = await response.json();
                    if (errorData.error?.message?.includes('quota')) {
                        console.log('❌ API quota exceeded');
                        break; // Stop trying if quota exceeded
                    } else {
                        console.log('❌ API permission error:', errorData.error?.message);
                    }
                } else {
                    console.log(`❌ API error: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Network error for query "${query}":`, error.message);
                continue; // Try next query
            }
        }

        console.log(`❌ No photo found after trying all search strategies for: ${placeName}`);
        return null;
    } catch (error) {
        console.log(`❌ Error in GetPhotoRef for ${placeName}:`, error.message);
        return null;
    }
};