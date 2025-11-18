import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Colors } from '../../constants/Colors';

const NewGooglePlacesSearch = ({ onPlaceSelect, placeholder = "Search places..." }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);

  // Generate a session token for the Places API (New)
  useEffect(() => {
    // Simple UUID generation for session token
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    setSessionToken(generateUUID());
  }, []);

  const searchPlaces = async (input) => {
    if (!input.trim() || input.length < 2) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    console.log('🔍 Searching for:', input);
    
    try {
      // Try new Places API first
      const success = await tryNewPlacesAPI(input);
      if (!success) {
        console.log('🔄 Falling back to legacy Places API...');
        await tryLegacyPlacesAPI(input);
      }
    } catch (error) {
      console.error('❌ Places search error:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const tryNewPlacesAPI = async (input) => {
    try {
      const url = `https://places.googleapis.com/v1/places:autocomplete`;
      const requestBody = {
        input: input,
        sessionToken: sessionToken,
        languageCode: 'en',
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country'],
        includedRegionCodes: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU', 'JP', 'CN', 'IN', 'BR'],
      };
      
      console.log('📋 New API request:', { url, body: requestBody });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 New API response status:', response.status);
      
      if (response.status === 404) {
        console.warn('⚠️ Places API (New) not available, trying legacy API...');
        return false;
      }
      
      const data = await response.json();
      console.log('📋 New API data:', data);
      
      if (response.ok && data.suggestions) {
        const filteredPredictions = data.suggestions.filter(item => item.placePrediction);
        console.log('✅ Found predictions (New API):', filteredPredictions.length);
        setPredictions(filteredPredictions);
        return true;
      } else {
        console.warn('⚠️ New API failed, trying legacy...');
        return false;
      }
    } catch (error) {
      console.error('❌ New API error:', error);
      return false;
    }
  };

  const tryLegacyPlacesAPI = async (input) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
      
      console.log('📋 Legacy API request URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Legacy API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Legacy API failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 Legacy API data:', data);
      
      if (data.predictions) {
        // Convert legacy format to new format
        const convertedPredictions = data.predictions.map(prediction => ({
          placePrediction: {
            place: `places/${prediction.place_id}`,
            placeId: prediction.place_id,
            text: {
              text: prediction.description
            },
            structuredFormat: {
              mainText: {
                text: prediction.structured_formatting?.main_text || prediction.description
              },
              secondaryText: {
                text: prediction.structured_formatting?.secondary_text || ''
              }
            }
          }
        }));
        
        console.log('✅ Found predictions (Legacy API):', convertedPredictions.length);
        setPredictions(convertedPredictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('❌ Legacy API error:', error);
      setPredictions([]);
    }
  };
        console.warn('⚠️ New API response not OK or missing suggestions');
        setPredictions([]);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      console.log('🔍 Fetching place details for:', placeId);
      console.log('🔗 URL:', url);
      
      const requestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,photos,websiteUri',
        },
      };
      
      console.log('📋 Request config:', requestConfig);

      const response = await fetch(url, requestConfig);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, response.statusText);
        console.error('❌ Error response body:', errorText);
        
        if (response.status === 403) {
          console.error('🚫 API key issue: Check if Places API (New) is enabled and billing is set up');
        } else if (response.status === 404) {
          console.error('🔍 API endpoint not found. Check if you are using the correct API version');
        }
        
        return null;
      }

      // Get response as text first to debug
      const responseText = await response.text();
      console.log('📄 Response text length:', responseText.length);
      console.log('📄 Response text (first 200 chars):', responseText.substring(0, 200));

      if (!responseText || responseText.trim() === '') {
        console.error('❌ Empty response from Places API');
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Successfully parsed JSON');
        console.log('📍 Place data:', {
          id: data.id,
          name: data.displayName?.text,
          address: data.formattedAddress,
          hasLocation: !!data.location,
          photosCount: data.photos?.length || 0
        });
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 Raw response text:', responseText);
        return null;
      }
      
      if (data && data.id) {
        return {
          place_id: data.id,
          name: data.displayName?.text,
          formatted_address: data.formattedAddress,
          geometry: {
            location: {
              lat: data.location?.latitude,
              lng: data.location?.longitude,
            },
          },
          photos: data.photos,
          website: data.websiteUri,
        };
      } else {
        console.error('❌ Invalid place data structure:', data);
        return null;
      }
    } catch (error) {
      console.error('❌ Network/Fetch Error:', error.message);
      console.error('❌ Error stack:', error.stack);
      return null;
    }
  };

  const handlePlaceSelect = async (prediction) => {
    const placePrediction = prediction.placePrediction;
    const placeId = placePrediction.place;
    
    setQuery(placePrediction.text.text);
    setPredictions([]);
    setLoading(true);

    // Try to get detailed place information
    const placeDetails = await getPlaceDetails(placeId);
    setLoading(false);

    // Create location data with fallback to prediction data
    const locationData = {
      description: placePrediction.text.text,
      place_id: placeId,
      geometry: placeDetails?.geometry || {
        location: { lat: 0, lng: 0 } // Default coordinates if details fail
      },
      photos: placeDetails?.photos || null,
      website: placeDetails?.website || null,
    };

    // If we got detailed place info, use the formatted address
    if (placeDetails?.formatted_address) {
      locationData.description = placeDetails.formatted_address;
    }

    console.log('Final location data:', locationData);

    if (onPlaceSelect) {
      onPlaceSelect(locationData);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchPlaces(query);
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [query]);

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{
        borderWidth: 1,
        borderColor: Colors.GRAY,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
      }}>
        <TextInput
          style={{
            flex: 1,
            padding: 15,
            fontSize: 16,
          }}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={Colors.PRIMARY} />}
      </View>

      {predictions.length > 0 && (
        <View style={{
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: Colors.GRAY,
          borderTopWidth: 0,
          borderRadius: 5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          maxHeight: 300,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placePrediction.place}
            renderItem={({ item }) => {
              const prediction = item.placePrediction;
              return (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                  }}
                  onPress={() => handlePlaceSelect(item)}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: Colors.BLACK,
                  }}>
                    {prediction.text.text}
                  </Text>
                  {prediction.structuredFormat && (
                    <Text style={{
                      fontSize: 14,
                      color: Colors.GRAY,
                      marginTop: 2,
                    }}>
                      {prediction.structuredFormat.secondaryText?.text}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

export default NewGooglePlacesSearch;