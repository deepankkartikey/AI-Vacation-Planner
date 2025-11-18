import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import moment from 'moment'
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
export default function UserTripCard({trip}) {
    const formatData=(data)=>{
        try {
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.log('Error parsing trip data:', error);
            return {};
        }
    }
    
    const router=useRouter();
    const tripData = formatData(trip?.tripData);
    
  return (

    <TouchableOpacity
    onPress={()=>router.push({pathname: '/trip-details',
    params:{
        trip:JSON.stringify(trip)
    }})} style={{
        marginTop:20,
        display:'flex',
        flexDirection:'row',
        gap:10,
        alignItems:'center'
    }}>
        {tripData?.locationInfo?.photoRef ? (
            <Image source={{uri:
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference='
            +tripData.locationInfo?.photoRef
            +'&key='+process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}}
            style={{
                width:100,
                    height:100,
                    borderRadius:15
            }}
            />
        ) : (
            <Image source={require('./../../assets/images/placeholder.jpeg')}
                style={{
                    width:100,
                    height:100,
                    borderRadius:15
                }}
            />
        )}
        <View>
            <Text style={{
                fontFamily:'outfit-medium',
                fontSize:18,
            }}>{trip?.tripPlan?.travelPlan?.location || 'Unknown Location'}</Text>
            <Text style={{
                fontFamily:'outfit',
                fontSize:14,
                color:Colors.GRAY
            }}>{tripData?.startDate ? moment(tripData.startDate).format('DD MMM yyyy') : 'Date TBD'}</Text>
            <Text
            style={{
                fontFamily:'outfit',
                fontSize:14,
                color:Colors.GRAY
            }}>Traveling: {tripData?.traveler?.title || 'Solo'}</Text>

        </View>
    </TouchableOpacity>
  )
}