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
      const url = `https://places.googleapis.com/v1/places:autocomplete`;
      const requestBody = {
        input: input,
        sessionToken: sessionToken,
        languageCode: 'en',
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country'],
        includedRegionCodes: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU', 'JP', 'CN', 'IN', 'BR'],
      };
      
      console.log('📋 Autocomplete request:', { url, body: requestBody });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Autocomplete response status:', response.status);
      const data = await response.json();
      console.log('📋 Autocomplete data:', data);
      
      if (response.ok && data.suggestions) {
        const filteredPredictions = data.suggestions.filter(item => item.placePrediction);
        console.log('✅ Found predictions:', filteredPredictions.length);
        setPredictions(filteredPredictions);
      } else {
        console.error('❌ Places API Error:', data);
        if (data.error?.message?.includes('billing')) {
          Alert.alert(
            'Google Places API Error',
            'Please enable billing for the Google Cloud Project. Visit: https://console.cloud.google.com/billing',
            [{ text: 'OK' }]
          );
        }
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
        console.error('❌ HTTP Error:', response.status, response.statusText);
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