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
    },
    {
        id:2,
        title:'Moderate',
        desc:'Keep cost on the average side',
        icon:'💰',
    },
    {
        id:3,
        title:'Luxury',
        desc:'Dont worry about cost',
        icon:'💸',
    },
]

export const AI_PROMPT=`Generate a comprehensive and detailed travel plan for Location: {location}, for {totalDays} Days and {totalNight} Night for {traveler} with a {budget} budget.

IMPORTANT INSTRUCTIONS:
1. Provide REAL, well-researched recommendations specific to {location}
2. Include accurate pricing in local currency with USD equivalent
3. Suggest places that are actually popular and worth visiting
4. Consider the traveler type ({traveler}) when suggesting activities
5. Respect the {budget} budget level in all recommendations
6. Include practical details like opening hours, best time to visit, and travel times
7. Provide diverse activities (culture, food, nature, entertainment)
8. Return ONLY valid JSON with NO additional text, explanations, or markdown

JSON Structure Required:
{
  "travelPlan": {
    "location": "{location}",
    "duration": "{totalDays} Days & {totalNight} Nights",
    "travelers": "{traveler}",
    "budget": "{budget}",
    "flight": {
      "details": "Brief flight information including typical airlines and routes",
      "price": "Estimated round-trip price range",
      "bookingUrl": "https://www.google.com/flights"
    },
    "hotels": [
      {
        "hotelName": "Real hotel name suitable for {budget} budget",
        "address": "Complete address with neighborhood",
        "price": "Realistic price per night in local currency (USD)",
        "imageUrl": "https://maps.googleapis.com/maps/api/place/photo",
        "geoCoordinates": [latitude, longitude],
        "rating": 4.5,
        "description": "Brief description highlighting key amenities and location benefits"
      }
    ],
    "itinerary": {
      "day1": {
        "theme": "Day theme (e.g., Arrival & City Exploration)",
        "bestTime": "Best time of day for these activities",
        "plan": [
          {
            "time": "Suggested time slot (e.g., 9:00 AM - 12:00 PM)",
            "placeName": "Real place/attraction name",
            "placeDetails": "Detailed description: what makes it special, what to see/do, insider tips",
            "placeImageUrl": "https://maps.googleapis.com/maps/api/place/photo",
            "geoCoordinates": [latitude, longitude],
            "ticketPricing": "Actual ticket prices or 'Free' with currency",
            "timeToTravel": "Estimated time needed at this location",
            "rating": 4.5,
            "category": "Category (Culture/Food/Nature/Entertainment/Shopping/Relaxation)"
          }
        ]
      },
      "day2": {
        "theme": "Day 2 theme",
        "bestTime": "Best time for activities",
        "plan": [...]
      }
    }
  }
}

QUALITY REQUIREMENTS:
- Hotels: Suggest {totalNight} hotel options with variety (location/style/amenities)
- Itinerary: Provide {totalDays} complete days, each with 3-5 activities
- Activities per day: Balance indoor/outdoor, active/relaxing, cultural/entertainment
- Realistic timing: Account for travel time between locations, meals, rest
- Budget alignment: 
  * Cheap: Budget accommodations, free/low-cost activities, local transport
  * Moderate: Mid-range hotels, mix of paid/free activities, comfortable transport
  * Luxury: High-end hotels, premium experiences, private transport options
- Traveler type consideration:
  * Just Me: Solo-friendly activities, social opportunities, safety considerations
  * A Couple: Romantic spots, intimate experiences, couple-friendly restaurants
  * Family: Kid-friendly activities, educational sites, family restaurants, safety
  * Friends: Group activities, nightlife, adventure sports, social venues

Return the JSON response immediately without any preamble, explanation, or markdown formatting.`
