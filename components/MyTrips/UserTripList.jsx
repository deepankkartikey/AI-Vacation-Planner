import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import moment from 'moment'
import { Colors } from '../../constants/Colors'
import UserTripCard from './UserTripCard'
import { useRouter } from 'expo-router'

export default function UserTripList({userTrips, onTripDeleted}) {
    const [trips, setTrips] = useState(userTrips || []);
    
    // Update trips when userTrips prop changes
    React.useEffect(() => {
        setTrips(userTrips || []);
    }, [userTrips]);

    const handleTripDelete = (deletedTripId) => {
        // Remove the deleted trip from local state for immediate UI update
        setTrips(prevTrips => prevTrips.filter(trip => trip.docId !== deletedTripId));
        
        // Notify parent component to refresh data
        if (onTripDeleted) {
            onTripDeleted(deletedTripId);
        }
    };

    // Safely parse the trip data with error handling
    let LatestTrip = {};
    try {
        if (trips && trips[0] && trips[0].tripData) {
            LatestTrip = JSON.parse(trips[0].tripData);
        }
    } catch (error) {
        console.log('Error parsing trip data:', error);
        LatestTrip = {};
    }
    
    const router=useRouter();
   
   
  return trips && trips.length > 0 && (
    <View>
      <View style={{
        marginTop:20
      }}>
       {LatestTrip?.locationInfo?.photoRef? 
       <Image source={{uri:
        'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference='
        +LatestTrip.locationInfo?.photoRef
        +'&key='+process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}}
        style={{
            width:'100%',
            height:240,
            objectFit:'cover',
            borderRadius:15
        }}
        />
       :
       <Image 
        source={require('./../../assets/images/placeholder.jpeg')}
            style={{
                width:'100%',
                height:240,
                objectFit:'cover',
                borderRadius:15
            }}
        />}
        <View style={{marginTop:10}}>
            <Text style={{
                fontFamily:'outfit-medium',
                fontSize:24
            }}>{trips[0]?.tripPlan?.travelPlan?.location || 'Unknown Location'}</Text>
            <View style={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'space-between',marginTop:5
            }}>
            <Text style={{
                fontFamily:'outfit',
                fontSize:17,
                color:Colors.GRAY
            }}>{LatestTrip?.startDate ? moment(LatestTrip.startDate).format('DD MMM yyyy') : 'Date TBD'}</Text>

            <Text style={{
                fontFamily:'outfit',
                fontSize:17,
                color:Colors.GRAY
            }}>🚌 {LatestTrip?.traveler?.title || 'Solo'}</Text>
            </View>
            <TouchableOpacity 
            onPress={()=>router.push({pathname:'/trip-details',params:{
                trip:JSON.stringify(trips[0])
            }})}
            style={{
                backgroundColor:Colors.PRIMARY,
                padding:15,
                borderRadius:15,
                marginTop:10
            }}>
                <Text style={{
                    color:Colors.WHITE,
                    textAlign:'center',
                    fontFamily:'outfit-medium',
                    fontSize:15
                }}>See your plan</Text>
            </TouchableOpacity>
        </View>
            
        {trips.slice(1).map((trip,index)=>(
            <UserTripCard 
                trip={trip} 
                key={trip.docId || index} 
                onDelete={handleTripDelete}
            />
        ))}
      </View>
    </View>
  )
}