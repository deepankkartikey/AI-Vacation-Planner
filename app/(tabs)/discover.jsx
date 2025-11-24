import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function discover() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search place screen when Discover tab is clicked
    router.replace('/create-trip/search-place');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting to Search...</Text>
    </View>
  )
}