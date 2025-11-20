import { View, Text, Image, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native'
import React, { useRef } from 'react'
import moment from 'moment'
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { deleteTrip } from '../../services/TripService';

// Move formatData outside component to avoid hook ordering issues
const formatData = (data) => {
    try {
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.log('Error parsing trip data:', error);
        return {};
    }
};

export default function UserTripCard({trip, onDelete}) {
    const router = useRouter();
    const tripData = formatData(trip?.tripData);
    const translateX = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    
    const handleSwipe = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const handleSwipeStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;
            
            // If swiped left enough or with enough velocity, show delete
            if (translationX < -100 || velocityX < -500) {
                // Animate to show delete button
                Animated.spring(translateX, {
                    toValue: -80,
                    useNativeDriver: true,
                }).start();
            } else {
                // Snap back to original position
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Trip",
            `Are you sure you want to delete your trip to ${trip?.tripPlan?.travelPlan?.location || 'this destination'}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {
                        // Reset position when cancelled
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: true,
                        }).start();
                    }
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await deleteTrip(trip.docId);
                            if (result.success) {
                                // Animate card out
                                Animated.timing(translateX, {
                                    toValue: -screenWidth,
                                    duration: 300,
                                    useNativeDriver: true,
                                }).start(() => {
                                    // Call parent component's onDelete to refresh the list
                                    if (onDelete) {
                                        onDelete(trip.docId);
                                    }
                                });
                            } else {
                                Alert.alert("Error", "Failed to delete trip. Please try again.");
                                // Reset position on error
                                Animated.spring(translateX, {
                                    toValue: 0,
                                    useNativeDriver: true,
                                }).start();
                            }
                        } catch (error) {
                            Alert.alert("Error", "An error occurred while deleting the trip.");
                            // Reset position on error
                            Animated.spring(translateX, {
                                toValue: 0,
                                useNativeDriver: true,
                            }).start();
                        }
                    }
                }
            ]
        );
    };
    
    const getImageUrl = () => {
        // First try to use stored destination image from imageRefs
        if (trip?.imageRefs?.destination) {
            const photoRef = trip.imageRefs.destination;
            if (photoRef.startsWith('places/')) {
                return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            } else {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            }
        }
        
        // Fallback to stored photoRef (if any)
        if (tripData?.locationInfo?.photoRef) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${tripData.locationInfo.photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
        }
        
        // Final fallback - destination-specific image from Unsplash based on city/country
        const destinationName = trip?.tripPlan?.travelPlan?.location || tripData?.locationInfo?.name || '';
        if (destinationName.toLowerCase().includes('paris')) {
            return 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop&auto=format';
        } else if (destinationName.toLowerCase().includes('london')) {
            return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format';
        } else if (destinationName.toLowerCase().includes('tokyo')) {
            return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop&auto=format';
        } else if (destinationName.toLowerCase().includes('new york')) {
            return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop&auto=format';
        } else if (destinationName.toLowerCase().includes('quebec')) {
            return 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=300&fit=crop&auto=format';
        } else {
            // Generic beautiful travel destination
            return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format';
        }
    };

    return (
        <View style={{
            marginTop: 15,
        }}>
            {/* Delete button background */}
            <View style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: 80,
                backgroundColor: '#FF3B30',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15,
            }}>
                <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Ionicons name="trash" size={24} color="white" />
                    <Text style={{
                        color: 'white',
                        fontSize: 12,
                        fontFamily: 'outfit',
                        marginTop: 4
                    }}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Main card content */}
            <PanGestureHandler
                onGestureEvent={handleSwipe}
                onHandlerStateChange={handleSwipeStateChange}
                activeOffsetX={[-10, 10]}
            >
                <Animated.View style={{
                    transform: [{ translateX }],
                    backgroundColor: Colors.WHITE,
                    borderRadius: 15,
                }}>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/trip-details',
                            params: {
                                trip: JSON.stringify(trip)
                            }
                        })} 
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                            padding: 15,
                            backgroundColor: Colors.WHITE,
                            borderRadius: 15,
                        }}
                    >
                        <Image 
                            source={{ uri: getImageUrl() }}
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 15
                            }}
                            defaultSource={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format' }}
                        />
                        <View>
                            <Text style={{
                                fontFamily: 'outfit-medium',
                                fontSize: 18,
                            }}>{trip?.tripPlan?.travelPlan?.location || 'Unknown Location'}</Text>
                            <Text style={{
                                fontFamily: 'outfit',
                                fontSize: 14,
                                color: Colors.GRAY
                            }}>{tripData?.startDate ? moment(tripData.startDate).format('DD MMM yyyy') : 'Date TBD'}</Text>
                            <Text style={{
                                fontFamily: 'outfit',
                                fontSize: 14,
                                color: Colors.GRAY
                            }}>Traveling: {tripData?.traveler?.title || 'Solo'}</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}