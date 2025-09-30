import { processMobileNumber } from "@/utils/phoneNumber";
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
    setLoadingStates(prev => ({ ...prev, submit: true }));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        businessAddress: {
          state: businessAddress.state,
          city: businessAddress.city,
          area: businessAddress.area,
          pincode: businessAddress.pincode,
          address: businessAddress.address,
          googleMaps: businessAddress.googleMaps,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message === "success") {
          setLoadingStates(prev => ({ ...prev, submit: false }));
          router.push("/");
        }
      })
      .catch((error) => {
        setLoadingStates(prev => ({ ...prev, submit: false }));
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [businessAddress, router]);

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
    setLoadingStates(prev => ({ ...prev, otp: true }));
    setData({
      ...data,
      loading: true,
    });
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setData({
          ...data,
          loading: false,
          otpSent: true,
          ReferenceId: response.ReferenceId,
        });
        setDisplay("OTP");
        setTimeout(() => {
          setShowResend(true);
        }, 60000);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [data]);
  const handleSubmit = useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
        email: data.email,
        Otp: data.Otp,
        ReferenceId: data.ReferenceId,
        name: data.name,
        category: data.category,
        gender: data.gender,
        dob: data.dob,
        servicesOffered: data.servicesOffered,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message === "success" && response.token) {
          setData({
            ...data,
            loading: false,
            success: true,
            otpSent: false,
            Otp: "",
            ReferenceId: "",
            message: "",
          });
          localStorage.setItem("token", response.token);
          setDisplay("Address");
        } else {
          alert(response.message);
        }
      })
      .catch((error) => {
        setData(prev => ({ ...prev, loading: false }));
        const errorMessage = error.response?.message || error.message || 'An error occurred';
        alert(errorMessage);
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [data]);
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
              city: "",
              area: "",
            });
          }}
          disabled={data.loading}
        >
          <option value={""}>Select State</option>
          {locationData.map((item, index) => (
            <option value={item.title} key={index}>
              {item.title}
            </option>
          ))}
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
          {locationData
            ?.find((i) => i.title === businessAddress.state)
            ?.cities?.map((item, index) => (
              <option value={item.title} key={index}>
                {item.title}
              </option>
            ))}
        </Select>
        <Select
          value={businessAddress.area}
          onChange={(e) => {
            setBusinessAddress({
              ...businessAddress,
              area: e.target.value,
            });
          }}
          disabled={data.loading}
        >
          <option value={""}>Select Area</option>
          {locationData
            ?.find((i) => i.title === businessAddress.state)
            ?.cities?.find((i) => i.title === businessAddress.city)
            ?.areas?.map((item, index) => (
              <option value={item.title} key={index}>
                {item.title}
              </option>
            ))}
        </Select>
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
            !businessAddress.googleMaps ||
            !businessAddress.pincode
          }
          onClick={() => {
            updateAddress();
          }}
        >
          Submit
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
        {showResend && (
          <Button onClick={SendOTP} disabled={data.loading}>
            Resend OTP
          </Button>
        )}
      </div>
    );
  }, [otp, showResend, data.loading, SendOTP, handleChange, handleKeyDown]);

  const signUpView = useMemo(() => {
    const handlePhoneChange = (e) => {
      const value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        setData(prev => ({ ...prev, phone: value }));
      }
    };
    return (
      <>
        <h1 className="text-2xl font-medium">Sign Up</h1>
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
                alert('Please enter a valid email address');
                return;
              }
              if (data.phone.length !== 10) {
                alert('Please enter a valid 10-digit phone number');
                return;
              }
              if (data.name.length < 3) {
                alert('Name must be at least 3 characters');
                return;
              }
              SendOTP();
            }}
            disabled={!data.phone || !data.email || !data.name || data.loading}
          >
            Send OTP
          </Button>
        </div>
      </>
    );
  }, [data, vendorCategories, SendOTP, handleNameChange, handleEmailChange, handleGenderChange, handleCategoryChange, handleDobChange]);

  return (
    <>
      <div className="bg-white text-black flex flex-col p-8 gap-6 h-screen w-screen overflow-scroll">
        {display === "SignUp" && signUpView}
        {display === "OTP" && otpView}
        {display === "Address" && addressView}
      </div>
    </>
  );
});

export default Signup;