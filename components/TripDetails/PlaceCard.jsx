import { View, Text, Image, TouchableOpacity, Linking, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Colors } from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { checkFavorite, addFavorite, removeFavorite } from '../../services/FavoritesService';

export default function PlaceCard({place, dayKey, index, imageRefs, tripId}) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkIfFavorite();
    }, []);

    const checkIfFavorite = async () => {
        const favoriteStatus = await checkFavorite(tripId, dayKey, place?.placeName);
        setIsFavorite(favoriteStatus);
    };

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFavorite(tripId, dayKey, place?.placeName);
                setIsFavorite(false);
            } else {
                await addFavorite(tripId, dayKey, place);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const getImageUrl = () => {
        // First try to use stored place image from imageRefs (convert index to string)
        if (imageRefs?.places?.[dayKey]?.[index.toString()]) {
            const photoRef = imageRefs.places[dayKey][index.toString()];
            if (photoRef.startsWith('places/')) {
                return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            } else {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            }
        }
        
        // Fallback to a travel/destination image from unsplash
        return `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format`;
    };

    const openGoogleMaps = async () => {
        try {
            const query = encodeURIComponent(place?.placeName || '');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
            
            await WebBrowser.openBrowserAsync(mapsUrl, {
                toolbarColor: Colors.PRIMARY,
                controlsColor: Colors.WHITE,
                showTitle: true,
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            });
        } catch (error) {
            console.error('Error opening Google Maps:', error);
            Alert.alert('Error', 'Failed to open Google Maps');
        }
    };

    const openBookingOptions = async () => {
        try {
            const placeName = encodeURIComponent(place?.placeName || '');
            
            // Try activity booking platforms
            const bookingOptions = [
                { name: 'GetYourGuide', url: `https://www.getyourguide.com/s/?q=${placeName}` },
                { name: 'Viator', url: `https://www.viator.com/searchResults/all?text=${placeName}` },
                { name: 'Google Search', url: `https://www.google.com/search?q=book+${placeName}+tickets` },
            ];

            // For now, open GetYourGuide as primary booking platform
            setLoading(true);
            await WebBrowser.openBrowserAsync(bookingOptions[0].url, {
                toolbarColor: Colors.PRIMARY,
                controlsColor: Colors.WHITE,
                showTitle: true,
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error opening booking:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to open booking page');
        }
    };

  return (
    <View style={{
                     
        backgroundColor:Colors.LIGHT_BLUE,
       padding:10,
       borderRadius:15,
       borderColor:Colors.GRAY,
       marginTop:20
   }}>
       {/* Image with Favorite Button */}
       <View style={{ position: 'relative' }}>
           <Image 
                source={{ uri: getImageUrl() }}
                style={{
                    width:'100%',
                    height:140,
                    borderRadius:15
                }}
                defaultSource={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format' }}
            />
            {/* Favorite Heart Icon */}
            <TouchableOpacity 
                onPress={toggleFavorite}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 20,
                    padding: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isFavorite ? "#FF385C" : Colors.GRAY} 
                />
            </TouchableOpacity>
       </View>
       
       <View style={{
           marginTop:5
       }}>
       <Text style={{
           fontFamily:'outfit-bold',
           fontSize:20
       }}>{place?.placeName}</Text>
       <Text style={{
           fontFamily:'outfit',
           fontSize:14,
           color:Colors.GRAY,
           marginTop: 3
       }}>{place.placeDetails}</Text>
       
       {/* Pricing and Time Info */}
       <View style={{
           marginTop: 10
       }}>
           <Text style={{
               fontFamily:'outfit',
               fontSize:15,
               marginTop:3
           }}>🎟️ Entry Fee: 
           <Text style={{
               fontFamily:'outfit-bold'
           }}> {place?.ticketPricing || 'Free'}</Text></Text>
           
           <Text style={{
               fontFamily:'outfit',
               fontSize:15,
               marginTop:3
           }}>⏱️ Time to Spend: <Text style={{
               fontFamily:'outfit-bold'
           }}>{place?.timeToTravel || 'N/A'}</Text></Text>

           {place?.openingHours && (
               <Text style={{
                   fontFamily:'outfit',
                   fontSize:15,
                   marginTop:3
               }}>🕐 Hours: <Text style={{
                   fontFamily:'outfit-bold'
               }}>{place.openingHours}</Text></Text>
           )}

           {place?.rating && (
               <Text style={{
                   fontFamily:'outfit',
                   fontSize:15,
                   marginTop:3
               }}>⭐ Rating: <Text style={{
                   fontFamily:'outfit-bold'
               }}>{place.rating}</Text></Text>
           )}
       </View>

       {/* Action Buttons */}
       <View style={{
           display:'flex',
           flexDirection:'row',
           gap: 10,
           marginTop: 15,
           justifyContent: 'space-between'
       }}>
           {/* View on Map Button */}
           <TouchableOpacity 
               onPress={openGoogleMaps}
               style={{
                   backgroundColor: Colors.PRIMARY,
                   paddingVertical: 10,
                   paddingHorizontal: 15,
                   borderRadius: 10,
                   flexDirection: 'row',
                   alignItems: 'center',
                   gap: 5,
                   flex: 1
               }}
           >
               <Ionicons name="map" size={18} color="white" />
               <Text style={{
                   color: Colors.WHITE,
                   fontFamily: 'outfit-medium',
                   fontSize: 14
               }}>View on Map</Text>
           </TouchableOpacity>

           {/* Book Activity Button */}
           <TouchableOpacity 
               onPress={openBookingOptions}
               disabled={loading}
               style={{
                   backgroundColor: '#FF385C',
                   paddingVertical: 10,
                   paddingHorizontal: 15,
                   borderRadius: 10,
                   flexDirection: 'row',
                   alignItems: 'center',
                   gap: 5,
                   flex: 1,
                   opacity: loading ? 0.6 : 1
               }}
           >
               <Ionicons name="ticket" size={18} color="white" />
               <Text style={{
                   color: Colors.WHITE,
                   fontFamily: 'outfit-medium',
                   fontSize: 14
               }}>{loading ? 'Loading...' : 'Book Activity'}</Text>
           </TouchableOpacity>
       </View>
       </View>
   </View>
  )
}