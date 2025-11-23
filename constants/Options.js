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

export const AI_PROMPT=`Generate a comprehensive travel plan for Location: {location}, for {totalDays} Days and {totalNight} Night for {traveler} with a {budget} budget. 

Please provide the response in valid JSON format with the following structure:

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
