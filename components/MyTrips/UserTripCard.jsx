import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { GetPhotoRef } from '../../services/GooglePlaceApi';

// Move formatData outside component to avoid hook ordering issues
const formatData = (data) => {
    try {
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.log('Error parsing trip data:', error);
        return {};
    }
};

export default function UserTripCard({trip}) {
    const [destinationPhoto, setDestinationPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();
    const tripData = formatData(trip?.tripData);
    
    // Fetch destination-specific image when component mounts
    useEffect(() => {
        const fetchDestinationImage = async () => {
            const destinationName = trip?.tripPlan?.travelPlan?.location || tripData?.locationInfo?.name;
            if (destinationName) {
                console.log(`🖼️ Fetching destination image for: ${destinationName}`);
                const photoRef = await GetPhotoRef(destinationName);
                setDestinationPhoto(photoRef);
            }
            setLoading(false);
        };

        fetchDestinationImage();
    }, [trip?.tripPlan?.travelPlan?.location, tripData?.locationInfo?.name]);

    const getImageUrl = () => {
        // First try to use the fetched destination photo
        if (destinationPhoto) {
            if (destinationPhoto.startsWith('places/')) {
                return `https://places.googleapis.com/v1/${destinationPhoto}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            } else {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${destinationPhoto}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
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
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/trip-details',
                params: {
                    trip: JSON.stringify(trip)
                }
            })} 
            style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center'
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
    );
}