import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Share, Alert, Platform, Modal, Clipboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import moment from 'moment'
import FlightInfo from '../../components/TripDetails/FlightInfo';
import HotelList from '../../components/TripDetails/HotelList';
import PlannedTrip from '../../components/TripDetails/PlannedTrip';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetails() {

    const navigation=useNavigation();
    const router=useRouter();
    const {trip}=useLocalSearchParams();
    const [tripDetails,setTripDetails]=useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const getShareUrl = () => {
        if (!tripDetails?.docId) return '';
        return `https://ai-vacation-planner-f40c0.web.app/trip?id=${tripDetails.docId}`;
    };

    const handleCopyLink = async () => {
        const shareUrl = getShareUrl();
        if (!shareUrl) {
            Alert.alert('Error', 'Cannot create share link. Trip ID is missing.');
            return;
        }

        try {
            if (Platform.OS === 'web') {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                await Clipboard.setString(shareUrl);
            }
            setShowShareModal(false);
            Alert.alert('Success', 'Link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
            Alert.alert('Error', 'Failed to copy link. Please try again.');
        }
    };

    const handleShareVia = async () => {
        const shareUrl = getShareUrl();
        if (!shareUrl) {
            Alert.alert('Error', 'Cannot share this trip. Trip ID is missing.');
            return;
        }

        const message = `Check out my ${tripDetails?.tripPlan?.travelPlan?.location || 'vacation'} trip itinerary!`;

        try {
            const result = await Share.share({
                message: Platform.OS === 'ios' ? message : `${message}\n\n${shareUrl}`,
                url: Platform.OS === 'ios' ? shareUrl : undefined,
                title: 'Share Trip Itinerary',
            });

            if (result.action === Share.sharedAction) {
                setShowShareModal(false);
                console.log('Trip shared successfully');
            }
        } catch (error) {
            console.error('Error sharing trip:', error);
            Alert.alert('Error', 'Failed to share trip. Please try again.');
        }
    };

    const handleShareTrip = () => {
        if (!tripDetails?.docId) {
            Alert.alert('Error', 'Cannot share this trip. Trip ID is missing.');
            return;
        }
        setShowShareModal(true);
    };

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
        
        {/* Floating Action Buttons */}
        <View style={{
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            {/* Back Button */}
            <TouchableOpacity 
                onPress={() => router.push('/(tabs)/mytrip')}
                style={{
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

            {/* Share Button */}
            <TouchableOpacity 
                onPress={handleShareTrip}
                style={{
                    backgroundColor: Colors.PRIMARY,
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
                <Ionicons name="share-social" size={22} color="white" />
            </TouchableOpacity>
        </View>

        {/* Share Modal */}
        <Modal
            visible={showShareModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowShareModal(false)}
        >
            <TouchableOpacity 
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end',
                }}
                activeOpacity={1}
                onPress={() => setShowShareModal(false)}
            >
                <View 
                    style={{
                        backgroundColor: Colors.WHITE,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingBottom: 30,
                    }}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Modal Header */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.LIGHT_GRAY,
                    }}>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: 'outfit-bold',
                            color: Colors.BLACK,
                        }}>Share Trip</Text>
                        <TouchableOpacity onPress={() => setShowShareModal(false)}>
                            <Ionicons name="close" size={28} color={Colors.GRAY} />
                        </TouchableOpacity>
                    </View>

                    {/* Share Options */}
                    <View style={{ padding: 20, gap: 15 }}>
                        {/* Copy Link Option */}
                        <TouchableOpacity
                            onPress={handleCopyLink}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 15,
                                backgroundColor: Colors.LIGHT_GRAY,
                                borderRadius: 15,
                                gap: 15,
                            }}
                        >
                            <View style={{
                                width: 45,
                                height: 45,
                                borderRadius: 25,
                                backgroundColor: Colors.PRIMARY + '20',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Ionicons name="copy-outline" size={24} color={Colors.PRIMARY} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 17,
                                    fontFamily: 'outfit-medium',
                                    color: Colors.BLACK,
                                }}>Copy Link</Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'outfit',
                                    color: Colors.GRAY,
                                    marginTop: 2,
                                }}>Share via clipboard</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.GRAY} />
                        </TouchableOpacity>

                        {/* Share Via Option */}
                        <TouchableOpacity
                            onPress={handleShareVia}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 15,
                                backgroundColor: Colors.LIGHT_GRAY,
                                borderRadius: 15,
                                gap: 15,
                            }}
                        >
                            <View style={{
                                width: 45,
                                height: 45,
                                borderRadius: 25,
                                backgroundColor: Colors.PRIMARY + '20',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Ionicons name="share-social-outline" size={24} color={Colors.PRIMARY} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 17,
                                    fontFamily: 'outfit-medium',
                                    color: Colors.BLACK,
                                }}>Share Via</Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'outfit',
                                    color: Colors.GRAY,
                                    marginTop: 2,
                                }}>WhatsApp, Messages, Email...</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.GRAY} />
                        </TouchableOpacity>
                    </View>

                    {/* Share URL Preview */}
                    <View style={{
                        marginHorizontal: 20,
                        padding: 15,
                        backgroundColor: Colors.LIGHT_GRAY + '80',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: Colors.LIGHT_GRAY,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontFamily: 'outfit',
                            color: Colors.GRAY,
                            marginBottom: 5,
                        }}>Share Link:</Text>
                        <Text 
                            style={{
                                fontSize: 13,
                                fontFamily: 'outfit-medium',
                                color: Colors.PRIMARY,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {getShareUrl()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    </View>
  )
}