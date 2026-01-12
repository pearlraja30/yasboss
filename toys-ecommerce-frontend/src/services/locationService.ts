/**
 * 📍 Get Address Details by Pincode
 * Fetches city and state information using a public API
 */
export const getAddressByPincode = async (pincode: string) => {
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            return {
                city: postOffice.District,
                state: postOffice.State,
                district: postOffice.District,
                locality: postOffice.Name
            };
        } else {
            throw new Error("Invalid Pincode");
        }
    } catch (error) {
        console.error("Pincode API Error:", error);
        throw error;
    }
};

/**
 * 🛰️ Existing: Get Coordinates from Browser GPS
 */
export const getCurrentCoordinates = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

/**
 * 🗺️ Existing: Get Address from Latitude/Longitude (Reverse Geocoding)
 */
export const getAddressFromCoords = async (lat: number, lng: number) => {
    // Replace with your preferred Geocoding API (e.g., OpenStreetMap Nominatim)
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return {
        city: data.address.city || data.address.town || data.address.village,
        locality: data.address.suburb || data.address.neighbourhood,
    };
};