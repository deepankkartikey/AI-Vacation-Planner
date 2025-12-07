import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Alert, Platform, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import {Colors} from './../../../constants/Colors'
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../../../firebase/config'

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
            <Text style={styles.title}>Let's Sign You In</Text>
            <Text style={styles.subtitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>You've been missed!</Text>

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
                placeholder='Enter Password'
              />
            </View>

            {/* Sign In Button  */}
            <TouchableOpacity onPress={onSignIn} style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Create Account Button  */}
            <TouchableOpacity 
              onPress={()=>router.replace('auth/sign-up')}
              style={styles.createAccountButton}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
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
    height: 250,
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
    fontSize: 24,
    color: Colors.GRAY,
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 25,
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
  signInButton: {
    padding: 20,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 15,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  createAccountButton: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  createAccountButtonText: {
    color: Colors.PRIMARY,
    textAlign: 'center',
    fontFamily: 'outfit',
    fontSize: 16,
  },
})