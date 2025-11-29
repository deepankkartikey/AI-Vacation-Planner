import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, Platform, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../configs/FirebaseConfig'
import { Colors } from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import moment from 'moment'

export default function SharedTrip() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const [tripDetails, setTripDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        console.log('Trip ID from URL:', id)
        if (id) {
            loadTripDetails()
        } else {
            setError('No trip ID provided')
            setLoading(false)
        }
    }, [id])

    const loadTripDetails = async () => {
        try {
            console.log('Loading trip with ID:', id)
            const tripId = Array.isArray(id) ? id[0] : id
            const docRef = doc(db, 'UserTrips', String(tripId))
            console.log('Fetching document:', tripId)
            
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                console.log('Trip found!')
                const data = docSnap.data()
                // Ensure docId is set for the handleOpenInApp function
                setTripDetails({ ...data, docId: data.docId || tripId })
            } else {
                console.log('Trip not found in Firestore')
                setError('Trip not found')
            }
        } catch (err) {
            console.error('Error loading trip:', err)
            setError(`Failed to load trip details: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenInApp = () => {
        const deepLink = `aivacationplanner://trip-details?trip=${encodeURIComponent(JSON.stringify(tripDetails))}`
        
        if (Platform.OS === 'web') {
            // Try to open deep link
            window.location.href = deepLink
            
            // Fallback to app store after a short delay
            setTimeout(() => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                const isAndroid = /Android/.test(navigator.userAgent)
                
                if (isIOS) {
                    window.location.href = 'https://apps.apple.com/app/your-app-id' // Replace with your App Store link
                } else if (isAndroid) {
                    window.location.href = 'https://play.google.com/store/apps/details?id=com.anonymous.ai_travel_planner_app'
                }
            }, 2000)
        } else {
            Linking.openURL(deepLink)
        }
    }

    const formatData = (data) => {
        try {
            return data ? JSON.parse(data) : {}
        } catch (error) {
            return {}
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.WHITE }}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={{ marginTop: 20, fontFamily: 'outfit', fontSize: 16 }}>Loading trip details...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.WHITE, padding: 20 }}>
                <Ionicons name="alert-circle" size={60} color={Colors.GRAY} />
                <Text style={{ marginTop: 20, fontFamily: 'outfit-bold', fontSize: 20, textAlign: 'center' }}>{error}</Text>
                <Text style={{ marginTop: 10, fontFamily: 'outfit', fontSize: 14, textAlign: 'center', color: Colors.GRAY }}>
                    Trip ID: {id || 'None'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    style={{
                        marginTop: 30,
                        backgroundColor: Colors.PRIMARY,
                        paddingHorizontal: 30,
                        paddingVertical: 15,
                        borderRadius: 99,
                    }}
                >
                    <Text style={{ color: Colors.WHITE, fontFamily: 'outfit-medium', fontSize: 16 }}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
            {/* Hero Image */}
            <View style={{ position: 'relative' }}>
                {tripDetails?.imageRefs?.destination ? (
                    <Image 
                        source={{uri: tripDetails.imageRefs.destination.startsWith('places/') 
                            ? `https://places.googleapis.com/v1/${tripDetails.imageRefs.destination}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`
                            : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${tripDetails.imageRefs.destination}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY}`
                        }}
                        style={{ width: '100%', height: 300 }}
                    />
                ) : (
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop' }}
                        style={{ width: '100%', height: 300 }}
                    />
                )}
                
                {/* App Badge */}
                <View style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 20,
                }}>
                    <Text style={{ color: Colors.WHITE, fontFamily: 'outfit-bold', fontSize: 14 }}>
                        AI Vacation Planner
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 28, fontFamily: 'outfit-bold', color: Colors.BLACK }}>
                    {tripDetails?.tripPlan?.travelPlan?.location || 'Amazing Trip'}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar" size={18} color={Colors.GRAY} />
                        <Text style={{ marginLeft: 5, fontFamily: 'outfit', fontSize: 16, color: Colors.GRAY }}>
                            {formatData(tripDetails?.tripData)?.startDate 
                                ? moment(formatData(tripDetails.tripData).startDate).format('MMM DD')
                                : 'TBD'
                            } - {formatData(tripDetails?.tripData)?.endDate 
                                ? moment(formatData(tripDetails.tripData).endDate).format('MMM DD, YYYY')
                                : 'TBD'
                            }
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="people" size={18} color={Colors.GRAY} />
                        <Text style={{ marginLeft: 5, fontFamily: 'outfit', fontSize: 16, color: Colors.GRAY }}>
                            {formatData(tripDetails?.tripData)?.traveler?.title || 'Solo'}
                        </Text>
                    </View>
                </View>

                {/* Call to Action */}
                <View style={{
                    marginTop: 30,
                    backgroundColor: Colors.LIGHT_GRAY,
                    padding: 25,
                    borderRadius: 20,
                    alignItems: 'center',
                }}>
                    <Ionicons name="phone-portrait" size={50} color={Colors.PRIMARY} />
                    <Text style={{
                        marginTop: 15,
                        fontSize: 20,
                        fontFamily: 'outfit-bold',
                        color: Colors.BLACK,
                        textAlign: 'center',
                    }}>
                        Open in the App
                    </Text>
                    <Text style={{
                        marginTop: 10,
                        fontSize: 15,
                        fontFamily: 'outfit',
                        color: Colors.GRAY,
                        textAlign: 'center',
                    }}>
                        Get the full experience with interactive maps, real-time updates, and more!
                    </Text>

                    <TouchableOpacity
                        onPress={handleOpenInApp}
                        style={{
                            marginTop: 20,
                            backgroundColor: Colors.PRIMARY,
                            paddingHorizontal: 40,
                            paddingVertical: 15,
                            borderRadius: 99,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <Ionicons name="download" size={20} color={Colors.WHITE} />
                        <Text style={{
                            color: Colors.WHITE,
                            fontFamily: 'outfit-bold',
                            fontSize: 17,
                        }}>
                            Open App
                        </Text>
                    </TouchableOpacity>

                    <Text style={{
                        marginTop: 15,
                        fontSize: 13,
                        fontFamily: 'outfit',
                        color: Colors.GRAY,
                        textAlign: 'center',
                    }}>
                        Don't have the app? You'll be redirected to download it.
                    </Text>
                </View>

                {/* Trip Preview */}
                <View style={{ marginTop: 30 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'outfit-bold', color: Colors.BLACK, marginBottom: 15 }}>
                        Trip Highlights
                    </Text>

                    {/* Hotels */}
                    {tripDetails?.tripPlan?.travelPlan?.hotels?.length > 0 && (
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Ionicons name="bed" size={20} color={Colors.PRIMARY} />
                                <Text style={{ marginLeft: 8, fontSize: 17, fontFamily: 'outfit-medium' }}>
                                    Accommodation
                                </Text>
                            </View>
                            <Text style={{ fontFamily: 'outfit-bold', fontSize: 16, color: Colors.BLACK }}>
                                {tripDetails.tripPlan.travelPlan.hotels[0]?.name || 'Hotel Recommended'}
                            </Text>
                            <Text style={{ fontFamily: 'outfit', fontSize: 14, color: Colors.GRAY, marginTop: 2 }}>
                                {tripDetails.tripPlan.travelPlan.hotels[0]?.address || 'Prime location'}
                            </Text>
                        </View>
                    )}

                    {/* Days Count */}
                    {tripDetails?.tripPlan?.travelPlan?.itinerary && (
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Ionicons name="map" size={20} color={Colors.PRIMARY} />
                                <Text style={{ marginLeft: 8, fontSize: 17, fontFamily: 'outfit-medium' }}>
                                    Itinerary
                                </Text>
                            </View>
                            <Text style={{ fontFamily: 'outfit', fontSize: 15, color: Colors.GRAY }}>
                                {Object.keys(tripDetails.tripPlan.travelPlan.itinerary).length} days of amazing activities and places to explore
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={{
                    marginTop: 40,
                    paddingTop: 20,
                    borderTopWidth: 1,
                    borderTopColor: Colors.LIGHT_GRAY,
                    alignItems: 'center',
                }}>
                    <Text style={{ fontFamily: 'outfit', fontSize: 14, color: Colors.GRAY, textAlign: 'center' }}>
                        Powered by AI Vacation Planner
                    </Text>
                </View>
            </View>
        </ScrollView>
    )
}
