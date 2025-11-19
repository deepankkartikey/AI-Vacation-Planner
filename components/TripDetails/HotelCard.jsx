import { View, Text, Image } from 'react-native'
import React from 'react'

export default function HotelCard({item, index, imageRefs}) {
    const getImageUrl = () => {
        // First try to use stored hotel image from imageRefs (convert index to string)
        if (imageRefs?.hotels?.[index.toString()]) {
            const photoRef = imageRefs.hotels[index.toString()];
            if (photoRef.startsWith('places/')) {
                return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            } else {
                return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`;
            }
        }
        
        // Fallback to a generic hotel image from a free service
        return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format`;
    };

    return (
    <View style={{
        marginRight:20,
        width:180,
    }}>
        <Image 
            source={{ uri: getImageUrl() }}
            style={{
                width:180,
                height:120,
                borderRadius:15,
            }}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format' }}
        />
        <View style={{
            padding:5
        }}>
            <Text style={{
                fontFamily:'outfit-medium',
                fontSize:17,
                
            }}>{item.hotelName}</Text>

            <View style={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'space-between'
            }}>
                <Text style={{
                    fontFamily:'outfit'
                }}>⭐ {item.rating}</Text>
                  <Text style={{
                    fontFamily:'outfit'
                }}>💰 {item.price}</Text>
            </View>
        </View>
    </View>
  )
}