/**
 * Pincode Lookup Utility
 * Fetches exact location name (town/city/village), district, and state from Indian pincode
 */

/**
 * Get location details from pincode using multiple APIs for reliability
 * @param {string} pincode - 6-digit Indian pincode
 * @returns {Promise<{city: string, district: string, state: string, locationName: string}>}
 */
export const getLocationFromPincode = async (pincode) => {
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    throw new Error('Invalid pincode. Must be 6 digits.');
  }

  try {
    // Method 1: Try PostalPinCode API (reliable for Indian pincodes)
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffices = data[0].PostOffice;
          
          if (postOffices.length > 0) {
            // Get the first post office (usually the main one)
            const mainOffice = postOffices[0];
            
            // Extract location name (could be town, city, or village)
            const locationName = mainOffice.Name || mainOffice.BranchName || '';
            
            // Extract district
            const district = mainOffice.District || '';
            
            // Extract state
            const state = mainOffice.State || '';
            
            // Extract division (sometimes more specific)
            const division = mainOffice.Division || '';
            
            // Determine city name (prefer Name, fallback to District)
            const city = locationName || district || '';
            
            return {
              city: city.trim(),
              district: district.trim(),
              state: state.trim(),
              locationName: locationName.trim(),
              division: division.trim(),
              postOffices: postOffices.map(po => ({
                name: po.Name,
                branchType: po.BranchType,
                deliveryStatus: po.DeliveryStatus,
                district: po.District,
                state: po.State
              }))
            };
          }
        }
      }
    } catch (apiError) {
      console.warn('PostalPinCode API failed, trying fallback:', apiError);
    }

    // Method 2: Fallback to OpenStreetMap/Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=IN&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'JC-Timbers/1.0',
            'Accept-Language': 'en'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const address = result.address || {};
          
          // Extract location details
          const locationName = address.village || address.town || address.city || address.suburb || '';
          const district = address.county || address.city_district || '';
          const state = address.state || '';
          const city = address.city || address.town || address.village || district || '';
          
          return {
            city: city.trim(),
            district: district.trim(),
            state: state.trim(),
            locationName: locationName.trim(),
            postOffices: []
          };
        }
      }
    } catch (nominatimError) {
      console.warn('Nominatim API failed:', nominatimError);
    }

    // If both APIs fail, return empty result
    return {
      city: '',
      district: '',
      state: '',
      locationName: '',
      postOffices: []
    };
  } catch (error) {
    console.error('Error fetching location from pincode:', error);
    throw new Error(`Failed to fetch location details: ${error.message}`);
  }
};

/**
 * Validate pincode format (Indian pincodes: 6 digits, cannot start with 0)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean}
 */
export const validatePincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

/**
 * Get state from pincode prefix (approximate, for quick validation)
 * @param {string} pincode - 6-digit pincode
 * @returns {string|null} - State name or null
 */
export const getStateFromPincodePrefix = (pincode) => {
  if (!validatePincode(pincode)) return null;
  
  const prefix = pincode.substring(0, 2);
  
  // Indian pincode state mapping (first 2 digits)
  const stateMap = {
    '11': 'Delhi',
    '12': 'Haryana',
    '13': 'Haryana',
    '14': 'Punjab',
    '15': 'Himachal Pradesh',
    '16': 'Punjab',
    '17': 'Himachal Pradesh',
    '18': 'Jammu and Kashmir',
    '19': 'Jammu and Kashmir',
    '20': 'Uttar Pradesh',
    '21': 'Uttar Pradesh',
    '22': 'Uttar Pradesh',
    '23': 'Uttar Pradesh',
    '24': 'Uttar Pradesh',
    '25': 'Uttar Pradesh',
    '26': 'Uttar Pradesh',
    '27': 'Uttar Pradesh',
    '28': 'Uttar Pradesh',
    '30': 'Rajasthan',
    '31': 'Rajasthan',
    '32': 'Rajasthan',
    '33': 'Rajasthan',
    '34': 'Rajasthan',
    '36': 'Gujarat',
    '37': 'Gujarat',
    '38': 'Gujarat',
    '39': 'Gujarat',
    '40': 'Maharashtra',
    '41': 'Maharashtra',
    '42': 'Maharashtra',
    '43': 'Maharashtra',
    '44': 'Maharashtra',
    '45': 'Madhya Pradesh',
    '46': 'Madhya Pradesh',
    '47': 'Madhya Pradesh',
    '48': 'Madhya Pradesh',
    '49': 'Chhattisgarh',
    '50': 'Telangana',
    '51': 'Andhra Pradesh',
    '52': 'Andhra Pradesh',
    '53': 'Andhra Pradesh',
    '56': 'Karnataka',
    '57': 'Karnataka',
    '58': 'Karnataka',
    '59': 'Karnataka',
    '60': 'Tamil Nadu',
    '61': 'Tamil Nadu',
    '62': 'Tamil Nadu',
    '63': 'Tamil Nadu',
    '67': 'Kerala',
    '68': 'Kerala',
    '69': 'Kerala',
    '70': 'West Bengal',
    '71': 'West Bengal',
    '72': 'West Bengal',
    '73': 'West Bengal',
    '74': 'West Bengal',
    '75': 'Odisha',
    '76': 'Odisha',
    '77': 'Odisha',
    '78': 'Assam',
    '79': 'Assam',
    '79': 'Meghalaya',
    '79': 'Manipur',
    '79': 'Nagaland',
    '79': 'Tripura',
    '79': 'Mizoram',
    '79': 'Arunachal Pradesh',
    '80': 'Bihar',
    '81': 'Bihar',
    '82': 'Bihar',
    '83': 'Jharkhand',
    '84': 'Jharkhand',
    '85': 'Bihar',
    '90': 'Punjab',
    '91': 'Chandigarh',
  };
  
  return stateMap[prefix] || null;
};
