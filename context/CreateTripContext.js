import { createContext, useContext } from "react";

/**
 * Context for managing trip creation data across the multi-step flow
 * 
 * Trip Data Structure:
 * - locationInfo: {name, coordinates, placeId} - Destination information from Google Places
 * - totalNoOfDays: number - Duration of the trip
 * - traveler: {title, desc, icon, people} - Number and type of travelers
 * - budget: string - Budget category (Cheap, Moderate, Luxury)
 * - activityPreferences: string[] - Selected activity types
 * - activityCostPreference: string - Activity budget preference (free, mixed, paid)
 * - dailyBudget: number - Daily spending budget amount
 * - startDate: string - Trip start date
 * - endDate: string - Trip end date
 */

export const CreateTripContext = createContext(null);

/**
 * Custom hook to use the CreateTripContext
 * Provides easy access to trip data and setter function
 * 
 * @returns {{tripData: Object, setTripData: Function}}
 * @throws {Error} If used outside of CreateTripContext.Provider
 * 
 * @example
 * const { tripData, setTripData } = useCreateTrip();
 * setTripData({ ...tripData, budget: 'Moderate' });
 */
export const useCreateTrip = () => {
  const context = useContext(CreateTripContext);
  if (!context) {
    throw new Error('useCreateTrip must be used within CreateTripContext.Provider');
  }
  return context;
};