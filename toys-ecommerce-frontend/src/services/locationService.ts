// src/services/locationService.ts
export const getCurrentCoordinates = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
};

// Optional: Use a free API like BigDataCloud or OpenStreetMap for Reverse Geocoding
export const getAddressFromCoords = async (lat: number, lng: number) => {
    const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    return response.json();
};