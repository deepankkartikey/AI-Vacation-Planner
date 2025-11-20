import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../configs/FirebaseConfig';

export const deleteTrip = async (tripId) => {
    try {
        console.log(`🗑️ Attempting to delete trip with ID: ${tripId}`);
        
        await deleteDoc(doc(db, "UserTrips", tripId));
        
        console.log('✅ Trip deleted successfully from Firestore');
        return { success: true };
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