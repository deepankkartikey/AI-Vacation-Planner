import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import ProfileService from './ProfileService';

export const deleteTrip = async (tripId) => {
    try {
        console.log(`🗑️ Attempting to delete trip with ID: ${tripId}`);
        
        // Get trip data before deleting (for stat calculation)
        const tripRef = doc(db, "UserTrips", tripId);
        const tripSnap = await getDoc(tripRef);
        const tripData = tripSnap.exists() ? tripSnap.data() : null;
        
        // Delete from Firestore
        await deleteDoc(tripRef);
        
        console.log('✅ Trip deleted successfully from Firestore');
        
        // Update user stats in background (don't wait)
        if (tripData && auth.currentUser) {
            ProfileService.decrementTripCount(auth.currentUser.uid, tripData)
                .then(() => console.log('✅ User stats decremented'))
                .catch(err => console.log('⚠️ Stats decrement failed (non-critical):', err.message));
        }
        
        return { success: true, tripData }; // Return tripData for potential undo
    } catch (error) {
        console.error('❌ Error deleting trip:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        return { 
            success: false, 
            error: error.message 
        };
    }
};

export const restoreTrip = async (tripData) => {
    try {
        console.log(`♻️ Attempting to restore trip with ID: ${tripData.docId}`);
        
        await setDoc(doc(db, "UserTrips", tripData.docId), tripData);
        
        console.log('✅ Trip restored successfully to Firestore');
        
        // Update user stats in background (add back the stats)
        if (auth.currentUser) {
            ProfileService.incrementTripCount(auth.currentUser.uid, tripData)
                .then(() => console.log('✅ User stats restored'))
                .catch(err => console.log('⚠️ Stats restore failed (non-critical):', err.message));
        }
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error restoring trip:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        return { 
            success: false, 
            error: error.message 
        };
    }
};