import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import {Colors} from './../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import { useCreateTrip } from './../../context/CreateTripContext'
import moment from 'moment'
export default function ReviewTrip() {
 
    const navigation=useNavigation();
    const {tripData,setTripData}=useCreateTrip();

    const router=useRouter();
    useEffect(()=>{
        navigation.setOptions({
            headerShown:true,
            headerTransparent:true,
            headerTitle:''
        })
    },[])

    // 📍📆🗓️🚌💰
    return (
    <ScrollView style={{
        flex: 1,
        backgroundColor:Colors.WHITE
    }}
    contentContainerStyle={{
        paddingBottom: 50
    }}>
      <View style={{
        padding:25,
        paddingTop:75,
      }}>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:35,
        marginTop:20
      }}>Review your trip</Text>

      <View style={{
        marginTop:20
      }}>
        <Text style={{
            fontFamily:'outfit-bold',
            fontSize:20
        }}>Before generating your trip , please review your selection</Text>
      
      {/* Destination Info  */}
      <View style={{
        marginTop:40,
        display:'flex',
        flexDirection:'row',
        gap:20
      }}>
      <Text style={{
        fontSize:30
      }}>📍</Text>
      <View>
        <Text style={{
            fontFamily:'outfit',
            fontSize:17,
            color:Colors.GRAY
        }}>Destination</Text>
        <Text style={{
            fontFamily:'outfit-medium',
            fontSize:20
        }}>{tripData?.locationInfo?.name}</Text>

      </View>
      </View>

       {/* Date Selected Info  */}
       <View style={{
        marginTop:25,
        display:'flex',
        flexDirection:'row',
        gap:20
      }}>
      <Text style={{
        fontSize:30
      }}>🗓️</Text>
      <View>
        <Text style={{
            fontFamily:'outfit',
            fontSize:17,
            color:Colors.GRAY
        }}>Travel Date</Text>
        <Text style={{
            fontFamily:'outfit-medium',
            fontSize:20
        }}>{moment(tripData?.startDate).format('DD MMM')
        +" To "+
        moment(tripData.endDate).format('DD MMM')+"   "} 
         ({tripData?.totalNoOfDays} days)
        </Text>

      </View>
      </View>

       {/* Traveles Info  */}
       <View style={{
        marginTop:25,
        display:'flex',
        flexDirection:'row',
        gap:20
      }}>
      <Text style={{
        fontSize:30
      }}>🚌</Text>
      <View>
        <Text style={{
            fontFamily:'outfit',
            fontSize:17,
            color:Colors.GRAY
        }}>Who is Traveling</Text>
        <Text style={{
            fontFamily:'outfit-medium',
            fontSize:20
        }}>{tripData?.traveler?.title}
        </Text>

      </View>
      </View>

        {/* Budget Info  */}
        <View style={{
        marginTop:25,
        display:'flex',
        flexDirection:'row',
        gap:20
      }}>
      <Text style={{
        fontSize:30
      }}>💰</Text>
      <View>
        <Text style={{
            fontFamily:'outfit',
            fontSize:17,
            color:Colors.GRAY
        }}>Budget</Text>
        <Text style={{
            fontFamily:'outfit-medium',
            fontSize:20
        }}>{tripData?.budget} (${tripData?.dailyBudget}/day)
        </Text>

      </View>
      </View>

      {/* Activity Preferences Info  */}
      {tripData?.activityPreferences && tripData.activityPreferences.length > 0 && (
        <View style={{
          marginTop:25,
          display:'flex',
          flexDirection:'row',
          gap:20
        }}>
          <Text style={{
            fontSize:30
          }}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
                fontFamily:'outfit',
                fontSize:17,
                color:Colors.GRAY
            }}>Activity Interests</Text>
            <Text style={{
                fontFamily:'outfit-medium',
                fontSize:16,
                marginTop: 5
            }}>
              {tripData.activityPreferences.map(activity => 
                activity.charAt(0).toUpperCase() + activity.slice(1)
              ).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Cost Preference Info  */}
      {tripData?.activityCostPreference && (
        <View style={{
          marginTop:25,
          display:'flex',
          flexDirection:'row',
          gap:20
        }}>
          <Text style={{
            fontSize:30
          }}>💳</Text>
          <View>
            <Text style={{
                fontFamily:'outfit',
                fontSize:17,
                color:Colors.GRAY
            }}>Activity Cost</Text>
            <Text style={{
                fontFamily:'outfit-medium',
                fontSize:20
            }}>
              {tripData.activityCostPreference === 'free' && '🆓 Free Activities Only'}
              {tripData.activityCostPreference === 'mixed' && '💳 Mix of Free & Paid'}
              {tripData.activityCostPreference === 'premium' && '💎 Premium Experiences'}
            </Text>
          </View>
        </View>
      )}
      
      </View>

      <TouchableOpacity
       onPress={()=>router.replace('/create-trip/generate-trip')}
      style={{
        padding:15,
        backgroundColor:Colors.PRIMARY,
        borderRadius:15,
        marginTop:80
      }}>

        <Text style={{
          textAlign:'center',
          color:Colors.WHITE,
          fontFamily:'outfit-medium',
          fontSize:20,
        }}>
            Build My trip</Text>
     
      </TouchableOpacity>
      </View>
    </ScrollView>
  )
}