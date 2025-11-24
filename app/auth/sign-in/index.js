import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import {Colors} from './../../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../../../configs/FirebaseConfig'

export default function SignIn() {
  const navigation=useNavigation();
  const router=useRouter();

  const [email,setEmail]=useState();
  const [password,setPassword]=useState();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
    
    console.log('Sign-in page loaded. Firebase auth:', auth ? '✅ Ready' : '❌ Not available');
  }, []);

  const showMessage = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
  };

  const onSignIn = async () => {
    console.log('Sign in attempted with:', { email, password: password ? '***' : 'empty' });

    if (!email || !password) {
      showMessage("Please Enter Email & Password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Sign in successful:', user.uid);
      router.replace('/mytrip');
    } catch (error) {
      console.log('Sign in error:', error.message, error.code);
      
      if (error.code === 'auth/invalid-credential') {
        showMessage("Invalid email or password");
      } else if (error.code === 'auth/user-not-found') {
        showMessage("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        showMessage("Incorrect password");
      } else if (error.code === 'auth/too-many-requests') {
        showMessage("Too many failed attempts. Please try again later");
      } else {
        showMessage("Login failed. Please try again");
      }
    }
  };

  return (
    <View style={{
      padding:25,
      paddingTop:40,
      backgroundColor:Colors.WHITE,
     height:'100%'
    }}>
      <TouchableOpacity onPress={()=>router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:30,
        marginTop:30
      }}>Let's Sign You In</Text>
       <Text style={{
        fontFamily:'outfit',
        fontSize:30,
        color:Colors.GRAY,
        marginTop:20
      }}>Welcome Back</Text>
       <Text style={{
        fontFamily:'outfit',
        fontSize:30,
        color:Colors.GRAY,
        marginTop:10
      }}>You've been missed!</Text>

        {/* Email  */}
      <View style={{
        marginTop:50
      }}>
        <Text style={{
          fontFamily:'outfit'
        }}>Email</Text>
        <TextInput
        style={styles.input}
        onChangeText={(value)=>setEmail(value)}
         placeholder='Enter Email' />
      </View>
      {/* Password  */}
      <View style={{
        marginTop:20
      }}>
        <Text style={{
          fontFamily:'outfit'
        }}>Password</Text>
        <TextInput
        secureTextEntry={true}
        style={styles.input}
        onChangeText={(value)=>setPassword(value)}
         placeholder='Enter Password' />
      </View>

        {/* Sign In Button  */}
      <TouchableOpacity onPress={onSignIn} style={{
        padding:20,
        backgroundColor:Colors.PRIMARY,
        borderRadius:15,
        marginTop:50
      }}>
          <Text style={{
            color:Colors.WHITE,
            textAlign:'center',
            fontFamily: 'outfit'
          }}>Sign In</Text>
      </TouchableOpacity>

        {/* Create Account Button  */}
        <TouchableOpacity 
          onPress={()=>router.replace('auth/sign-up')}
        style={{
        padding:20,
        backgroundColor:Colors.WHITE,
        borderRadius:15,
        marginTop:20,
        borderWidth:1
      }}>
          <Text style={{
            color:Colors.PRIMARY,
            textAlign:'center'
          }}>Create Account</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  input:{
      padding:15,
      borderWidth:1,
      borderRadius:15,
      borderColor:Colors.GRAY,
      fontFamily:'outfit'
  }
})