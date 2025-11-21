import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../configs/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_CACHE_KEY = 'user_profile_cache';

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
        // Return default profile structure
        console.log('⚠️ No profile found, returning default');
        return this.getDefaultProfile();
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
      
      await updateDoc(profileRef, {
        [section]: data,
        updatedAt: new Date().toISOString(),
      });

      // Clear cache to force refresh
      await this.clearProfileCache(userId);
      
      console.log(`✅ Profile section '${section}' updated`);
    } catch (error) {
      console.error(`❌ Error updating section '${section}':`, error);
      throw error;
    }
  }

  /**
   * Increment trip statistics
   * @param {string} userId - Firebase user ID
   */
  static async incrementTripCount(userId) {
    try {
      const profile = await this.getUserProfile(userId);
      const newStats = {
        ...profile.stats,
        tripsPlanned: (profile.stats?.tripsPlanned || 0) + 1,
      };

      await this.updateProfileSection(userId, 'stats', newStats);
    } catch (error) {
      console.error('❌ Error incrementing trip count:', error);
    }
  }
}

export default ProfileService;
