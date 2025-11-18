import { View, Text } from 'react-native'
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

  const handlePlaceSelect = (placeData) => {
    console.log('Selected place:', placeData);
    
    setTripData({
      locationInfo: {
        name: placeData.description,
        coordinates: placeData.geometry?.location,
        photoRef: placeData.photos?.[0]?.name,
        url: placeData.website
      }
    });

    router.push('/create-trip/select-traveler');
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
        onPlaceSelect={handlePlaceSelect}
      />
    </View>
  )
}