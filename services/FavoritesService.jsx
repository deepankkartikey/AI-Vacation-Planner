import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@trip_favorites';

/**
 * Get all favorites
 */
export const getFavorites = async () => {
    try {
        const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : {};
    } catch (error) {
        console.error('Error getting favorites:', error);
        return {};
    }
};

/**
 * Check if a place is favorited
 * @param {string} tripId - Trip ID
 * @param {string} dayKey - Day key (e.g., 'day1')
 * @param {string} placeName - Place name
 */
export const checkFavorite = async (tripId, dayKey, placeName) => {
    try {
        const favorites = await getFavorites();
        const tripFavorites = favorites[tripId] || {};
        const dayFavorites = tripFavorites[dayKey] || [];
        return dayFavorites.some(fav => fav.placeName === placeName);
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
};

/**
 * Add a place to favorites
 * @param {string} tripId - Trip ID
 * @param {string} dayKey - Day key (e.g., 'day1')
 * @param {object} place - Place object
 */
export const addFavorite = async (tripId, dayKey, place) => {
    try {
        const favorites = await getFavorites();
        
        // Initialize trip favorites if doesn't exist
        if (!favorites[tripId]) {
            favorites[tripId] = {};
        }
        
        // Initialize day favorites if doesn't exist
        if (!favorites[tripId][dayKey]) {
            favorites[tripId][dayKey] = [];
        }
        
        // Check if already exists
        const exists = favorites[tripId][dayKey].some(fav => fav.placeName === place.placeName);
        
        if (!exists) {
            favorites[tripId][dayKey].push({
                placeName: place.placeName,
                placeDetails: place.placeDetails,
                ticketPricing: place.ticketPricing,
                timeToTravel: place.timeToTravel,
                rating: place.rating,
                openingHours: place.openingHours,
                addedAt: new Date().toISOString()
            });
            
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            console.log('✅ Added to favorites:', place.placeName);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

/**
 * Remove a place from favorites
 * @param {string} tripId - Trip ID
 * @param {string} dayKey - Day key (e.g., 'day1')
 * @param {string} placeName - Place name
 */
export const removeFavorite = async (tripId, dayKey, placeName) => {
    try {
        const favorites = await getFavorites();
        
        if (favorites[tripId] && favorites[tripId][dayKey]) {
            favorites[tripId][dayKey] = favorites[tripId][dayKey].filter(
                fav => fav.placeName !== placeName
            );
            
            // Clean up empty arrays/objects
            if (favorites[tripId][dayKey].length === 0) {
                delete favorites[tripId][dayKey];
            }
            
            if (Object.keys(favorites[tripId]).length === 0) {
                delete favorites[tripId];
            }
            
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            console.log('🗑️ Removed from favorites:', placeName);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

/**
 * Get all favorites for a specific trip
 * @param {string} tripId - Trip ID
 */
export const getTripFavorites = async (tripId) => {
    try {
        const favorites = await getFavorites();
        return favorites[tripId] || {};
    } catch (error) {
        console.error('Error getting trip favorites:', error);
        return {};
    }
};

/**
 * Clear all favorites for a trip
 * @param {string} tripId - Trip ID
 */
export const clearTripFavorites = async (tripId) => {
    try {
        const favorites = await getFavorites();
        delete favorites[tripId];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        console.log('🗑️ Cleared all favorites for trip:', tripId);
        return true;
    } catch (error) {
        console.error('Error clearing trip favorites:', error);
        throw error;
    }
};
