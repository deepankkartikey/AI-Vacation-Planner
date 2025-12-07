import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { auth } from '../../firebase/config'

export default function Discover() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const popularDestinations = [
    { id: 1, name: 'Paris', country: 'France', icon: '🗼', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
    { id: 2, name: 'Tokyo', country: 'Japan', icon: '🗾', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { id: 3, name: 'New York', country: 'USA', icon: '🗽', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
    { id: 4, name: 'Dubai', country: 'UAE', icon: '🏙️', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
    { id: 5, name: 'London', country: 'UK', icon: '🎡', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
    { id: 6, name: 'Bali', country: 'Indonesia', icon: '🏝️', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  ];

  const travelPackages = [
    { 
      id: 1, 
      title: 'European Explorer', 
      cities: ['Paris', 'Rome', 'Barcelona'], 
      days: 10,
      icon: '🇪🇺',
      description: 'Discover the best of Europe',
      price: '$2,500'
    },
    { 
      id: 2, 
      title: 'Asian Adventure', 
      cities: ['Tokyo', 'Seoul', 'Bangkok'], 
      days: 12,
      icon: '🌏',
      description: 'Experience vibrant Asian culture',
      price: '$2,200'
    },
    { 
      id: 3, 
      title: 'USA Road Trip', 
      cities: ['Los Angeles', 'Las Vegas', 'San Francisco'], 
      days: 7,
      icon: '🚗',
      description: 'Classic American road adventure',
      price: '$1,800'
    },
    { 
      id: 4, 
      title: 'Middle East Marvel', 
      cities: ['Dubai', 'Abu Dhabi', 'Doha'], 
      days: 8,
      icon: '🕌',
      description: 'Luxury and culture combined',
      price: '$3,200'
    },
  ];

  const travelThemes = [
    { id: 1, title: 'Beach Paradise', icon: '🏖️', color: '#4ECDC4' },
    { id: 2, title: 'Mountain Escape', icon: '⛰️', color: '#95E1D3' },
    { id: 3, title: 'City Explorer', icon: '🏙️', color: '#FFB6B9' },
    { id: 4, title: 'Adventure Seeker', icon: '🧗', color: '#F38181' },
    { id: 5, title: 'Cultural Journey', icon: '🎭', color: '#AA96DA' },
    { id: 6, title: 'Wildlife Safari', icon: '🦁', color: '#FCBAD3' },
  ];

  const partners = [
    { id: 1, name: 'Airbnb', icon: '🏠', discount: '15% off' },
    { id: 2, name: 'Booking.com', icon: '🏨', discount: '20% off' },
    { id: 3, name: 'Expedia', icon: '✈️', discount: '10% off' },
    { id: 4, name: 'Uber', icon: '🚗', discount: '$20 credit' },
  ];

  const handleDestinationPress = (destination) => {
    router.push({
      pathname: '/create-trip/search-place',
      params: { suggestedCity: destination.name + ', ' + destination.country }
    });
  };

  const handlePackagePress = (pkg) => {
    router.push({
      pathname: '/create-trip/search-place',
      params: { 
        suggestedPackage: pkg.title,
        cities: pkg.cities.join(',')
      }
    });
  };

  const handleThemePress = (theme) => {
    router.push({
      pathname: '/create-trip/search-place',
      params: { theme: theme.title }
    });
  };

  const handleSearchPress = () => {
    router.push('/create-trip/search-place');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hi, ${user.displayName || 'Traveler'}!` : 'Hi, Traveler!'}
            </Text>
            <Text style={styles.subtitle}>Where would you like to go?</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Ionicons name="search" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Featured Banner */}
        <TouchableOpacity style={styles.featuredBanner} onPress={handleSearchPress}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>✨ Plan Your Dream Trip</Text>
            <Text style={styles.bannerSubtitle}>AI-powered itineraries in seconds</Text>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.WHITE} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Travel Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Travel Themes</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesContainer}
          >
            {travelThemes.map((theme) => (
              <TouchableOpacity 
                key={theme.id} 
                style={[styles.themeCard, { backgroundColor: theme.color }]}
                onPress={() => handleThemePress(theme)}
              >
                <Text style={styles.themeIcon}>{theme.icon}</Text>
                <Text style={styles.themeTitle}>{theme.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌍 Popular Destinations</Text>
            <TouchableOpacity onPress={handleSearchPress}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsContainer}
          >
            {popularDestinations.map((destination) => (
              <TouchableOpacity 
                key={destination.id} 
                style={styles.destinationCard}
                onPress={() => handleDestinationPress(destination)}
              >
                <View style={styles.destinationImageContainer}>
                  <Text style={styles.destinationIconLarge}>{destination.icon}</Text>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{destination.name}</Text>
                  <Text style={styles.destinationCountry}>{destination.country}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Travel Packages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 Multi-City Packages</Text>
            <TouchableOpacity onPress={handleSearchPress}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          {travelPackages.map((pkg) => (
            <TouchableOpacity 
              key={pkg.id} 
              style={styles.packageCard}
              onPress={() => handlePackagePress(pkg)}
            >
              <View style={styles.packageIcon}>
                <Text style={styles.packageIconText}>{pkg.icon}</Text>
              </View>
              <View style={styles.packageDetails}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                <View style={styles.packageMeta}>
                  <View style={styles.packageMetaItem}>
                    <Ionicons name="location-outline" size={14} color={Colors.GRAY} />
                    <Text style={styles.packageMetaText}>{pkg.cities.join(' → ')}</Text>
                  </View>
                  <View style={styles.packageMetaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.GRAY} />
                    <Text style={styles.packageMetaText}>{pkg.days} days</Text>
                  </View>
                </View>
              </View>
              <View style={styles.packagePriceContainer}>
                <Text style={styles.packagePrice}>{pkg.price}</Text>
                <Text style={styles.packagePriceLabel}>per person</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Travel Partners</Text>
          <Text style={styles.sectionSubtitle}>Exclusive discounts for our users</Text>
          <View style={styles.partnersGrid}>
            {partners.map((partner) => (
              <View key={partner.id} style={styles.partnerCard}>
                <Text style={styles.partnerIcon}>{partner.icon}</Text>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <View style={styles.partnerDiscount}>
                  <Text style={styles.partnerDiscountText}>{partner.discount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Why Choose Us?</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="flash" size={24} color="#2196F3" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI-Powered Planning</Text>
                <Text style={styles.featureDescription}>Get personalized itineraries in seconds</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="wallet" size={24} color="#9C27B0" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Budget Friendly</Text>
                <Text style={styles.featureDescription}>Plans tailored to your budget</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Trusted & Secure</Text>
                <Text style={styles.featureDescription}>Your data is safe with us</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    marginTop: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBanner: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.PRIMARY,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerContent: {
    padding: 25,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: Colors.WHITE,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  bannerButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
  },
  themesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  themeCard: {
    width: 120,
    height: 120,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  themeTitle: {
    fontSize: 13,
    fontFamily: 'outfit-medium',
    color: Colors.WHITE,
    textAlign: 'center',
  },
  destinationsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  destinationCard: {
    width: 140,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: Colors.LIGHT_GRAY,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  destinationImageContainer: {
    height: 120,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationIconLarge: {
    fontSize: 60,
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
  },
  destinationCountry: {
    fontSize: 13,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    marginTop: 2,
  },
  packageCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 15,
    backgroundColor: Colors.LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  packageIconText: {
    fontSize: 32,
  },
  packageDetails: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 17,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 13,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    marginBottom: 8,
  },
  packageMeta: {
    gap: 6,
  },
  packageMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageMetaText: {
    fontSize: 12,
    fontFamily: 'outfit',
    color: Colors.GRAY,
  },
  packagePriceContainer: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
  },
  packagePriceLabel: {
    fontSize: 11,
    fontFamily: 'outfit',
    color: Colors.GRAY,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  partnerCard: {
    width: '47%',
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  partnerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  partnerName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  partnerDiscount: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  partnerDiscountText: {
    fontSize: 12,
    fontFamily: 'outfit-medium',
    color: Colors.WHITE,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.LIGHT_GRAY,
    padding: 16,
    borderRadius: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: 'outfit',
    color: Colors.GRAY,
  },
});