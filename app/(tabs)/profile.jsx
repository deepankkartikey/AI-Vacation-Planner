import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Switch, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Colors } from '../../constants/Colors'
import { auth } from '../../configs/FirebaseConfig'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import ProfileService from '../../services/ProfileService'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import AvatarInitials from '../../components/Profile/AvatarInitials'
import { useRouter } from 'expo-router'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [homeCity, setHomeCity] = useState('')

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.uid}` : 'No user')
      setCurrentUser(user)
      if (user) {
        loadProfile(user.uid)
      } else {
        setAuthError(true)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      setLoading(true)
      setAuthError(false)
      
      // Check if userId is provided
      if (!userId) {
        console.log('❌ No userId provided');
        setAuthError(true)
        setLoading(false)
        return
      }
      
      console.log('👤 Loading profile for user:', userId)
      
      const profileData = await ProfileService.getUserProfile(userId)
      setProfile(profileData)
      
      // Set form fields
      setName(profileData.name || '')
      setEmail(profileData.email || currentUser?.email || '')
      setPhone(profileData.phone || '')
      setHomeCity(profileData.homeCity || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      Alert.alert('Error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePickImage = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to upload a photo')
        return
      }

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload a profile picture.')
        return
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled) {
        setUploadingPhoto(true)
        
        const userId = currentUser.uid
        const newPhotoUrl = await ProfileService.updateProfilePhoto(
          userId,
          result.assets[0].uri,
          profile.photoUrl
        )

        setProfile({ ...profile, photoUrl: newPhotoUrl })
        Alert.alert('Success', 'Profile photo updated!')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      Alert.alert('Error', 'Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to save your profile')
        return
      }

      setSaving(true)
      
      const userId = currentUser.uid
      const updatedProfile = {
        ...profile,
        name,
        email,
        phone,
        homeCity,
      }

      await ProfileService.saveUserProfile(userId, updatedProfile)
      setProfile(updatedProfile)
      setIsEditing(false)
      Alert.alert('Success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePreference = async (field, value) => {
    try {
      if (!currentUser) return
      
      const userId = currentUser.uid
      const updatedPreferences = {
        ...profile.preferences,
        [field]: value,
      }

      await ProfileService.updateProfileSection(userId, 'preferences', updatedPreferences)
      setProfile({ ...profile, preferences: updatedPreferences })
    } catch (error) {
      console.error('Error updating preference:', error)
      Alert.alert('Error', 'Failed to update preference')
    }
  }

  const handleUpdateSetting = async (field, value) => {
    try {
      if (!currentUser) return
      
      const userId = currentUser.uid
      const updatedSettings = {
        ...profile.settings,
        [field]: value,
      }

      await ProfileService.updateProfileSection(userId, 'settings', updatedSettings)
      setProfile({ ...profile, settings: updatedSettings })
    } catch (error) {
      console.error('Error updating setting:', error)
      Alert.alert('Error', 'Failed to update setting')
    }
  }

  const handleUpdateNotification = async (field, value) => {
    try {
      if (!currentUser) return
      
      const userId = currentUser.uid
      const updatedNotifications = {
        ...profile.settings.notifications,
        [field]: value,
      }

      const updatedSettings = {
        ...profile.settings,
        notifications: updatedNotifications,
      }

      await ProfileService.updateProfileSection(userId, 'settings', updatedSettings)
      setProfile({ ...profile, settings: updatedSettings })
    } catch (error) {
      console.error('Error updating notification:', error)
      Alert.alert('Error', 'Failed to update notification setting')
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth)
              router.replace('/auth/sign-in')
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    )
  }

  if (authError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-circle-outline" size={80} color={Colors.GRAY} />
        <Text style={styles.errorText}>Please sign in to view your profile</Text>
        <Text style={styles.errorSubtext}>You need to be logged in to access profile settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => currentUser && loadProfile(currentUser.uid)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={Colors.GRAY} />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Text style={styles.errorSubtext}>There was an error loading your profile data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => currentUser && loadProfile(currentUser.uid)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Photo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage} disabled={uploadingPhoto}>
          <View style={styles.photoContainer}>
            {profile.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.profilePhoto} />
            ) : (
              <AvatarInitials 
                name={profile.name || 'User'} 
                size={120}
              />
            )}
            {uploadingPhoto && (
              <View style={styles.photoLoading}>
                <ActivityIndicator size="small" color={Colors.WHITE} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color={Colors.WHITE} />
            </View>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{profile.name || 'Set Your Name'}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={styles.saveButton}>
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.WHITE} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Home City</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={homeCity}
            onChangeText={setHomeCity}
            placeholder="Enter your home city"
            editable={isEditing}
          />
        </View>

        {profile.country && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Country</Text>
            <View style={[styles.input, styles.inputDisabled, styles.countryDisplay]}>
              <Text style={styles.countryText}>🌍 {profile.country}</Text>
              <Text style={styles.countryHint}>Auto-detected from your location</Text>
            </View>
          </View>
        )}
      </View>

      {/* Travel Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Preferences</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Travel Style</Text>
          <View style={styles.travelStyleContainer}>
            {['luxury', 'mid-range', 'budget', 'backpacker'].map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  profile.preferences?.travelStyle === style && styles.styleButtonActive
                ]}
                onPress={() => handleUpdatePreference('travelStyle', style)}
              >
                <Text style={[
                  styles.styleButtonText,
                  profile.preferences?.travelStyle === style && styles.styleButtonTextActive
                ]}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Budget Range</Text>
          <View style={styles.budgetContainer}>
            <TextInput
              style={styles.budgetInput}
              value={String(profile.preferences?.budgetRange?.min || '')}
              onChangeText={(value) => {
                const numValue = parseInt(value) || 0
                handleUpdatePreference('budgetRange', {
                  ...profile.preferences?.budgetRange,
                  min: numValue
                })
              }}
              placeholder="Min"
              keyboardType="numeric"
            />
            <Text style={styles.budgetSeparator}>to</Text>
            <TextInput
              style={styles.budgetInput}
              value={String(profile.preferences?.budgetRange?.max || '')}
              onChangeText={(value) => {
                const numValue = parseInt(value) || 0
                handleUpdatePreference('budgetRange', {
                  ...profile.preferences?.budgetRange,
                  max: numValue
                })
              }}
              placeholder="Max"
              keyboardType="numeric"
            />
            <Text style={styles.budgetCurrency}>{profile.preferences?.budgetRange?.currency || 'USD'}</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingValue}>{profile.settings?.currency || 'USD'}</Text>
          </View>
          <View style={styles.currencyButtons}>
            {['USD', 'CAD', 'EUR', 'GBP', 'AUD'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  profile.settings?.currency === currency && styles.currencyButtonActive
                ]}
                onPress={() => handleUpdateSetting('currency', currency)}
              >
                <Text style={[
                  styles.currencyButtonText,
                  profile.settings?.currency === currency && styles.currencyButtonTextActive
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Units</Text>
            <Text style={styles.settingValue}>
              {profile.settings?.units === 'metric' ? 'Metric (km, °C)' : 'Imperial (mi, °F)'}
            </Text>
          </View>
          <View style={styles.unitsButtons}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                profile.settings?.units === 'imperial' && styles.unitButtonActive
              ]}
              onPress={() => handleUpdateSetting('units', 'imperial')}
            >
              <Text style={[
                styles.unitButtonText,
                profile.settings?.units === 'imperial' && styles.unitButtonTextActive
              ]}>
                Imperial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                profile.settings?.units === 'metric' && styles.unitButtonActive
              ]}
              onPress={() => handleUpdateSetting('units', 'metric')}
            >
              <Text style={[
                styles.unitButtonText,
                profile.settings?.units === 'metric' && styles.unitButtonTextActive
              ]}>
                Metric
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>
              {profile.settings?.language === 'en' ? 'English' : profile.settings?.language}
            </Text>
          </View>
          <View style={styles.languageButtons}>
            {['en', 'es', 'fr', 'de'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langButton,
                  profile.settings?.language === lang && styles.langButtonActive
                ]}
                onPress={() => handleUpdateSetting('language', lang)}
              >
                <Text style={[
                  styles.langButtonText,
                  profile.settings?.language === lang && styles.langButtonTextActive
                ]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Coming soon</Text>
          </View>
          <Switch
            value={profile.settings?.darkMode || false}
            onValueChange={(value) => handleUpdateSetting('darkMode', value)}
            trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.PRIMARY }}
            disabled={true}
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Trip Reminders</Text>
            <Text style={styles.settingDescription}>Get notified before your trips</Text>
          </View>
          <Switch
            value={profile.settings?.notifications?.tripReminders ?? true}
            onValueChange={(value) => handleUpdateNotification('tripReminders', value)}
            trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.PRIMARY }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Deal Alerts</Text>
            <Text style={styles.settingDescription}>Receive flight and hotel deals</Text>
          </View>
          <Switch
            value={profile.settings?.notifications?.dealAlerts ?? false}
            onValueChange={(value) => handleUpdateNotification('dealAlerts', value)}
            trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.PRIMARY }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Newsletter</Text>
            <Text style={styles.settingDescription}>Travel tips and inspiration</Text>
          </View>
          <Switch
            value={profile.settings?.notifications?.newsletter ?? false}
            onValueChange={(value) => handleUpdateNotification('newsletter', value)}
            trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.PRIMARY }}
          />
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Travel Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.stats?.tripsPlanned || 0}</Text>
            <Text style={styles.statLabel}>Trips Planned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.stats?.placesVisited || 0}</Text>
            <Text style={styles.statLabel}>Places Visited</Text>
          </View>
        </View>
        
        {profile.stats?.favoriteDestinations && profile.stats.favoriteDestinations.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.favoritesTitle}>Recent Destinations</Text>
            <View style={styles.destinationTags}>
              {profile.stats.favoriteDestinations.map((destination, index) => (
                <View key={index} style={styles.destinationTag}>
                  <Text style={styles.destinationTagText}>📍 {destination}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.RED} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.logoutHint}>You'll be signed out of your account</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.GRAY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.BLACK,
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  photoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.WHITE,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.LIGHT_GRAY,
  },
  photoLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PRIMARY,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.WHITE,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginTop: 15,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 15,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  cancelButtonText: {
    color: Colors.GRAY,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.GRAY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.WHITE,
  },
  inputDisabled: {
    backgroundColor: Colors.LIGHT_GRAY,
    color: Colors.GRAY,
  },
  countryDisplay: {
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 50,
  },
  countryText: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  countryHint: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 4,
    fontStyle: 'italic',
  },
  travelStyleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  styleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    backgroundColor: Colors.WHITE,
  },
  styleButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  styleButtonText: {
    fontSize: 14,
    color: Colors.GRAY,
    fontWeight: '500',
  },
  styleButtonTextActive: {
    color: Colors.WHITE,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  budgetSeparator: {
    color: Colors.GRAY,
    fontSize: 14,
  },
  budgetCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 4,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  currencyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  currencyButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  currencyButtonText: {
    fontSize: 12,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  currencyButtonTextActive: {
    color: Colors.WHITE,
  },
  unitsButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  unitButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  unitButtonText: {
    fontSize: 12,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: Colors.WHITE,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  langButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  langButtonText: {
    fontSize: 12,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  langButtonTextActive: {
    color: Colors.WHITE,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 5,
    textAlign: 'center',
  },
  favoritesSection: {
    marginTop: 20,
  },
  favoritesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.GRAY,
    marginBottom: 10,
  },
  destinationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  destinationTag: {
    backgroundColor: Colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  destinationTagText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  logoutSection: {
    padding: 20,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.RED,
    backgroundColor: Colors.WHITE,
    minWidth: 150,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.RED,
  },
  logoutHint: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
})