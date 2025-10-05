import { processMobileNumber } from "@/utils/phoneNumber";
import { loadGoogleMaps } from "@/utils/loadGoogleMaps";
import {
  Select,
  TextInput,
  Label,
  Checkbox,
  Button,
  Textarea,
  Alert,
} from "flowbite-react";
import { memo, useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Signup = memo(() => {
  Signup.displayName = 'Signup';
  // Memoize update functions to prevent re-renders
  const updateFormData = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBusinessAddress = useCallback((field, value) => {
    setBusinessAddress(prev => ({ ...prev, [field]: value }));
  }, []);
  const inputRefs = useRef([]);
  const areaInputRef = useRef(null);
  const router = useRouter();
  const [display, setDisplay] = useState("SignUp");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    location: false,
    otp: false,
    submit: false
  });
  const [showResend, setShowResend] = useState(false);
  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    servicesOffered: [],
    category: "",
    loading: false,
    success: false,
    otpSent: false,
    Otp: "",
    ReferenceId: "",
    message: "",
  });
  const [vendorCategories, setVendorCategories] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [businessAddress, setBusinessAddress] = useState({
    state: "",
    city: "",
    area: "",
    pincode: "",
    address: "",
    googleMaps: "",
  });
  const updateAddress = useMemo(() => async (tag) => {
    console.log("updateAddress called");
    setLoadingStates(prev => ({ ...prev, submit: true }));
    
    // First, send OTP
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
      }),
    })
      .then((otpResponse) => otpResponse.json())
      .then((otpResponse) => {
        console.log("OTP API Response:", otpResponse);
        setData(prev => ({
          ...prev,
          otpSent: true,
          ReferenceId: otpResponse.ReferenceId,
        }));
        setLoadingStates(prev => ({ ...prev, submit: false }));
        console.log("Redirecting to OTP page...");
        setDisplay("OTP");
        setTimeout(() => {
          setShowResend(true);
        }, 60000);
      })
      .catch((error) => {
        setLoadingStates(prev => ({ ...prev, submit: false }));
        console.error("There was a problem with the operation:", error);
        toast.error(error.message || "Network error. Please check your connection and try again.");
      });
  }, [data.phone, router]);

  const handleChange = useMemo(() => (element, index) => {
    if (/[^0-9]/.test(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    // Combine OTP digits and update data state
    const combinedOtp = newOtp.join('');
    setData(prev => ({ ...prev, Otp: combinedOtp }));
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  }, [otp])
  const handleKeyDown = useCallback((event, index) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }, [otp, inputRefs]);

  const SendOTP = useCallback(() => {
    // Just redirect to Address page without sending OTP
    setDisplay("Address");
  }, []);
  const handleOTPSubmit = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, otp: true }));
    
    // Ensure googleMaps is set
    const googleMapsValue = businessAddress.googleMaps || businessAddress.area || "Bangalore, Karnataka, India";
    
    // Create vendor account with OTP verification
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
        email: data.email,
        name: data.name,
        category: data.category,
        gender: data.gender,
        dob: data.dob,
        servicesOffered: data.servicesOffered,
        Otp: data.Otp,
        ReferenceId: data.ReferenceId,
        businessAddress: {
          state: businessAddress.state,
          city: businessAddress.city,
          area: businessAddress.area,
          pincode: businessAddress.pincode,
          address: businessAddress.address,
          googleMaps: googleMapsValue,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Vendor Creation API Response:", response);
        if (response.message === "success" && response.token) {
          setData(prev => ({
            ...prev,
            loading: false,
            success: true,
            otpSent: false,
            Otp: "",
            ReferenceId: "",
            message: "",
          }));
          localStorage.setItem("token", response.token);
          localStorage.setItem("vendor-just-signed-up", "true");
          setLoadingStates(prev => ({ ...prev, otp: false }));
          router.push("/");
        } else {
          setLoadingStates(prev => ({ ...prev, otp: false }));
          toast.error(response.message || "Invalid OTP. Please try again.");
        }
      })
      .catch((error) => {
        setLoadingStates(prev => ({ ...prev, otp: false }));
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Network error. Please check your connection and try again.");
      });
  }, [data, businessAddress, router]);
  const fetchLocationData = () => {
    setLoadingStates(prev => ({ ...prev, location: true }));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/location`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setLoadingStates(prev => ({ ...prev, location: false }));
        let tempList = response;
        let states = tempList.filter((i) => i.locationType === "State");
        let cities = tempList.filter((i) => i.locationType === "City");
        let areas = tempList.filter((i) => i.locationType === "Area");
        let pincodes = tempList.filter((i) => i.locationType === "Pincode");
        Promise.all(
          states.map((i) => {
            return new Promise((resolve, reject) => {
              let tempCities = cities.filter((j) => j.parent == i._id);
              Promise.all(
                tempCities.map((j) => {
                  return new Promise((resolve1, reject1) => {
                    let tempAreas = areas.filter((k) => k.parent == j._id);
                    Promise.all(
                      tempAreas.map((k) => {
                        return new Promise((resolve2, reject1) => {
                          let tempPincodes = pincodes.filter(
                            (l) => l.parent == k._id
                          );
                          resolve2({ ...k, pincodes: tempPincodes });
                        });
                      })
                    ).then((result) => resolve1({ ...j, areas: result }));
                  });
                })
              ).then((result) => resolve({ ...i, cities: result }));
            });
          })
        ).then((result) => setLocationData(result));
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchVendorCategories = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/vendor-category`;
      console.log('Fetching vendor categories from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.log('Response was:', text);
        throw new Error('Invalid JSON response');
      }

      console.log('Parsed vendor categories:', data);

      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data);
        throw new Error('Invalid response format - expected array');
      }

      setVendorCategories(data.map(category => ({
        ...category,
        // Ensure we have both title and name properties
        title: category.title || category.name,
        name: category.name || category.title
      })));
    } catch (error) {
      console.error("Error fetching vendor categories:", error);
      console.error("Stack trace:", error.stack);
      setVendorCategories([]);
    } finally {
      setData(prev => ({ ...prev, loading: false }));
    }
  };
  useEffect(() => {
    fetchVendorCategories();
    fetchLocationData();
  }, []);

  // Initialize Google Maps Places Autocomplete for area selection (Bangalore only)
  useEffect(() => {
    if (display !== "Address" || !areaInputRef.current) return;
    
    let autocomplete;
    const initializeAutocomplete = async () => {
      try {
        const google = await loadGoogleMaps();
        if (!google?.maps?.places) return;

        // Define Bangalore bounds
        const bangaloreBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(12.8236, 77.3832), // Southwest corner
          new google.maps.LatLng(13.1721, 77.8369)  // Northeast corner
        );

        autocomplete = new google.maps.places.Autocomplete(
          areaInputRef.current,
          {
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" },
            bounds: bangaloreBounds,
            strictBounds: true,
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;

          const formattedAddress = place.formatted_address || "";
          const lowerAddress = formattedAddress.toLowerCase();
          
          // Validate that the selected location is in Bangalore
          if (!lowerAddress.includes("bengaluru") && !lowerAddress.includes("bangalore")) {
            toast.error("Please select a location within Bangalore only.");
            if (areaInputRef.current) areaInputRef.current.value = "";
            setBusinessAddress(prev => ({ ...prev, area: "" }));
            return;
          }

          // Extract area/locality from address components
          let areaName = "";
          if (place.address_components) {
            const locality = place.address_components.find(component => 
              component.types.includes("locality") || 
              component.types.includes("sublocality") ||
              component.types.includes("sublocality_level_1")
            );
            areaName = locality ? locality.long_name : formattedAddress;
          } else {
            areaName = formattedAddress;
          }

          setBusinessAddress(prev => ({ 
            ...prev, 
            area: areaName,
            googleMaps: formattedAddress
          }));
        });
      } catch (error) {
        console.error("Failed to initialize Google Places:", error);
      }
    };

    initializeAutocomplete();
    
    return () => {
      // Cleanup if needed
    };
  }, [display]);
  // Memoize change handlers
  const handleNameChange = useCallback((e) => setData(prev => ({ ...prev, name: e.target.value })), []);
  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setData(prev => ({ ...prev, phone: value }));
    }
  }, []);
  const handleEmailChange = useCallback((e) => setData(prev => ({ ...prev, email: e.target.value })), []);
  const handleGenderChange = useCallback((e) => setData(prev => ({ ...prev, gender: e.target.value })), []);
  const handleCategoryChange = useCallback((e) => setData(prev => ({ ...prev, category: e.target.value })), []);
  const handleDobChange = useCallback((e) => setData(prev => ({ ...prev, dob: e.target.value })), []);

  const handleStateChange = useCallback((e) => {
    setBusinessAddress(prev => ({
      ...prev,
      state: e.target.value,
      city: "",
      area: "",
    }));
  }, []);

  const handleCityChange = useCallback((e) => {
    setBusinessAddress(prev => ({
      ...prev,
      city: e.target.value,
      area: "",
    }));
  }, []);

  const handleAreaChange = useCallback((e) => {
    setBusinessAddress(prev => ({
      ...prev,
      area: e.target.value,
    }));
  }, []);

  const addressView = useMemo(() => {
    return (
      <>
        <h1 className="mt-8 mb-4 text-2xl font-medium">Business Address</h1>
        <Alert color="info">
          <span className="font-medium">Note: </span>We are currently operational
          in Bangalore, will get to other cities soon 🙂
        </Alert>
        <Select
          value={businessAddress.state}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              state: e.target.value,
              city: "Bangalore",
              area: "",
            });
          }}
          disabled={data.loading}
        >
          <option value={""}>Select State</option>
          <option value="Karnataka">Karnataka</option>
        </Select>
        <Select
          value={businessAddress.city}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              city: e.target.value,
              area: "",
            });
          }}
          disabled={data.loading}
        >
          <option value={""}>Select City</option>
          <option value="Bangalore">Bangalore</option>
        </Select>
        <TextInput
          ref={areaInputRef}
          placeholder="Search for area in Bangalore"
          value={businessAddress.area}
          onChange={(e) => {
            const areaValue = e.target.value;
            setBusinessAddress({
              ...businessAddress,
              area: areaValue,
              // Auto-fill googleMaps if not already set
              googleMaps: businessAddress.googleMaps || areaValue
            });
          }}
          disabled={data.loading}
        />
        <Textarea
          placeholder="Address"
          rows={3}
          value={businessAddress.address}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              address: e.target.value,
            });
          }}
        />
        <TextInput
          placeholder="Google Maps"
          value={businessAddress.googleMaps}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              googleMaps: e.target.value,
            });
          }}
        />
        <TextInput
          placeholder="Pincode"
          value={businessAddress.pincode}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              pincode: e.target.value,
            });
          }}
        />
        <Button
          className="text-white bg-rose-900 enabled:hover:bg-900 self-center rounded-full"
          disabled={
            loadingStates.submit ||
            !businessAddress.state ||
            !businessAddress.city ||
            !businessAddress.area ||
            !businessAddress.address ||
            !businessAddress.pincode
          }
          onClick={() => {
            console.log("Send OTP & Continue button clicked");
            console.log("Business Address:", businessAddress);
            console.log("Loading States:", loadingStates);
            updateAddress();
          }}
        >
          {loadingStates.submit ? "Sending OTP..." : "Send OTP & Continue"}
        </Button>
      </>
    );
  }, [businessAddress, locationData, data.loading, loadingStates.submit, updateAddress]);

  const otpView = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-medium">Enter OTP</h1>
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-12 h-12 text-center border rounded"
            />
          ))}
        </div>
        <Button 
          onClick={handleOTPSubmit} 
          disabled={loadingStates.otp || data.Otp.length !== 6}
          className="w-full"
        >
          {loadingStates.otp ? "Verifying..." : "Verify OTP"}
        </Button>
        {showResend && (
          <Button onClick={SendOTP} disabled={data.loading}>
            Resend OTP
          </Button>
        )}
      </div>
    );
  }, [otp, showResend, data.loading, data.Otp, loadingStates.otp, SendOTP, handleChange, handleKeyDown, handleOTPSubmit]);

  const signUpView = useMemo(() => {
    const handlePhoneChange = (e) => {
      const value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        setData(prev => ({ ...prev, phone: value }));
      }
    };
    return (
      <>
        <h1 className="text-2xl font-medium">Sign In</h1>
        <div className="flex flex-col gap-4">
          <TextInput
            placeholder="Name"
            value={data.name}
            onChange={handleNameChange}
            color={data.name.length >= 3 ? 'gray' : 'failure'}
            helperText={data.name.length >= 3 ? '' : 'Name must be at least 3 characters'}
          />
          <TextInput
            placeholder="Phone (10 digits)"
            value={data.phone}
            onChange={handlePhoneChange}
            color={data.phone.length === 10 ? 'gray' : 'failure'}
            helperText={data.phone.length === 10 ? '' : 'Phone number must be 10 digits'}
          />
          <TextInput
            placeholder="Email"
            type="email"
            value={data.email}
            onChange={handleEmailChange}
            color={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'gray' : 'failure'}
            helperText={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '' : 'Please enter a valid email'}
          />
          <Select
            value={data.gender}
            onChange={handleGenderChange}
          >
            <option value="">Select Gender</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Other'>Other</option>
          </Select>
          <TextInput
            type="date"
            value={data.dob}
            onChange={handleDobChange}
          />
          <Select
            value={data.category}
            onChange={handleCategoryChange}
            color={data.category ? 'gray' : 'failure'}
            helperText={data.loading ? 'Loading categories...' : vendorCategories.length === 0 ? 'No categories found' : ''}
          >
            <option value="">Select Category</option>
            {Array.isArray(vendorCategories) && vendorCategories.length > 0 ? (
              vendorCategories.map((category) => {
                const displayName = category.title || category.name;
                const value = category._id;
                console.log(`Rendering category: ${displayName} (${value})`);
                return (
                  <option key={value} value={value}>
                    {displayName || 'Unnamed Category'}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>
                {data.loading ? 'Loading categories...' : 'No categories available'}
              </option>
            )}
          </Select>
          <Button
            onClick={() => {
              if (data.loading) return;
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                toast.error('Please enter a valid email address');
                return;
              }
              if (data.phone.length !== 10) {
                toast.error('Please enter a valid 10-digit phone number');
                return;
              }
              if (data.name.length < 3) {
                toast.error('Name must be at least 3 characters');
                return;
              }
              SendOTP();
            }}
            disabled={!data.phone || !data.email || !data.name || data.loading}
          >
            Sign In
          </Button>
          <div className="text-center mt-4">
            <span className="text-gray-600">Not a member? </span>
            <span className="text-rose-600 cursor-pointer hover:underline">Sign up</span>
          </div>
        </div>
      </>
    );
  }, [data, vendorCategories, SendOTP, handleNameChange, handleEmailChange, handleGenderChange, handleCategoryChange, handleDobChange]);

  return (
    <>
      <div className="bg-white text-black flex flex-col p-8 gap-6 h-screen w-screen overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
        {display === "SignUp" && signUpView}
        {display === "OTP" && otpView}
        {display === "Address" && addressView}
      </div>
    </>
  );
});

export default Signup;