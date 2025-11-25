import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function discover() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to search place screen when Discover tab is accessed
    const timer = setTimeout(() => {
      router.push('/create-trip/search-place');
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text>Loading...</Text>
    </View>
  )
}