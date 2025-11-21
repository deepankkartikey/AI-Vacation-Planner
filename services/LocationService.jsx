import * as Location from 'expo-location';

/**
 * Get user's current location and find nearest airport
 */
export const getUserLocation = async () => {
    try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
            console.log('Location permission denied');
            return {
                success: false,
                error: 'Location permission denied',
                fallbackAirport: 'YYZ' // Default to Toronto
            };
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        
        console.log('User location:', { latitude, longitude });

        // Get address from coordinates (reverse geocoding)
        const address = await Location.reverseGeocodeAsync({
            latitude,
            longitude
        });

        if (address && address.length > 0) {
            const userAddress = address[0];
            console.log('User address:', userAddress);

            // Determine nearest airport based on city/region
            const airport = getNearestAirport(userAddress);
            
            return {
                success: true,
                latitude,
                longitude,
                city: userAddress.city,
                region: userAddress.region,
                country: userAddress.country,
                airport: airport
            };
        }

        return {
            success: false,
            error: 'Could not get address',
            fallbackAirport: 'YYZ'
        };

    } catch (error) {
        console.error('Error getting location:', error);
        return {
            success: false,
            error: error.message,
            fallbackAirport: 'YYZ'
        };
    }
};

/**
 * Determine nearest major airport based on city/region
 */
const getNearestAirport = (address) => {
    const city = address.city?.toLowerCase() || '';
    const region = address.region?.toLowerCase() || '';
    const country = address.country?.toLowerCase() || '';

    // Canadian airports
    if (country.includes('canada') || country.includes('ca')) {
        if (city.includes('calgary') || region.includes('calgary')) return 'YYC';
        if (city.includes('toronto') || region.includes('ontario') && region.includes('toronto')) return 'YYZ';
        if (city.includes('vancouver')) return 'YVR';
        if (city.includes('montreal')) return 'YUL';
        if (city.includes('edmonton')) return 'YEG';
        if (city.includes('ottawa')) return 'YOW';
        if (city.includes('winnipeg')) return 'YWG';
        if (city.includes('quebec')) return 'YQB';
        if (city.includes('halifax')) return 'YHZ';
        if (city.includes('victoria')) return 'YYJ';
        
        // Default to Toronto for Canada
        return 'YYZ';
    }

    // US airports
    if (country.includes('united states') || country.includes('usa') || country.includes('us')) {
        if (city.includes('new york') || city.includes('manhattan') || city.includes('brooklyn')) return 'JFK';
        if (city.includes('los angeles')) return 'LAX';
        if (city.includes('chicago')) return 'ORD';
        if (city.includes('san francisco')) return 'SFO';
        if (city.includes('seattle')) return 'SEA';
        if (city.includes('miami')) return 'MIA';
        if (city.includes('boston')) return 'BOS';
        if (city.includes('atlanta')) return 'ATL';
        if (city.includes('dallas')) return 'DFW';
        if (city.includes('denver')) return 'DEN';
        if (city.includes('las vegas')) return 'LAS';
        if (city.includes('phoenix')) return 'PHX';
        if (city.includes('houston')) return 'IAH';
        if (city.includes('washington')) return 'DCA';
        
        // Default to JFK for US
        return 'JFK';
    }

    // UK airports
    if (country.includes('united kingdom') || country.includes('uk') || country.includes('england')) {
        if (city.includes('london')) return 'LHR';
        if (city.includes('manchester')) return 'MAN';
        if (city.includes('edinburgh')) return 'EDI';
        if (city.includes('glasgow')) return 'GLA';
        return 'LHR'; // Default to London Heathrow
    }

    // European airports
    if (city.includes('paris')) return 'CDG';
    if (city.includes('berlin')) return 'BER';
    if (city.includes('amsterdam')) return 'AMS';
    if (city.includes('rome')) return 'FCO';
    if (city.includes('madrid')) return 'MAD';
    if (city.includes('barcelona')) return 'BCN';
    if (city.includes('munich')) return 'MUC';
    if (city.includes('zurich')) return 'ZRH';
    if (city.includes('vienna')) return 'VIE';
    if (city.includes('copenhagen')) return 'CPH';

    // Asian airports
    if (city.includes('tokyo')) return 'NRT';
    if (city.includes('beijing')) return 'PEK';
    if (city.includes('shanghai')) return 'PVG';
    if (city.includes('hong kong')) return 'HKG';
    if (city.includes('singapore')) return 'SIN';
    if (city.includes('dubai')) return 'DXB';
    if (city.includes('delhi')) return 'DEL';
    if (city.includes('mumbai')) return 'BOM';
    if (city.includes('bangkok')) return 'BKK';
    if (city.includes('seoul')) return 'ICN';

    // Australian airports
    if (city.includes('sydney')) return 'SYD';
    if (city.includes('melbourne')) return 'MEL';
    if (city.includes('brisbane')) return 'BNE';
    if (city.includes('perth')) return 'PER';

    // Default fallback
    return 'YYZ'; // Toronto Pearson as default
};

/**
 * Get airport name from code
 */
export const getAirportName = (code) => {
    const airports = {
        // Canadian airports
        'YYC': 'Calgary International Airport',
        'YYZ': 'Toronto Pearson International Airport',
        'YVR': 'Vancouver International Airport',
        'YUL': 'Montreal-Trudeau International Airport',
        'YEG': 'Edmonton International Airport',
        'YOW': 'Ottawa Macdonald-Cartier International Airport',
        'YWG': 'Winnipeg James Armstrong Richardson International Airport',
        'YQB': 'Quebec City Jean Lesage International Airport',
        'YHZ': 'Halifax Stanfield International Airport',
        'YYJ': 'Victoria International Airport',
        
        // US airports
        'JFK': 'John F. Kennedy International Airport',
        'LAX': 'Los Angeles International Airport',
        'ORD': 'Chicago O\'Hare International Airport',
        'SFO': 'San Francisco International Airport',
        'SEA': 'Seattle-Tacoma International Airport',
        'MIA': 'Miami International Airport',
        'BOS': 'Boston Logan International Airport',
        'ATL': 'Hartsfield-Jackson Atlanta International Airport',
        'DFW': 'Dallas/Fort Worth International Airport',
        'DEN': 'Denver International Airport',
        'LAS': 'Las Vegas McCarran International Airport',
        'PHX': 'Phoenix Sky Harbor International Airport',
        'IAH': 'George Bush Intercontinental Airport',
        'DCA': 'Ronald Reagan Washington National Airport',
        
        // International airports
        'LHR': 'London Heathrow Airport',
        'CDG': 'Paris Charles de Gaulle Airport',
        'AMS': 'Amsterdam Schiphol Airport',
        'NRT': 'Tokyo Narita International Airport',
        'SIN': 'Singapore Changi Airport',
        'DXB': 'Dubai International Airport',
        'HKG': 'Hong Kong International Airport',
        'SYD': 'Sydney Kingsford Smith Airport'
    };
    
    return airports[code] || `${code} Airport`;
};
