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

// PHASE 1: Quick Skeleton Prompt (Fast - generates basic structure)
export const AI_SKELETON_PROMPT=`Generate a QUICK itinerary skeleton for {location}, {totalDays} Days, {totalNight} Nights.

**Trip Info:**
- Travelers: {traveler}
- Budget: {budget} ({dailyBudget} USD/day per person)
- Activity Interests: {activityPreferences}
- Cost Preference: {activityCostPreference}

**IMPORTANT: Generate ONLY basic structure - NO detailed descriptions!**

Return MINIMAL JSON with:
1. Flight info (just basic details and estimated price)
2. 2-3 hotel names with price range
3. Daily itinerary with ONLY:
   - Place names
   - Time slots (morning/afternoon/evening)
   - Activity category
   - Estimated cost range

**CRITICAL**: 
- Keep it SHORT - aim for 2000 tokens max
- NO detailed descriptions
- NO long explanations
- ONLY place names, times, and basic info
- Return ONLY valid JSON, no markdown

JSON Format:
{
  "travelPlan": {
    "location": "{location}",
    "duration": "{totalDays} Days & {totalNight} Nights",
    "travelers": "{traveler}",
    "budget": "{budget}",
    "flight": {
      "details": "Basic flight info",
      "price": "Estimated price range",
      "bookingUrl": "https://www.google.com/flights"
    },
    "hotels": [
      {
        "hotelName": "Hotel Name",
        "address": "Address",
        "price": "Price range",
        "rating": 4.5
      }
    ],
    "itinerary": {
      "day1": {
        "theme": "Day theme/focus",
        "plan": [
          {
            "time": "9:00 AM - 11:00 AM",
            "placeName": "Place Name",
            "category": "culture/food/nature/etc",
            "estimatedCost": "$20-30"
          }
        ]
      }
    }
  }
}`

// PHASE 2: Detail Enhancement Prompt (Enriches skeleton with full details)
export const AI_DETAIL_PROMPT=`Enhance this trip itinerary with complete details:

**Original Skeleton:**
{skeleton}

**Trip Context:**
- Location: {location}
- Travelers: {traveler}
- Budget: {dailyBudget} USD/day
- Preferences: {activityPreferences}
- Cost Preference: {activityCostPreference}

**Add the following details to EACH place:**
1. 2-3 sentence description (concise!)
2. Specific ticket pricing in USD
3. Geo-coordinates [latitude, longitude]
4. Place image URL suggestion
5. Best time to visit
6. Travel time from previous location
7. Pro tips (1 sentence)

**For Hotels:**
- Full description (2 sentences)
- Amenities
- Geo-coordinates
- Image URL

**IMPORTANT:**
- Keep descriptions SHORT (2-3 sentences max)
- Use real places and accurate info for {location}
- Respect the {dailyBudget} USD budget
- Match activity preferences: {activityPreferences}
- Return ONLY valid JSON, no markdown

Return the COMPLETE enhanced JSON in the same structure as the skeleton, but with all details added.`

