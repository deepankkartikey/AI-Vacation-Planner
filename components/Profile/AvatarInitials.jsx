import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors'

/**
 * Generate initials from full name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name || name.trim() === '') {
    return '?';
  }

  const nameParts = name.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) {
    return '?';
  }
  
  if (nameParts.length === 1) {
    // Single name - take first 2 letters
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple names - take first letter of first and last name
  const firstInitial = nameParts[0][0];
  const lastInitial = nameParts[nameParts.length - 1][0];
  
  return (firstInitial + lastInitial).toUpperCase();
};

/**
 * Generate a consistent color based on name
 * @param {string} name - Full name
 * @returns {string} Hex color
 */
export const getAvatarColor = (name) => {
  if (!name) {
    return Colors.PRIMARY;
  }

  // Predefined pleasant colors for avatars
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
    '#F8B88B', // Peach
    '#ABEBC6', // Light Green
    '#F1948A', // Pink
    '#85929E', // Gray Blue
  ];

  // Generate consistent index from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * AvatarInitials Component - Displays user initials in a colored circle
 * @param {string} name - Full name to generate initials from
 * @param {number} size - Diameter of the avatar circle (default: 120)
 * @param {number} fontSize - Font size for initials (default: auto-calculated)
 * @param {string} borderColor - Border color (default: white)
 * @param {number} borderWidth - Border width (default: 4)
 */
export default function AvatarInitials({ 
  name, 
  size = 120, 
  fontSize, 
  borderColor = Colors.WHITE,
  borderWidth = 4,
}) {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  
  // Auto-calculate font size based on avatar size if not provided
  const calculatedFontSize = fontSize || size * 0.4;

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        borderColor,
        borderWidth,
      }
    ]}>
      <Text style={[styles.initials, { fontSize: calculatedFontSize }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
