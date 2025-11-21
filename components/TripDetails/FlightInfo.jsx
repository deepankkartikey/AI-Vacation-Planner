import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Colors } from '../../constants/Colors'
import { getUserLocation, getAirportName } from '../../services/LocationService'
import * as WebBrowser from 'expo-web-browser';

export default function FlightInfo({flightData, destination, startDate, endDate, travelers}) {
  const [userAirport, setUserAirport] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationCity, setLocationCity] = useState('');
  
  useEffect(() => {
    // Get user's location when component mounts
    fetchUserLocation();
  }, []);
  
  const fetchUserLocation = async () => {
    setLoadingLocation(true);
    const locationData = await getUserLocation();
    
    if (locationData.success) {
      setUserAirport(locationData.airport);
      setLocationCity(locationData.city || '');
      console.log('✅ Detected airport:', locationData.airport, 'in', locationData.city);
    } else {
      // Use fallback airport
      setUserAirport(locationData.fallbackAirport || 'YYC');
      console.log('⚠️ Using fallback airport:', locationData.fallbackAirport);
    }
    
    setLoadingLocation(false);
  };
  
  const openGoogleFlights = async () => {
    try {
      // Use detected airport or fallback
      const origin = userAirport || 'YYC';
      const dest = destination || '';
      
      // Google Flights URL format
      let flightsUrl = `https://www.google.com/travel/flights`;
      
      // Add search parameters
      const params = new URLSearchParams();
      if (dest) {
        params.append('q', `flights to ${dest} from ${origin}`);
      }
      
      const fullUrl = `${flightsUrl}?${params.toString()}`;
      
      console.log('🛫 Opening Google Flights:', fullUrl);
      console.log('📍 From:', origin, `(${getAirportName(origin)})`);
      console.log('📍 To:', dest);
      
      // Open in in-app browser instead of Safari
      // This provides a "Done" button to return to the app
      await WebBrowser.openBrowserAsync(fullUrl, {
        toolbarColor: Colors.PRIMARY,
        controlsColor: Colors.WHITE,
        showTitle: true,
        enableBarCollapsing: false,
        // iOS specific
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        // Android specific
        showInRecents: true,
      });
      
      console.log('✅ Browser closed, user returned to app');
    } catch (error) {
      console.error('Error opening Google Flights:', error);
      Alert.alert('Error', 'Failed to open Google Flights. Please try again.');
    }
  };
  
  const getTravelerCount = (travelerInfo) => {
    if (!travelerInfo) return 1;
    
    // Map traveler types to passenger counts
    const travelerMap = {
      'Just Me': 1,
      'Solo': 1,
      'A Couple': 2,
      'Couple': 2,
      'Family': 4,
      'Friends': 3
    };
    
    return travelerMap[travelerInfo] || 1;
  };
  return (
    <View style={{
        marginTop:20,
       borderWidth:1,
       borderColor:Colors.LIGHT_GRAY,
     
        padding:10,
        borderRadius:15
    }}>
        <View style={{
            display:'flex',
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
        }}>
        <Text style={{
        fontFamily:'outfit-bold',
        fontSize:20
      }}>✈️ Flights</Text>
        <TouchableOpacity 
        onPress={openGoogleFlights}
        disabled={loadingLocation}
        style={{
        backgroundColor: loadingLocation ? Colors.GRAY : Colors.PRIMARY,
        padding:5,
        width:100,
        borderRadius:7,
        marginTop:7
      }}>
        {loadingLocation ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <Text style={{
              textAlign:'center',
              color:Colors.WHITE,
              fontFamily:'outfit',
          }}>Book Here</Text>
        )}
      </TouchableOpacity>
        </View>
     
      {userAirport && (
        <Text style={{
          fontFamily:'outfit',
          fontSize:14,
          marginTop:7,
          color:Colors.GRAY
        }}>📍 From: {userAirport} {locationCity && `(${locationCity})`}</Text>
      )}
      <Text style={{
        fontFamily:'outfit',
        fontSize:17,
        marginTop:7
      }}>Airline: Delta</Text>
      <Text style={{
        fontFamily:'outfit',
        fontSize:17
      }}>Price: {flightData?.price || 'TBD'}</Text>
     
    </View>
  )
}