import { View, Text, ScrollView, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import { useCreateTrip } from '../../context/CreateTripContext';

export default function SelectActivities() {
  
    const navigation = useNavigation();
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [activityCostPreference, setActivityCostPreference] = useState('');
    const { tripData, setTripData } = useCreateTrip();
    const router = useRouter();

    // Activity options
    const activityOptions = [
        { id: 'nightlife', title: 'Nightlife & Clubbing', icon: '🍾', desc: 'Bars, clubs, and night entertainment' },
        { id: 'hiking', title: 'Hiking & Trekking', icon: '🥾', desc: 'Mountain trails and nature walks' },
        { id: 'beach', title: 'Beach & Water', icon: '🏖️', desc: 'Beaches, swimming, water sports' },
        { id: 'nature', title: 'Nature & Wildlife', icon: '🌲', desc: 'Parks, gardens, wildlife viewing' },
        { id: 'culture', title: 'Culture & History', icon: '🏛️', desc: 'Museums, monuments, heritage sites' },
        { id: 'food', title: 'Food & Dining', icon: '🍽️', desc: 'Local cuisine, restaurants, food tours' },
        { id: 'shopping', title: 'Shopping', icon: '🛍️', desc: 'Markets, malls, local shops' },
        { id: 'adventure', title: 'Adventure Sports', icon: '🪂', desc: 'Extreme sports, thrilling activities' },
        { id: 'relaxation', title: 'Relaxation & Spa', icon: '💆', desc: 'Spas, wellness, peaceful activities' },
        { id: 'photography', title: 'Photography', icon: '📸', desc: 'Scenic spots, photo opportunities' },
    ];

    // Cost preference options
    const costOptions = [
        { id: 'free', title: 'Free Activities Only', icon: '🆓', desc: 'No paid activities, explore freely' },
        { id: 'mixed', title: 'Mix of Free & Paid', icon: '💳', desc: 'Balanced combination of both' },
        { id: 'premium', title: 'Premium Experiences', icon: '💎', desc: 'Focus on paid premium activities' },
    ];

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTransparent: true,
            headerTitle: ''
        })
    }, []);

    const toggleActivity = (activityId) => {
        if (selectedActivities.includes(activityId)) {
            setSelectedActivities(selectedActivities.filter(id => id !== activityId));
        } else {
            setSelectedActivities([...selectedActivities, activityId]);
        }
    };

    const showMessage = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert('Selection Required', message);
        }
    };

    const onClickContinue = () => {
        if (selectedActivities.length === 0) {
            showMessage('Please select at least one activity preference');
            return;
        }

        if (!activityCostPreference) {
            showMessage('Please select your activity cost preference');
            return;
        }

        // Update trip data with activity preferences
        setTripData({
            ...tripData,
            activityPreferences: selectedActivities,
            activityCostPreference: activityCostPreference
        });

        router.push('/create-trip/review-trip');
    };

    return (
        <ScrollView style={{
            flex: 1,
            backgroundColor: Colors.WHITE
        }}
        contentContainerStyle={{
            paddingBottom: 50
        }}>
            <View style={{
                paddingTop: 75,
                padding: 25,
            }}>
                <Text style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 35,
                }}>Preferences</Text>

                <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 16,
                    color: Colors.GRAY,
                    marginTop: 10
                }}>What kind of activities are you interested in?</Text>

                {/* Activity Options */}
                <View style={{ marginTop: 25 }}>
                    {activityOptions.map((activity, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => toggleActivity(activity.id)}
                            style={{
                                padding: 15,
                                marginBottom: 15,
                                borderRadius: 15,
                                borderWidth: 2,
                                borderColor: selectedActivities.includes(activity.id) 
                                    ? Colors.PRIMARY 
                                    : Colors.LIGHT_GRAY,
                                backgroundColor: selectedActivities.includes(activity.id) 
                                    ? Colors.PRIMARY + '10' 
                                    : Colors.WHITE,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 32, marginRight: 15 }}>{activity.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontFamily: 'outfit-bold',
                                    fontSize: 18,
                                    color: selectedActivities.includes(activity.id) 
                                        ? Colors.PRIMARY 
                                        : Colors.BLACK
                                }}>{activity.title}</Text>
                                <Text style={{
                                    fontFamily: 'outfit',
                                    fontSize: 14,
                                    color: Colors.GRAY,
                                    marginTop: 3
                                }}>{activity.desc}</Text>
                            </View>
                            {selectedActivities.includes(activity.id) && (
                                <Text style={{ fontSize: 24, color: Colors.PRIMARY }}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cost Preference Section */}
                <Text style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 24,
                    marginTop: 30,
                    marginBottom: 15
                }}>Activity Cost Preference 💰</Text>

                <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 16,
                    color: Colors.GRAY,
                    marginBottom: 20
                }}>What's your preference for activity costs?</Text>

                {costOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setActivityCostPreference(option.id)}
                        style={{
                            padding: 20,
                            marginBottom: 15,
                            borderRadius: 15,
                            borderWidth: 2,
                            borderColor: activityCostPreference === option.id 
                                ? Colors.PRIMARY 
                                : Colors.LIGHT_GRAY,
                            backgroundColor: activityCostPreference === option.id 
                                ? Colors.PRIMARY + '10' 
                                : Colors.WHITE,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 36, marginRight: 15 }}>{option.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontFamily: 'outfit-bold',
                                fontSize: 18,
                                color: activityCostPreference === option.id 
                                    ? Colors.PRIMARY 
                                    : Colors.BLACK
                            }}>{option.title}</Text>
                            <Text style={{
                                fontFamily: 'outfit',
                                fontSize: 14,
                                color: Colors.GRAY,
                                marginTop: 3
                            }}>{option.desc}</Text>
                        </View>
                        {activityCostPreference === option.id && (
                            <Text style={{ fontSize: 28, color: Colors.PRIMARY }}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Continue Button */}
                <TouchableOpacity
                    onPress={onClickContinue}
                    style={{
                        padding: 15,
                        backgroundColor: Colors.PRIMARY,
                        borderRadius: 15,
                        marginTop: 30,
                        marginBottom: 30,
                        opacity: (selectedActivities.length > 0 && activityCostPreference) ? 1 : 0.5
                    }}
                    disabled={selectedActivities.length === 0 || !activityCostPreference}
                >
                    <Text style={{
                        textAlign: 'center',
                        color: Colors.WHITE,
                        fontFamily: 'outfit-medium',
                        fontSize: 20
                    }}>Continue</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
