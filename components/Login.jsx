import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'

export default function Login() {
    const router = useRouter();
    
    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: Colors.WHITE }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ flex: 1 }}>
                <Image 
                    source={require('./../assets/images/login.jpeg')}
                    style={{
                        width: '100%',
                        height: Platform.OS === 'web' ? 400 : 520,
                        resizeMode: 'cover'
                    }}
                />
                <View style={styles.container}>
                    <Text style={{
                        fontSize: 30,
                        fontFamily: 'outfit-bold',
                        textAlign: 'center',
                        marginTop: 10
                    }}>AI Vacation Planner</Text>

                    <Text style={{
                        fontFamily: 'outfit',
                        fontSize: 17,
                        textAlign: 'center',
                        color: Colors.GRAY,
                        marginTop: 20,
                        lineHeight: 24
                    }}>Discover your next adventure effortlessly. Personalized itineraries at your fingertips. Travel smarter with AI-driven insights.</Text>
           
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => router.push('auth/sign-in')}
                    >
                        <Text style={{
                            color: Colors.WHITE,
                            textAlign: 'center',
                            fontFamily: 'outfit',
                            fontSize: 17
                        }}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        marginTop: -20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        minHeight: Platform.OS === 'web' ? 350 : 450,
        padding: 25,
        paddingBottom: 60
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 99,
        marginTop: 30,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                userSelect: 'none'
            }
        })
    }
})