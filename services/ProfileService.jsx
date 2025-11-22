import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../configs/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserLocation } from './LocationService';

const PROFILE_CACHE_KEY = 'user_profile_cache';

/**
 * Helper function to get currency and locale settings based on country
 */
const getLocaleDefaults = (country) => {
  const countryUpper = country?.toUpperCase() || '';
  
  // Country to currency/locale mapping
  const localeMap = {
    // North America
    'CANADA': { currency: 'CAD', units: 'metric', language: 'en' },
    'UNITED STATES': { currency: 'USD', units: 'imperial', language: 'en' },
    'USA': { currency: 'USD', units: 'imperial', language: 'en' },
    'MEXICO': { currency: 'MXN', units: 'metric', language: 'es' },
    
    // Europe
    'UNITED KINGDOM': { currency: 'GBP', units: 'imperial', language: 'en' },
    'UK': { currency: 'GBP', units: 'imperial', language: 'en' },
    'FRANCE': { currency: 'EUR', units: 'metric', language: 'fr' },
    'GERMANY': { currency: 'EUR', units: 'metric', language: 'de' },
    'SPAIN': { currency: 'EUR', units: 'metric', language: 'es' },
    'ITALY': { currency: 'EUR', units: 'metric', language: 'en' },
    'NETHERLANDS': { currency: 'EUR', units: 'metric', language: 'en' },
    'BELGIUM': { currency: 'EUR', units: 'metric', language: 'en' },
    'AUSTRIA': { currency: 'EUR', units: 'metric', language: 'de' },
    'SWITZERLAND': { currency: 'CHF', units: 'metric', language: 'en' },
    'PORTUGAL': { currency: 'EUR', units: 'metric', language: 'en' },
    'GREECE': { currency: 'EUR', units: 'metric', language: 'en' },
    'IRELAND': { currency: 'EUR', units: 'metric', language: 'en' },
    'SWEDEN': { currency: 'SEK', units: 'metric', language: 'en' },
    'NORWAY': { currency: 'NOK', units: 'metric', language: 'en' },
    'DENMARK': { currency: 'DKK', units: 'metric', language: 'en' },
    'FINLAND': { currency: 'EUR', units: 'metric', language: 'en' },
    
    // Asia Pacific
    'AUSTRALIA': { currency: 'AUD', units: 'metric', language: 'en' },
    'NEW ZEALAND': { currency: 'NZD', units: 'metric', language: 'en' },
    'JAPAN': { currency: 'JPY', units: 'metric', language: 'en' },
    'CHINA': { currency: 'CNY', units: 'metric', language: 'en' },
    'INDIA': { currency: 'INR', units: 'metric', language: 'en' },
    'SINGAPORE': { currency: 'SGD', units: 'metric', language: 'en' },
    'HONG KONG': { currency: 'HKD', units: 'metric', language: 'en' },
    'SOUTH KOREA': { currency: 'KRW', units: 'metric', language: 'en' },
    'THAILAND': { currency: 'THB', units: 'metric', language: 'en' },
    
    // Middle East
    'UAE': { currency: 'AED', units: 'metric', language: 'en' },
    'SAUDI ARABIA': { currency: 'SAR', units: 'metric', language: 'en' },
    
    // South America
    'BRAZIL': { currency: 'BRL', units: 'metric', language: 'en' },
    'ARGENTINA': { currency: 'ARS', units: 'metric', language: 'es' },
    'CHILE': { currency: 'CLP', units: 'metric', language: 'es' },
  };
  
  // Check for exact match or partial match
  for (const [key, value] of Object.entries(localeMap)) {
    if (countryUpper.includes(key) || key.includes(countryUpper)) {
      return value;
    }
  }
  
  // Default fallback
  return { currency: 'USD', units: 'imperial', language: 'en' };
};

/**
 * Get user's location-based defaults
 */
const getUserLocationDefaults = async () => {
  try {
    console.log('🌍 Detecting user location for defaults...');
    const locationData = await getUserLocation();
    
    if (locationData.success && locationData.country) {
      const locale = getLocaleDefaults(locationData.country);
      console.log(`📍 Location detected: ${locationData.city}, ${locationData.country}`);
      console.log(`💰 Using currency: ${locale.currency}, units: ${locale.units}, language: ${locale.language}`);
      
      return {
        homeCity: locationData.city || '',
        country: locationData.country || '',
        ...locale
      };
    }
  } catch (error) {
    console.log('⚠️ Could not detect location, using defaults:', error.message);
  }
  
  // Fallback defaults
  return {
    homeCity: '',
    country: '',
    currency: 'USD',
    units: 'imperial',
    language: 'en'
  };
};


/**
 * ProfileService - Manages user profile data in Firestore
 * Handles profile CRUD operations, photo uploads, and preferences
 */
export class ProfileService {
  /**
   * Get user profile from Firestore with caching
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} User profile data
   */
  static async getUserProfile(userId) {
    try {
      console.log('🔍 getUserProfile called with userId:', userId)
      
      if (!userId) {
        throw new Error('User ID is required')
      }

      // Check cache first
      const cachedProfile = await AsyncStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`);
      if (cachedProfile) {
        console.log('📦 Profile loaded from cache');
        return JSON.parse(cachedProfile);
      }

      console.log('🌐 Fetching profile from Firestore...')
      // Fetch from Firestore (using 'Users' with capital U to match Firestore rules)
      const profileRef = doc(db, 'Users', userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        
        // Cache the profile
        await AsyncStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(profileData));
        
        console.log('✅ Profile loaded from Firestore');
        return profileData;
      } else {
        // Profile doesn't exist - create a new one with location-based defaults
        console.log('⚠️ No profile found, creating new profile...');
        
        // Get location-based defaults
        const locationDefaults = await getUserLocationDefaults();
        
        const defaultProfile = this.getDefaultProfile();
        
        // Merge location defaults with profile defaults
        const profileWithDefaults = {
          ...defaultProfile,
          homeCity: locationDefaults.homeCity || defaultProfile.homeCity,
          settings: {
            ...defaultProfile.settings,
            currency: locationDefaults.currency || defaultProfile.settings.currency,
            units: locationDefaults.units || defaultProfile.settings.units,
            language: locationDefaults.language || defaultProfile.settings.language,
          },
          preferences: {
            ...defaultProfile.preferences,
            budgetRange: {
              ...defaultProfile.preferences.budgetRange,
              currency: locationDefaults.currency || defaultProfile.preferences.budgetRange.currency,
            }
          },
          metadata: {
            detectedCountry: locationDefaults.country,
            autoConfigured: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Create the profile in Firestore
        await setDoc(profileRef, profileWithDefaults);
        
        console.log('✅ New profile created with location-based defaults');
        
        // Cache the new profile
        await AsyncStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(profileWithDefaults));
        
        return profileWithDefaults;
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   * @param {string} userId - Firebase user ID
   * @param {Object} profileData - Profile data to save
   * @returns {Promise<void>}
   */
  static async saveUserProfile(userId, profileData) {
    try {
      const profileRef = doc(db, 'Users', userId);
      
      const dataToSave = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      // Check if profile exists
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        // Update existing profile
        await updateDoc(profileRef, dataToSave);
        console.log('✅ Profile updated');
      } else {
        // Create new profile
        await setDoc(profileRef, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Profile created');
      }

      // Update cache
      await AsyncStorage.setItem(
        `${PROFILE_CACHE_KEY}_${userId}`,
        JSON.stringify(dataToSave)
      );
      
      console.log('✅ Profile saved to Firestore and cache updated');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile photo to Firebase Storage
   * @param {string} userId - Firebase user ID
   * @param {string} imageUri - Local image URI
   * @returns {Promise<string>} Download URL of uploaded image
   */
  static async uploadProfilePhoto(userId, imageUri) {
    try {
      console.log('📤 Uploading profile photo...');

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create storage reference
      const filename = `profile_${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profiles/${userId}/${filename}`);

      // Upload file
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Profile photo uploaded');

      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading profile photo:', error);
      throw error;
    }
  }

  /**
   * Delete old profile photo from storage
   * @param {string} photoUrl - URL of photo to delete
   * @returns {Promise<void>}
   */
  static async deleteProfilePhoto(photoUrl) {
    try {
      if (!photoUrl || !photoUrl.includes('firebase')) {
        return;
      }

      // Extract path from URL
      const path = photoUrl.split('/o/')[1]?.split('?')[0];
      if (!path) return;

      const decodedPath = decodeURIComponent(path);
      const storageRef = ref(storage, decodedPath);

      await deleteObject(storageRef);
      console.log('✅ Old profile photo deleted');
    } catch (error) {
      console.error('⚠️ Error deleting old photo:', error);
      // Don't throw - it's okay if deletion fails
    }
  }

  /**
   * Update profile photo
   * @param {string} userId - Firebase user ID
   * @param {string} newImageUri - New image URI
   * @param {string} oldPhotoUrl - Old photo URL to delete
   * @returns {Promise<string>} New photo URL
   */
  static async updateProfilePhoto(userId, newImageUri, oldPhotoUrl) {
    try {
      // Upload new photo
      const newPhotoUrl = await this.uploadProfilePhoto(userId, newImageUri);

      // Delete old photo
      if (oldPhotoUrl) {
        await this.deleteProfilePhoto(oldPhotoUrl);
      }

      // Update profile with new photo URL
      await this.saveUserProfile(userId, { photoUrl: newPhotoUrl });

      return newPhotoUrl;
    } catch (error) {
      console.error('❌ Error updating profile photo:', error);
      throw error;
    }
  }

  /**
   * Clear profile cache
   * @param {string} userId - Firebase user ID
   */
  static async clearProfileCache(userId) {
    try {
      await AsyncStorage.removeItem(`${PROFILE_CACHE_KEY}_${userId}`);
      console.log('🗑️ Profile cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Get default profile structure
   * @returns {Object} Default profile data
   */
  static getDefaultProfile() {
    return {
      // Personal Information
      name: '',
      email: '',
      phone: '',
      homeCity: '',
      country: '',
      photoUrl: '',
      
      // Travel Preferences
      preferences: {
        budgetRange: {
          min: 1000,
          max: 5000,
          currency: 'USD',
        },
        travelStyle: 'mid-range', // luxury, mid-range, budget, backpacker
        preferredActivities: [], // ['museums', 'restaurants', 'nature', 'nightlife', 'shopping']
        dietaryRestrictions: [], // ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free']
      },
      
      // Settings
      settings: {
        currency: 'USD', // USD, CAD, EUR, GBP, etc.
        units: 'imperial', // imperial, metric
        language: 'en', // en, es, fr, de, etc.
        notifications: {
          tripReminders: true,
          dealAlerts: false,
          newsletter: false,
        },
        darkMode: false,
      },
      
      // Statistics
      stats: {
        tripsPlanned: 0,
        placesVisited: 0,
        favoriteDestinations: [],
      },
      
      // Metadata
      metadata: {
        detectedCountry: '',
        autoConfigured: false,
      },
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update specific profile section
   * @param {string} userId - Firebase user ID
   * @param {string} section - Section to update (e.g., 'preferences', 'settings')
   * @param {Object} data - Data to update
   */
  static async updateProfileSection(userId, section, data) {
    try {
      const profileRef = doc(db, 'Users', userId);
      
      const updateData = {
        [section]: data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(profileRef, updateData);

      // Update cache instead of clearing it
      const cachedProfile = await AsyncStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`);
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        const updatedProfile = {
          ...profile,
          [section]: data,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(updatedProfile));
        console.log(`✅ Profile section '${section}' updated in cache`);
      }
      
      console.log(`✅ Profile section '${section}' updated in Firestore`);
    } catch (error) {
      console.error(`❌ Error updating section '${section}':`, error);
      throw error;
    }
  }

  /**
   * Increment trip statistics
   * @param {string} userId - Firebase user ID
   * @param {Object} tripData - Optional trip data for additional stats
   */
  static async incrementTripCount(userId, tripData = null) {
    try {
      const profile = await this.getUserProfile(userId);
      
      // Calculate places count from trip data if available
      let placesCount = 0;
      if (tripData?.tripPlan?.itinerary) {
        const itinerary = tripData.tripPlan.itinerary;
        itinerary.forEach(day => {
          if (day.places) {
            placesCount += day.places.length;
          }
        });
      }
      
      const newStats = {
        ...profile.stats,
        tripsPlanned: (profile.stats?.tripsPlanned || 0) + 1,
        placesVisited: (profile.stats?.placesVisited || 0) + placesCount,
      };
      
      // Add destination to favorites if trip data available
      if (tripData?.tripData) {
        const tripDataParsed = typeof tripData.tripData === 'string' 
          ? JSON.parse(tripData.tripData) 
          : tripData.tripData;
        
        const destination = tripDataParsed.locationInfo?.name || tripDataParsed.location;
        
        if (destination) {
          const favoriteDestinations = profile.stats?.favoriteDestinations || [];
          // Add destination if not already in favorites (keep last 5)
          if (!favoriteDestinations.includes(destination)) {
            newStats.favoriteDestinations = [destination, ...favoriteDestinations].slice(0, 5);
          }
        }
      }

      await this.updateProfileSection(userId, 'stats', newStats);
      console.log(`📊 Stats updated: ${newStats.tripsPlanned} trips, ${newStats.placesVisited} places`);
      
      return newStats;
    } catch (error) {
      console.error('❌ Error incrementing trip count:', error);
      // Don't throw - stats update shouldn't break trip creation
    }
  }

  /**
   * Decrement trip statistics when a trip is deleted
   * @param {string} userId - Firebase user ID
   * @param {Object} tripData - Trip data being deleted
   */
  static async decrementTripCount(userId, tripData = null) {
    try {
      const profile = await this.getUserProfile(userId);
      
      // Calculate places count from trip data if available
      let placesCount = 0;
      if (tripData?.tripPlan?.itinerary) {
        const itinerary = tripData.tripPlan.itinerary;
        itinerary.forEach(day => {
          if (day.places) {
            placesCount += day.places.length;
          }
        });
      }
      
      const newStats = {
        ...profile.stats,
        tripsPlanned: Math.max((profile.stats?.tripsPlanned || 0) - 1, 0), // Don't go below 0
        placesVisited: Math.max((profile.stats?.placesVisited || 0) - placesCount, 0),
      };
      
      // Remove destination from favorites if trip data available
      if (tripData?.tripData) {
        const tripDataParsed = typeof tripData.tripData === 'string' 
          ? JSON.parse(tripData.tripData) 
          : tripData.tripData;
        
        const destination = tripDataParsed.locationInfo?.name || tripDataParsed.location;
        
        if (destination) {
          const favoriteDestinations = profile.stats?.favoriteDestinations || [];
          // Remove destination from favorites
          newStats.favoriteDestinations = favoriteDestinations.filter(d => d !== destination);
        }
      }

      await this.updateProfileSection(userId, 'stats', newStats);
      console.log(`📊 Stats decremented: ${newStats.tripsPlanned} trips, ${newStats.placesVisited} places`);
      
      return newStats;
    } catch (error) {
      console.error('❌ Error decrementing trip count:', error);
      // Don't throw - stats update shouldn't break trip deletion
    }
  }
}

export default ProfileService;
