import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";

export default function SignupBusinessAddress({}) {
  let router = useRouter();
  const { isTransitioning, navigateWithTransition } = usePageTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({
    state: "",
    city: "",
    area: "",
    address: "",
    googleMaps: "",
    pincode: "",
    loading: false,
    success: false,
    message: "",
    otpSent: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const autocompleteInputRef = useRef(null);
  const googleInstanceRef = useRef(null);

  // Lightweight Google Maps loader
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve(null);
      if (window.google && window.google.maps && window.google.maps.places) {
        return resolve(window.google);
      }
      const existing = document.getElementById("gmaps-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google));
        existing.addEventListener("error", () => resolve(null)); // Don't reject, just return null
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      
      // If no API key, resolve with null instead of failing
      if (!apiKey) {
        console.warn("Google Maps API key not found. Google Maps autocomplete will be disabled.");
        return resolve(null);
      }
      
      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        console.warn("Failed to load Google Maps API. Autocomplete will be disabled.");
        resolve(null); // Don't reject, just return null
      };
      document.head.appendChild(script);
    });
  };

  // Helper to check if a place is within Bengaluru by inspecting address text
  const isBengaluruAddress = (formattedAddress = "") => {
    const a = formattedAddress.toLowerCase();
    return a.includes("bengaluru") || a.includes("bangalore");
  };

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Initialize Google Places Autocomplete restricted to Bengaluru on Google Maps field only
  useEffect(() => {
    let autocomplete;
    const init = async () => {
      try {
        const google = await loadGoogleMaps();
        if (!google?.maps?.places || !autocompleteInputRef.current) {
          console.log("Google Maps not available, autocomplete disabled");
          return;
        }
        googleInstanceRef.current = google;
        const center = new google.maps.LatLng(12.9716, 77.5946); // Bengaluru
        const circle = new google.maps.Circle({ center, radius: 60000 }); // 60km radius
        autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "place_id", "geometry"],
          strictBounds: true,
        });
        autocomplete.setBounds(circle.getBounds());

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place) return;
          const formatted = place.formatted_address || "";
          if (!isBengaluruAddress(formatted)) {
            setData(prev => ({ ...prev, message: "We currently support only Bengaluru addresses.", googleMaps: "" }));
            if (autocompleteInputRef.current) autocompleteInputRef.current.value = "";
            return;
          }
          
          // Extract address components
          const addressComponents = place.address_components || [];
          let state = "";
          let city = "";
          let area = "";
          let pincode = "";
          
          // Parse address components
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes("administrative_area_level_1")) {
              state = component.long_name;
            } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = component.long_name;
            } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
              area = component.long_name;
            } else if (types.includes("postal_code") || types.includes("postal_code_prefix") || types.includes("postal_code_suffix")) {
              pincode = component.long_name;
            }
          });
          
          // Additional check: look for any component that looks like a pincode
          if (!pincode) {
            addressComponents.forEach(component => {
              const name = component.long_name || component.short_name || "";
              if (/^\d{6}$/.test(name)) {
                pincode = name;
              }
            });
          }
          
          // Debug logging to see what components we have
          console.log("Address components:", addressComponents);
          console.log("Extracted pincode:", pincode);
          
          // If city is not found in locality, try administrative_area_level_2
          if (!city && addressComponents.find(c => c.types.includes("administrative_area_level_2"))) {
            city = addressComponents.find(c => c.types.includes("administrative_area_level_2")).long_name;
          }
          
          // If pincode is not found in components, try to extract from formatted address
          if (!pincode) {
            // Try multiple patterns for Indian pincodes
            const pincodePatterns = [
              /\b\d{6}\b/g,  // Standard 6-digit pincode
              /\b\d{5,6}\b/g, // 5-6 digit pincode
              /pincode[:\s]*(\d{6})/i, // "Pincode: 560001" format
              /pin[:\s]*(\d{6})/i, // "Pin: 560001" format
            ];
            
            for (const pattern of pincodePatterns) {
              const match = formatted.match(pattern);
              if (match) {
                pincode = match[1] || match[0]; // Use captured group if available
                break;
              }
            }
            
            console.log("Regex fallback pincode:", pincode);
          }
          
          // Auto-fill all fields
          setData(prev => ({ 
            ...prev, 
            googleMaps: formatted,
            state: state || prev.state,
            city: city || prev.city,
            area: area || prev.area,
            pincode: pincode || prev.pincode,
            address: formatted, // Use the full formatted address as house address
            message: "" 
          }));
        });
      } catch (error) {
        console.warn("Google Maps initialization failed:", error);
      }
    };
    init();
    return () => {
      if (autocomplete) {
        try { googleInstanceRef.current?.maps?.event?.clearInstanceListeners(autocomplete); } catch (_) {}
      }
    };
  }, []);



  const handleSubmit = () => {
    // Prevent multiple OTP sends with additional protection
    if (data.loading || data.otpSent || isProcessing) {
      console.log("OTP already sent or processing, ignoring click");
      return;
    }

    // Validate required fields
    if (!data.state || !data.city || !data.area || !data.address || !data.pincode) {
      setData(prev => ({ 
        ...prev, 
        message: "Please fill in all required fields" 
      }));
      return;
    }

    // Check if step 1 data exists
    const step1Data = JSON.parse(localStorage.getItem("signup-step1") || "{}");
    if (!step1Data.mobileNo) {
      setData(prev => ({ 
        ...prev, 
        message: "Session expired. Please start over." 
      }));
      return;
    }

    // Set processing flags immediately
    setIsProcessing(true);
    setData(prev => ({ ...prev, loading: true, message: "", otpSent: false }));
    
    // Combine all data for step 2
    const step2Data = {
      state: data.state,
      city: data.city,
      area: data.area,
      address: data.address,
      googleMaps: data.googleMaps,
      pincode: data.pincode,
    };
    
    // Store step 2 data
    localStorage.setItem("signup-step2", JSON.stringify(step2Data));
    
    // Send OTP using the real API
    
    // Send OTP to mobile number using the same API structure as login
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: step1Data.mobileNo
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.ReferenceId) {
          setData(prev => ({ 
            ...prev, 
            loading: false, 
            success: true,
            otpSent: true,
            message: "" 
          }));
          setIsProcessing(false);
          
          // Store ReferenceId for OTP verification
          localStorage.setItem("otpReferenceId", response.ReferenceId);
          
          // Navigate to OTP verification page immediately with transition
          navigateWithTransition("/signup-otp-verification", 'left');
        } else {
          setData(prev => ({
            ...prev,
            loading: false,
            message: response.message || "Failed to send OTP. Please try again.",
          }));
          setIsProcessing(false);
        }
      })
      .catch((error) => {
        // Handle error silently
        
        // If API is not available, simulate success for testing
        if (error.message?.includes('Failed to fetch') || !process.env.NEXT_PUBLIC_API_URL) {
          // API not available, simulating OTP send for testing
          setData(prev => ({ 
            ...prev, 
            loading: false, 
            success: true,
            otpSent: true,
            message: "" 
          }));
          setIsProcessing(false);
          
          // Store demo ReferenceId for OTP verification
          localStorage.setItem("otpReferenceId", "demo-reference-id-12345");
          
          // Navigate to OTP verification page immediately with transition
          navigateWithTransition("/signup-otp-verification", 'left');
        } else {
          setData(prev => ({
            ...prev,
            loading: false,
            message: "Network error. Please try again.",
          }));
          setIsProcessing(false);
        }
      });
  };

  return (
    <>
      <Head>
        <title>Business Address - Wedsy Vendor</title>
        <meta name="description" content="Enter your business address details" />
      </Head>

      <div 
        className="min-h-screen bg-white flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          transform: isTransitioning 
            ? 'translateX(-100%)' 
            : isVisible 
              ? 'translateX(0)' 
              : 'translateX(100%)'
        }}
      >
        {/* Purple Line */}
        <div className="w-full h-1 bg-purple-600"></div>

        <div className="flex-1 px-6 py-8 pb-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigateWithTransition('/signup', 'right')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-3xl font-semibold text-gray-900">Business Address</h1>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Google Maps (Autocomplete attached here; Bengaluru only) - MOVED TO TOP */}
            <div>
              <input
                ref={autocompleteInputRef}
                type="text"
                placeholder="Google Maps"
                value={data.googleMaps}
                onChange={(e) => setData(prev => ({ ...prev, googleMaps: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* State */}
            <div>
              <input
                type="text"
                placeholder="State"
                value={data.state}
                onChange={(e) => setData(prev => ({ ...prev, state: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* City */}
            <div>
              <input
                type="text"
                placeholder="City"
                value={data.city}
                onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Area */}
            <div>
              <input
                type="text"
                placeholder="Area"
                value={data.area}
                onChange={(e) => setData(prev => ({ ...prev, area: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* House Address Textarea */}
            <div>
              <textarea
                placeholder="House Address"
                value={data.address}
                onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                className="input-field resize-none"
                rows={6}
              />
            </div>

            {/* Pincode */}
            <div>
              <input
                type="number"
                placeholder="Pincode"
                value={data.pincode}
                onChange={(e) => setData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                className="input-field"
                maxLength="6"
              />
            </div>

            {/* Success Message - Removed, redirects immediately */}

            {/* Next Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                disabled={data.loading || data.otpSent || isProcessing}
                style={{
                  width: '140px',
                  height: '50px',
                  borderRadius: '25px',
                  background: data.otpSent ? '#10B981' : '#2B3F6C',
                  opacity: 1
                }}
                className="text-white font-medium hover:bg-[#6B0025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
              >
                {data.loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : data.otpSent ? (
                  "OTP Sent ✓"
                ) : (
                  "Next"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 16px 20px;
          width: 100%;
          font-size: 16px;
          color: #374151;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        .input-field::placeholder {
          color: #9CA3AF;
        }
        .input-field:focus {
          outline: none;
          border-color: #2B3F6C;
          box-shadow: none;
        }
        
        /* iPhone 12 Pro and iPhone 14 Pro Max specific spacing */
        @media screen and (max-height: 844px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
        
        /* iPhone 14 Pro Max specific spacing */
        @media screen and (min-height: 932px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
        
        /* Ensure proper spacing for all iPhone models */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </>
  );
}
