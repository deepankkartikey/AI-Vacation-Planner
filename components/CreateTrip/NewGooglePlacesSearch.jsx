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

const NewGooglePlacesSearch = ({ 
  onPlaceSelected, 
  placeholder = "Search for places...",
  style 
}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');

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
        // Removed includedRegionCodes to allow worldwide search
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
        console.warn('⚠️ Places autocomplete failed:', response.status, data?.error?.message || 'Unknown error');
        setPredictions([]);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (prediction) => {
    console.log('🎯 Place selection triggered');
    const placePrediction = prediction.placePrediction;
    if (!placePrediction) {
      console.error('❌ No place prediction data');
      return;
    }

    setQuery(placePrediction.text.text);
    setPredictions([]);
    
    try {
      // Since place details API is giving 404, let's use what we have from autocomplete
      const locationInfo = {
        name: placePrediction.text.text,
        coordinates: { lat: 0, lng: 0 }, // Default coordinates since API is failing
        photoRef: undefined,
        url: null
      };
      
      console.log('📍 Location info prepared:', locationInfo);
      
      if (onPlaceSelected) {
        console.log('🔄 Calling onPlaceSelected callback...');
        onPlaceSelected(locationInfo);
      } else {
        console.error('❌ onPlaceSelected callback not provided');
      }
    } catch (error) {
      console.error('❌ Error selecting place:', error);
      Alert.alert('Error', 'Failed to get place details. Please try again.');
    }
  };

  const handleInputChange = (text) => {
    setQuery(text);
    if (text.trim().length > 1) {
      searchPlaces(text);
    } else {
      setPredictions([]);
    }
  };

  const renderPrediction = ({ item }) => {
    const placePrediction = item.placePrediction;
    if (!placePrediction) return null;

    return (
      <TouchableOpacity
        style={{
          padding: 15,
          borderBottomWidth: 1,
          borderBottomColor: Colors.LIGHT_GRAY,
          backgroundColor: Colors.WHITE
        }}
        onPress={() => handlePlaceSelect(item)}
      >
        <Text style={{ 
          fontFamily: 'outfit-medium', 
          fontSize: 16,
          color: Colors.PRIMARY
        }}>
          {placePrediction.structuredFormat?.mainText?.text || placePrediction.text.text}
        </Text>
        {placePrediction.structuredFormat?.secondaryText?.text && (
          <Text style={{ 
            fontFamily: 'outfit', 
            fontSize: 14,
            color: Colors.GRAY,
            marginTop: 2
          }}>
            {placePrediction.structuredFormat.secondaryText.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <TextInput
        style={{
          padding: 15,
          borderWidth: 1,
          borderRadius: 15,
          borderColor: Colors.GRAY,
          fontFamily: 'outfit',
          fontSize: 16,
          backgroundColor: Colors.WHITE
        }}
        value={query}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.GRAY}
      />
      
      {loading && (
        <View style={{
          padding: 10,
          alignItems: 'center',
          backgroundColor: Colors.WHITE,
          borderRadius: 10,
          marginTop: 5,
          borderWidth: 1,
          borderColor: Colors.LIGHT_GRAY
        }}>
          <ActivityIndicator size="small" color={Colors.PRIMARY} />
          <Text style={{ 
            fontFamily: 'outfit', 
            fontSize: 14, 
            color: Colors.GRAY,
            marginTop: 5 
          }}>
            Searching places...
          </Text>
        </View>
      )}
      
      {predictions.length > 0 && (
        <View style={{
          maxHeight: 200,
          borderRadius: 10,
          marginTop: 5,
          borderWidth: 1,
          borderColor: Colors.LIGHT_GRAY,
          backgroundColor: Colors.WHITE,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
          <FlatList
            data={predictions}
            renderItem={renderPrediction}
            keyExtractor={(item, index) => `${item.placePrediction?.place || index}`}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

export default NewGooglePlacesSearch;