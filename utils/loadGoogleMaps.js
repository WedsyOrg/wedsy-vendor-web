import {Loader} from "@googlemaps/js-api-loader";

// Global promise to prevent multiple loads
let googleMapsPromise = null;

export const loadGoogleMaps = async () => {
  // Return existing promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded globally
  if (window.google && window.google.maps) {
    return window.google;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key is missing");
    throw new Error("Missing API key");
  }

  // Create and configure the loader
  const loader = new Loader({
    apiKey,
    version: "quarterly",
    libraries: ["places"],
  });

  // Create the promise
  googleMapsPromise = loader.load()
    .then((google) => {
      console.log("Google Maps loaded successfully");
      return google;
    })
    .catch((error) => {
      console.error("Failed to load Google Maps:", error);
      googleMapsPromise = null; // Reset on error so it can be retried
      throw error;
    });

  return googleMapsPromise;
};