import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import {Colors} from './../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import StartNewTripCard from '../../components/MyTrips/StartNewTripCard';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {auth, db} from './../../configs/FirebaseConfig'
import UserTripList from '../../components/MyTrips/UserTripList';
import { useRouter } from 'expo-router';
export default function MyTrip() {

  const [userTrips,setUserTrips]=useState([]);
  const user=auth.currentUser;
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  useEffect(()=>{
    user&&GetMyTrips();
  },[user])

  const GetMyTrips=async()=>{ 
    setLoading(true); 
    setUserTrips([]);
    
    console.log('🔍 Fetching trips for user:', {
      email: user?.email,
      uid: user?.uid
    });
    
    try {
      // First try without orderBy to see if there are any trips
      const q=query(collection(db,'UserTrips'),
        where('userEmail','==',user?.email)
      );
      
      const querySnapshot=await getDocs(q);
      console.log('📊 Query result count:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('❌ No trips found for this user');
      }
      
      const trips = [];
      querySnapshot.forEach((doc) => { 
        console.log('📄 Found trip:', doc.id, " => ", doc.data());
        trips.push(doc.data());
      });
      
      // Sort by createdAt if available, otherwise by docId (timestamp)
      trips.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (a.docId && b.docId) {
          return parseInt(b.docId) - parseInt(a.docId);
        }
        return 0;
      });
      
      setUserTrips(trips);
    } catch (error) {
      console.error('❌ Error fetching trips:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.log('🔐 Permission denied - Firestore security rules need to be updated');
      }
    }
    
    setLoading(false);
  }

  const handleTripDeleted = (deletedTripId) => {
    console.log(`🗑️ Trip deleted: ${deletedTripId}, refreshing trip list...`);
    // Refresh the trips list after deletion
    GetMyTrips();
  };

  return (
    <ScrollView style={{
      padding:25,
      paddingTop:55,
      backgroundColor:Colors.WHITE,
      height:'100%'
    }}>

      <View
      style={{
        display:'flex',
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-between'
      }}
      >
        <Text style={{
          fontFamily:'outfit-bold',
          fontSize:35
        }}>My Trips</Text>
        <TouchableOpacity onPress={()=>router.push('/create-trip/search-place')}>
        <Ionicons name="add-circle" size={50} color="black" />
        </TouchableOpacity>
      </View>
      {loading&&<ActivityIndicator size={'large'} color={Colors.PRIMARY} />}

      {userTrips?.length==0? 
        <StartNewTripCard/>
        :
        <UserTripList 
          userTrips={userTrips} 
          onTripDeleted={handleTripDeleted}
        />
      } 
      <View style={{
        height:100
      }}>

      </View>
    </ScrollView>
  )
}