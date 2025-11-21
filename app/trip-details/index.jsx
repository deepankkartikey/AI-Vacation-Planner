import { View, Text, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Colors } from '../../constants/Colors';
import moment from 'moment'
import FlightInfo from '../../components/TripDetails/FlightInfo';
import HotelList from '../../components/TripDetails/HotelList';
import PlannedTrip from '../../components/TripDetails/PlannedTrip';
export default function TripDetails() {

    const navigation=useNavigation();
    const {trip}=useLocalSearchParams();
    const [tripDetails,setTripDetails]=useState(null);

    const formatData=(data)=>{
        try {
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.log('Error parsing trip data:', error);
            return {};
        }
    }
    useEffect(()=>{
        navigation.setOptions({
            headerShown:true,
            headerTransparent:true,
            headerTitle:''
        });

        if (trip) {
            try {
                setTripDetails(JSON.parse(trip));
            } catch (error) {
                console.log('Error parsing trip details:', error);
                setTripDetails(null);
            }
        }
    },[trip])

  return tripDetails&&(
    <ScrollView>
        {/* First try stored destination image, then fallback */}
        {tripDetails?.imageRefs?.destination ? (
            <Image 
                source={{uri: tripDetails.imageRefs.destination.startsWith('places/') 
                    ? `https://places.googleapis.com/v1/${tripDetails.imageRefs.destination}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`
                    : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${tripDetails.imageRefs.destination}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`
                }}
                style={{
                    width:'100%',
                    height:330,
                }}
            />
        ) : formatData(tripDetails?.tripData)?.locationInfo?.photoRef ? (
             <Image source={{uri:
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference='
            +(formatData(tripDetails?.tripData)?.locationInfo?.photoRef || '')
            +'&key='+process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}}
            style={{
                width:'100%',
                height:330,
            }}
            />
         ) : (
             <Image source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=330&fit=crop&auto=format' }}
                style={{
                    width:'100%',
                    height:330,
                }}
             />
         )}
        <View style={{
            padding:15,
            backgroundColor:Colors.WHITE,
            height:'100%',
            marginTop:-30,
            borderTopLeftRadius:30,
            borderTopRightRadius:30
        }}>
            <Text style={{
                fontSize:25,
                fontFamily:'outfit-bold'
            }}>{tripDetails?.tripPlan?.travelPlan?.location || 'Unknown Location'}</Text>
           <View style={{
            display:'flex',
            flexDirection:'row',
            gap:5,
            marginTop:5
           }}>
             <Text style={{
                fontFamily:'outfit',
                fontSize:18,
                color:Colors.GRAY
            }}>{formatData(tripDetails?.tripData)?.startDate ? moment(formatData(tripDetails.tripData).startDate).format('DD MMM yyyy') : 'Date TBD'}</Text>
              <Text style={{
                fontFamily:'outfit',
                fontSize:18,
                color:Colors.GRAY
            }}> - {formatData(tripDetails?.tripData)?.endDate ? moment(formatData(tripDetails.tripData)?.endDate).format('DD MMM yyyy') : 'Date TBD'}</Text>
         </View>
         <Text style={{
                fontFamily:'outfit',
                fontSize:17,
                color:Colors.GRAY
            }}>🚌 {formatData(tripDetails?.tripData)?.traveler?.title || 'Solo'}</Text>
        
        
        {/* Flight Info  */}
        <FlightInfo 
          flightData={tripDetails?.tripPlan?.travelPlan?.flight}
          destination={tripDetails?.tripPlan?.travelPlan?.location}
          startDate={formatData(tripDetails?.tripData)?.startDate}
          endDate={formatData(tripDetails?.tripData)?.endDate}
          travelers={formatData(tripDetails?.tripData)?.traveler?.title}
        />
        {/* Hotels List  */}
        <HotelList 
          hotelList={tripDetails?.tripPlan?.travelPlan?.hotels || []} 
          imageRefs={tripDetails?.imageRefs}
        />
        {/* Trip Day Planner Info */}
        <PlannedTrip 
          details={tripDetails?.tripPlan?.travelPlan?.itinerary || {}} 
          imageRefs={tripDetails?.imageRefs}
        />
        </View>
    </ScrollView>
  )
}