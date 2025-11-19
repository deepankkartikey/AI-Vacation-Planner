import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import { GetPhotoRef } from '../../services/GooglePlaceApi';

export default function PlaceCard({place, location}) {
    const [photoRef,setPhotoRef]=useState();
    useEffect(()=>{
        GetGooglePhotoRef();
    },[])
    
    const GetGooglePhotoRef=async()=>{
        const result= await GetPhotoRef(place.placeName, location);
        setPhotoRef(result);
    }

    const getImageUrl = () => {
        if (photoRef) {
            // Check if it's the new Places API (New) photo name format
            if (photoRef.startsWith('places/')) {
                return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            } else {
                // Legacy photo reference format (fallback)
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            }
        }
        // Fallback to a travel/destination image from unsplash
        return `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format`;
    };

  return (
    <View style={{
                     
        backgroundColor:Colors.LIGHT_BLUE,
       padding:10,
       borderRadius:15,
       borderColor:Colors.GRAY,
       marginTop:20
   }}>
       <Image 
            source={{ uri: getImageUrl() }}
            style={{
                width:'100%',
                height:140,
                borderRadius:15
            }}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format' }}
        />
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
           color:Colors.GRAY
       }}>{place.placeDetails}</Text>
       <View style={{
           display:'flex',
           flexDirection:'row',
           alignItems:'center',
           justifyContent:'space-between'
       }}>
       <View>
           <Text style={{
               fontFamily:'outfit',
               fontSize:17,marginTop:5
           }}>🎟️ Ticket Price: 
           <Text style={{
               fontFamily:'outfit-bold'
           }}> {place?.ticketPricing}</Text></Text>
               <Text style={{
               fontFamily:'outfit',
               fontSize:17,marginTop:5
           }}>⏱️ Time to Travel:  <Text style={{
               fontFamily:'outfit-bold'
           }}>{place?.timeToTravel}</Text></Text>
       </View>
           <TouchableOpacity style={{
               backgroundColor:Colors.PRIMARY,
               padding:8,
               borderRadius:7
           }}>
               <Ionicons name="navigate" size={20} color="white" />
           </TouchableOpacity>
       </View>
       </View>
   </View>
  )
}