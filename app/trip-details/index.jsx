import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import moment from 'moment'
import FlightInfo from '../../components/TripDetails/FlightInfo';
import HotelList from '../../components/TripDetails/HotelList';
import PlannedTrip from '../../components/TripDetails/PlannedTrip';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../configs/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetails() {

    const navigation=useNavigation();
    const router=useRouter();
    const {trip}=useLocalSearchParams();
    const [tripDetails,setTripDetails]=useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);

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
            headerShown:false
        });

        if (trip) {
            try {
                const parsedTrip = JSON.parse(trip);
                setTripDetails(parsedTrip);
                
                // Set up real-time listener for any trip with docId
                if (parsedTrip.docId) {
                    // Track enhancement status
                    if (parsedTrip.isEnhanced === false) {
                        setIsEnhancing(true);
                        console.log('🎨 Trip is being enhanced, setting up real-time listener...');
                    } else {
                        console.log('👀 Setting up real-time listener for trip updates...');
                    }
                    
                    // Set up real-time listener for this trip document
                    const unsubscribe = onSnapshot(
                        doc(db, 'UserTrips', parsedTrip.docId),
                        (docSnapshot) => {
                            if (docSnapshot.exists()) {
                                const updatedTrip = docSnapshot.data();
                                console.log('🔄 Trip document updated:', {
                                    isEnhanced: updatedTrip.isEnhanced,
                                    hasImages: !!updatedTrip.imageRefs,
                                    itineraryDays: Object.keys(updatedTrip.tripPlan?.travelPlan?.itinerary || {}).length
                                });
                                
                                setTripDetails(updatedTrip);
                                
                                // Update enhancement status
                                if (updatedTrip.isEnhanced === true && isEnhancing) {
                                    console.log('✅ Enhancement complete! Updated UI.');
                                    setIsEnhancing(false);
                                }
                            }
                        },
                        (error) => {
                            console.error('❌ Error listening to trip updates:', error);
                            setIsEnhancing(false);
                        }
                    );
                    
                    // Cleanup listener on unmount
                    return () => {
                        console.log('🧹 Cleaning up trip listener');
                        unsubscribe();
                    };
                }
            } catch (error) {
                console.log('Error parsing trip details:', error);
                setTripDetails(null);
            }
        }
    },[trip])

  return tripDetails&&(
    <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ position: 'relative' }}>
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
            </View>
        <View style={{
            padding:15,
            backgroundColor:Colors.WHITE,
            height:'100%',
            marginTop:-30,
            borderTopLeftRadius:30,
            borderTopRightRadius:30
        }}>
            {/* Enhancement in progress banner */}
            {isEnhancing && (
                <View style={{
                    backgroundColor: Colors.PRIMARY + '20',
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Colors.PRIMARY
                }}>
                    <ActivityIndicator size="small" color={Colors.PRIMARY} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: 'outfit-medium',
                            fontSize: 14,
                            color: Colors.PRIMARY
                        }}>Enhancing your trip...</Text>
                        <Text style={{
                            fontFamily: 'outfit',
                            fontSize: 12,
                            color: Colors.GRAY,
                            marginTop: 2
                        }}>Adding detailed descriptions, pricing, and images</Text>
                    </View>
                </View>
            )}
            
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
          tripId={tripDetails?.docId}
          location={tripDetails?.tripPlan?.travelPlan?.location}
          tripData={formatData(tripDetails?.tripData)}
        />
        </View>
        </ScrollView>
        
        {/* Floating Back Button */}
        <TouchableOpacity 
            onPress={() => router.push('/(tabs)/mytrip')}
            style={{
                position: 'absolute',
                top: 50,
                left: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: 10,
                borderRadius: 25,
                width: 45,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
            }}
        >
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
    </View>
  )
}