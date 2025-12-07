import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Alert, Platform, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../../../firebase/config'
export default function SignUp() {
  const navigation=useNavigation();
  const router=useRouter();

  const [email,setEmail]=useState();
  const [password,setPassword]=useState();
  const [fullName,setFullName]=useState();



  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
    
    console.log('Sign-up page loaded. Firebase auth:', auth ? '✅ Ready' : '❌ Not available');
  }, []);


  const showMessage = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
  };

  const OnCreateAccount = async () => {
    console.log('Create account attempted with:', { 
      fullName, 
      email, 
      password: password ? '***' : 'empty' 
    });

    if (!email || !password || !fullName) {
      showMessage('Please enter all details');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Account created successfully:', user.uid);
      router.replace('/mytrip');
    } catch (error) {
      console.log('Sign up error:', error.message, error.code);
      
      if (error.code === 'auth/email-already-in-use') {
        showMessage("Email is already registered. Please use a different email or sign in");
      } else if (error.code === 'auth/invalid-email') {
        showMessage("Please enter a valid email address");
      } else if (error.code === 'auth/weak-password') {
        showMessage("Password is too weak. Please use at least 6 characters");
      } else {
        showMessage("Account creation failed. Please try again");
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.WHITE }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('./../../../assets/images/login.jpeg')} 
              style={styles.headerImage}
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/');
                  }
                }} 
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Create New Account</Text>
            <Text style={styles.subtitle}>Start your adventure today!</Text>

            {/* User Full Name  */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter Full Name'
                onChangeText={(value)=>setFullName(value)}
              />
            </View>

            {/* Email  */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={(value)=>setEmail(value)}
                placeholder='Enter Email'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            {/* Password  */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                secureTextEntry={true}
                style={styles.input}
                onChangeText={(value)=>setPassword(value)}
                placeholder='Enter Password (min 6 characters)'
              />
            </View>

            {/* Create Account Button  */}
            <TouchableOpacity onPress={OnCreateAccount} style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Sign In Button  */}
            <TouchableOpacity
              onPress={()=>router.replace('auth/sign-in')}
              style={styles.signInButton}
            >
              <Text style={styles.signInButtonText}>
                Already have an account? <Text style={styles.signInButtonTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 32,
    color: Colors.PRIMARY,
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 18,
    color: Colors.GRAY,
    marginTop: 8,
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontFamily: 'outfit',
    fontSize: 16,
    marginBottom: 8,
    color: Colors.PRIMARY,
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit',
    fontSize: 16,
  },
  createButton: {
    padding: 20,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 15,
    marginTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  signInButton: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 20,
  },
  signInButtonText: {
    color: Colors.GRAY,
    textAlign: 'center',
    fontFamily: 'outfit',
    fontSize: 16,
  },
  signInButtonTextBold: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-bold',
  },
})