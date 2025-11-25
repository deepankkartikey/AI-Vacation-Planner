import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '../../constants/Colors';
import PlaceCard from './PlaceCard';
import { Ionicons } from '@expo/vector-icons';
import { generateMorePlaces } from '../../services/PlaceGenerationService';

export default function PlannedTrip({ details, imageRefs, location, tripData, tripId }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Handle loading more places for specific filter
  const handleLoadMore = async () => {
    if (loadingMore) return;
    
    const filter = filters.find(f => f.id === selectedFilter);
    if (!filter || selectedFilter === 'all') {
      Alert.alert('Info', 'Please select a specific filter to load more places');
      return;
    }

    if (!tripId || !location) {
      Alert.alert('Error', 'Trip information is missing. Please try again.');
      return;
    }

    setLoadingMore(true);
    
    try {
      console.log(`🚀 Loading more ${filter.label} for ${location}...`);
      
      const result = await generateMorePlaces(
        tripId,
        location,
        selectedFilter,
        filter.label,
        tripData
      );

      if (result.success) {
        console.log(`✅ Added ${result.placesAdded} new ${filter.label.toLowerCase()} to itinerary`);
      }
    } catch (error) {
      console.error('❌ Load more error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to load more places. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingMore(false);
    }
  };  return (
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

     
      {details && Object.entries(details).sort((a, b) => {
        // Extract day numbers from strings like "day1", "day2", etc.
        const dayNumA = parseInt(a[0].replace(/[^0-9]/g, '')) || 0;
        const dayNumB = parseInt(b[0].replace(/[^0-9]/g, '')) || 0;
        return dayNumA - dayNumB; // Sort in ascending order
      }).map(([day,dayDetails],dayIndex)=>{
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
                <View style={{
                  backgroundColor: Colors.LIGHT_GRAY,
                  padding: 15,
                  borderRadius: 10,
                  marginTop: 10,
                  alignItems: 'center'
                }}>
                  <Ionicons name="search-outline" size={40} color={Colors.GRAY} />
                  <Text style={{
                    fontFamily: 'outfit-medium',
                    fontSize: 16,
                    color: Colors.GRAY,
                    marginTop: 10,
                    textAlign: 'center'
                  }}>
                    No {filters.find(f => f.id === selectedFilter)?.label} found for {day}
                  </Text>
                  <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 14,
                    color: Colors.GRAY,
                    marginTop: 5,
                    textAlign: 'center'
                  }}>
                    Try loading more recommendations
                  </Text>
                </View>
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

      {/* Load More Button - show when a specific filter is selected */}
      {selectedFilter !== 'all' && (
        <TouchableOpacity
          onPress={handleLoadMore}
          disabled={loadingMore}
          style={{
            backgroundColor: loadingMore ? Colors.LIGHT_GRAY : Colors.PRIMARY,
            padding: 15,
            borderRadius: 15,
            marginTop: 20,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: Colors.PRIMARY,
          }}
        >
          {loadingMore ? (
            <>
              <ActivityIndicator size="small" color={Colors.PRIMARY} />
              <Text style={{
                fontFamily: 'outfit-medium',
                fontSize: 16,
                color: Colors.PRIMARY
              }}>
                Generating...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color={Colors.WHITE} />
              <Text style={{
                fontFamily: 'outfit-medium',
                fontSize: 16,
                color: Colors.WHITE
              }}>
                Load More {filters.find(f => f.id === selectedFilter)?.label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
      
    </View>
  )
}