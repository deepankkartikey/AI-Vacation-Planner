import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import {Colors} from './../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import StartNewTripCard from '../../components/MyTrips/StartNewTripCard';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {auth, db} from './../../firebase/config'
import UserTripList from '../../components/MyTrips/UserTripList';
import { useRouter } from 'expo-router';
import { restoreTrip } from '../../services/TripService';

export default function MyTrip() {

  const [userTrips,setUserTrips]=useState([]);
  const user=auth.currentUser;
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  const [undoVisible, setUndoVisible] = useState(false);
  const [deletedTrip, setDeletedTrip] = useState(null);
  const undoTimer = useRef(null);
  const slideAnim = useRef(new Animated.Value(100)).current;
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

  const handleTripDeleted = (tripData) => {
    console.log(`🗑️ Trip deleted: ${tripData.docId}, showing undo option...`);
    
    // Store deleted trip data
    setDeletedTrip(tripData);
    
    // Show undo toast
    setUndoVisible(true);
    
    // Animate toast in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
    
    // Clear any existing timer
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }
    
    // Set timer to hide toast after 5 seconds
    undoTimer.current = setTimeout(() => {
      hideUndoToast();
    }, 5000);
    
    // Refresh the trips list
    GetMyTrips();
  };

  const hideUndoToast = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setUndoVisible(false);
      setDeletedTrip(null);
    });
  };

  const handleUndo = async () => {
    console.log('♻️ Undoing trip deletion...');
    
    // Clear the timer
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }
    
    // Hide toast immediately
    hideUndoToast();
    
    // Restore the trip
    if (deletedTrip) {
      const result = await restoreTrip(deletedTrip);
      if (result.success) {
        console.log('✅ Trip restored successfully');
        // Refresh trips list
        GetMyTrips();
      } else {
        console.error('❌ Failed to restore trip');
      }
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    };
  }, []);

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

      {/* Undo Toast */}
      {undoVisible && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 20,
          left: 25,
          right: 25,
          backgroundColor: '#323232',
          borderRadius: 10,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ translateY: slideAnim }],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="trash-outline" size={20} color="white" style={{ marginRight: 12 }} />
            <Text style={{
              color: 'white',
              fontFamily: 'outfit',
              fontSize: 15,
              flex: 1,
            }}>
              Trip deleted
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleUndo}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
            }}
          >
            <Text style={{
              color: Colors.PRIMARY,
              fontFamily: 'outfit-medium',
              fontSize: 15,
            }}>
              UNDO
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  )
}