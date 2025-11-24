import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import {CreateTripContext} from './../../context/CreateTripContext'
import NewGooglePlacesSearch from '../../components/CreateTrip/NewGooglePlacesSearch';
import { Ionicons } from '@expo/vector-icons';

export default function SearchPlace() {

  const navigation=useNavigation();
  const {tripData,setTripData}=useContext(CreateTripContext);
  const router=useRouter();
  useEffect(()=>{
    navigation.setOptions({
      headerShown:false
    })
  },[]);

  useEffect(()=>{
    console.log(tripData);
  },[tripData]);

  const handlePlaceSelect = (locationInfo) => {
    console.log('🏃‍♂️ Place selection handler triggered');
    console.log('📍 Selected place data:', locationInfo);
    
    if (!locationInfo) {
      console.error('❌ No location info received');
      return;
    }
    
    const updatedTripData = {
      ...tripData,
      locationInfo: {
        name: locationInfo.name,
        coordinates: locationInfo.coordinates,
        photoRef: locationInfo.photoRef,
        url: locationInfo.url
      }
    };
    
    console.log('💾 Updating trip data:', updatedTripData);
    setTripData(updatedTripData);
    
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      console.log('🚀 Navigating to select-traveler...');
      router.push('/create-trip/select-traveler');
    }, 100);
  };

  return (
    <View 
    style={{
      padding:25,
      paddingTop:50,
      backgroundColor:Colors.WHITE,
      height:'100%'
    }}
    >
      <TouchableOpacity 
        onPress={() => {
          // Check if there's a screen to go back to
          if (router.canGoBack()) {
            router.back();
          } else {
            // If no screen to go back to, navigate to mytrip tab
            router.replace('/(tabs)/mytrip');
          }
        }}
        style={{ marginBottom: 20 }}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={{
        fontSize: 25,
        fontFamily: 'outfit-bold',
        marginBottom: 10
      }}>
        Search Your Destination
      </Text>
      
      <Text style={{
        fontSize: 18,
        fontFamily: 'outfit',
        color: Colors.GRAY,
        marginBottom: 20
      }}>
        Find your perfect travel destination
      </Text>
      
      <NewGooglePlacesSearch 
        placeholder="Search for cities, countries, places..."
        onPlaceSelected={handlePlaceSelect}
      />
    </View>
  )
}