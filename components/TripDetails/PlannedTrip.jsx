import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import PlaceCard from './PlaceCard';
import { Colors } from '../../constants/Colors';

export default function PlannedTrip({details, imageRefs, tripId}) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Activity type filters
  const filters = [
    { id: 'all', label: '🗺️ All', keywords: [] },
    { id: 'attractions', label: '🎡 Attractions', keywords: ['museum', 'tower', 'monument', 'landmark', 'palace', 'castle', 'temple', 'church', 'cathedral'] },
    { id: 'restaurants', label: '🍽️ Dining', keywords: ['restaurant', 'cafe', 'food', 'dining', 'bar', 'bakery', 'cuisine'] },
    { id: 'nature', label: '🌳 Nature', keywords: ['park', 'garden', 'beach', 'lake', 'mountain', 'forest', 'nature', 'botanical'] },
    { id: 'shopping', label: '🛍️ Shopping', keywords: ['market', 'shopping', 'mall', 'store', 'bazaar', 'boutique'] },
    { id: 'entertainment', label: '🎭 Entertainment', keywords: ['theater', 'cinema', 'show', 'performance', 'concert', 'nightlife', 'club'] },
  ];

  // Filter places based on selected category
  const filterPlace = (place) => {
    if (selectedFilter === 'all') return true;

    const filter = filters.find(f => f.id === selectedFilter);
    if (!filter) return true;

    const placeText = `${place?.placeName} ${place?.placeDetails}`.toLowerCase();
    return filter.keywords.some(keyword => placeText.includes(keyword));
  };

  return (
    <View style={{
        marginTop:20
    }}>
      <Text style={{
        fontSize:20,
        fontFamily:'outfit-bold'
      }}>🏕️ Plan Details</Text>

      {/* Activity Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{
          marginTop: 15,
          marginBottom: 5
        }}
      >
        <View style={{
          flexDirection: 'row',
          gap: 10,
          paddingRight: 20
        }}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              style={{
                backgroundColor: selectedFilter === filter.id ? Colors.PRIMARY : Colors.LIGHT_GRAY,
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedFilter === filter.id ? Colors.PRIMARY : Colors.GRAY,
              }}
            >
              <Text style={{
                fontFamily: selectedFilter === filter.id ? 'outfit-medium' : 'outfit',
                fontSize: 14,
                color: selectedFilter === filter.id ? Colors.WHITE : Colors.GRAY
              }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

     
      {details && Object.entries(details).reverse().map(([day,dayDetails],dayIndex)=>{
        // Filter places for this day
        const filteredPlaces = dayDetails?.plan?.filter(filterPlace) || [];
        
        // Only show day section if there are places after filtering
        if (filteredPlaces.length === 0 && selectedFilter !== 'all') {
          return null;
        }

        return (
          <View key={dayIndex}>
              <Text style={{
                  fontFamily:'outfit-medium',
                  fontSize:20,
                  marginTop:20
              }}>{day.charAt(0).toUpperCase()+day.slice(1)}</Text>
              
              {selectedFilter !== 'all' && filteredPlaces.length === 0 && (
                <Text style={{
                  fontFamily: 'outfit',
                  fontSize: 14,
                  color: Colors.GRAY,
                  marginTop: 10,
                  fontStyle: 'italic'
                }}>
                  No activities match this filter for {day}
                </Text>
              )}

              {filteredPlaces.map((place, index) => {
                // Find original index for imageRefs
                const originalIndex = dayDetails.plan.indexOf(place);
                return (
                  <PlaceCard 
                    place={place} 
                    dayKey={day} 
                    index={originalIndex} 
                    imageRefs={imageRefs}
                    tripId={tripId}
                    key={originalIndex} 
                  />
                );
              })}
          </View>
        );
      })}
      
    </View>
  )
}