export const SelectTravelesList=[
    {
        id:1,
        title:'Just Me',
        desc:'A sole traveles in exploration',
        icon:'✈️',
        people:'1'
    },
    {
        id:2,
        title:'A Couple',
        desc:'Two traveles in tandem',
        icon:'🥂',
        people:'2 People'
    },
    {
        id:3,
        title:'Family',
        desc:'A group of fun loving adv',
        icon:'🏡',
        people:'3 to 5 People'
    },
    {
        id:4,
        title:'Friends',
        desc:'A bunch of thrill-seekes',
        icon:'⛵',
        people:'5 to 10 People'
    },
]


export const SelectBudgetOptions=[
    {
        id:1,
        title:'Cheap',
        desc:'Stay conscious of costs',
        icon:'💵',
        range:'$50-100 per day'
    },
    {
        id:2,
        title:'Moderate',
        desc:'Keep cost on the average side',
        icon:'💰',
        range:'$100-300 per day'
    },
    {
        id:3,
        title:'Luxury',
        desc:'Dont worry about cost',
        icon:'💸',
        range:'$300+ per day'
    },
]

export const AI_PROMPT=`Generate a comprehensive and detailed travel plan for Location: {location}, for {totalDays} Days and {totalNight} Night for {traveler} with a {budget} budget ({dailyBudget} USD per person per day).

**Activity Preferences**: {activityPreferences}
**Activity Cost Preference**: {activityCostPreference}
**Daily Budget Per Person**: {dailyBudget} USD

IMPORTANT INSTRUCTIONS:
1. Provide REAL, well-researched recommendations specific to {location}
2. Include accurate pricing in local currency with USD equivalent
3. **ALL pricing must fit within the daily budget of {dailyBudget} USD per person**
4. **PRIORITIZE activities that match these preferences: {activityPreferences}**
5. **RESPECT the cost preference: {activityCostPreference}**
   - If "free": Focus on free/low-cost activities, public spaces, free museums
   - If "mixed": Balance 50/50 between free and paid activities
   - If "premium": Focus on premium paid experiences, tours, special access
6. Consider the traveler type ({traveler}) when suggesting activities
7. Respect the {budget} budget level and {dailyBudget} USD daily limit in all recommendations
8. Include practical details like opening hours, best time to visit, and travel times
9. Provide diverse activities within the preferred categories
10. **CRITICAL**: Return ONLY valid, complete JSON - NO markdown, NO explanations, NO truncation
11. **CRITICAL**: Keep descriptions concise (max 2-3 sentences per item) to fit token limits
12. **CRITICAL**: Ensure JSON is properly closed with all brackets and braces

JSON Structure Required:
{
  "travelPlan": {
    "location": "{location}",
    "duration": "{totalDays} Days & {totalNight} Nights",
    "travelers": "{traveler}",
    "budget": "{budget}",
    "flight": {
      "details": "Flight information",
      "price": "Estimated price",
      "bookingUrl": "https://www.google.com/flights"
    },
    "hotels": [
      {
        "hotelName": "Hotel Name",
        "address": "Hotel Address",
        "price": "Price per night",
        "imageUrl": "https://example.com/hotel-image.jpg",
        "geoCoordinates": [latitude, longitude],
        "rating": 4.5,
        "description": "Hotel description"
      }
    ],
    "itinerary": {
      "day1": {
        "bestTime": "Morning/Afternoon/Evening",
        "plan": [
          {
            "placeName": "Place Name",
            "placeDetails": "Description of the place and activities",
            "placeImageUrl": "https://example.com/place-image.jpg",
            "geoCoordinates": [latitude, longitude],
            "ticketPricing": "Free or ticket price",
            "timeToTravel": "Duration"
          }
        ]
      }
    }
  }
}

Make sure to provide actual recommendations for {location} with realistic prices and genuine place suggestions. Return ONLY valid JSON, no additional text.`
