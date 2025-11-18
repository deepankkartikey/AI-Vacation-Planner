import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import {CreateTripContext} from './../../context/CreateTripContext'
import NewGooglePlacesSearch from '../../components/CreateTrip/NewGooglePlacesSearch';
export default function SearchPlace() {

  const navigation=useNavigation();
  const {tripData,setTripData}=useContext(CreateTripContext);
  const router=useRouter();
  useEffect(()=>{
    navigation.setOptions({
      headerShown:true,
      headerTransparent:true,
      headerTitle:'Search'
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
      paddingTop:75,
      backgroundColor:Colors.WHITE,
      height:'100%'
    }}
    >
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
      
      {/* Debug Section - Remove in production */}
      <View style={{ marginTop: 30, padding: 20, backgroundColor: Colors.LIGHT_GRAY, borderRadius: 10 }}>
        <Text style={{ fontFamily: 'outfit-medium', fontSize: 16, marginBottom: 10 }}>
          Debug Info:
        </Text>
        <Text style={{ fontFamily: 'outfit', fontSize: 14, color: Colors.GRAY }}>
          Trip Data: {JSON.stringify(tripData, null, 2)}
        </Text>
        
        <TouchableOpacity 
          style={{
            backgroundColor: Colors.PRIMARY,
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            alignItems: 'center'
          }}
          onPress={() => {
            console.log('🧪 Testing manual navigation...');
            router.push('/create-trip/select-traveler');
          }}
        >
          <Text style={{ color: Colors.WHITE, fontFamily: 'outfit' }}>
            Test Navigation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}