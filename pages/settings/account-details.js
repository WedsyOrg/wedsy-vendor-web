import BackIcon from "@/components/icons/BackIcon";
import { toProperCase } from "@/utils/text";
import { Alert, Button, Label, Select, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";
import { toast } from "react-toastify";

export default function Settings({}) {
  const router = useRouter();
  const inputRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const googleInstanceRef = useRef(null);
  const [razorPaySetupCompleted, setRazorPayStatusCompleted] = useState(null);
  const [accountCreated, setAccountCreated] = useState(null);
  const [productCreated, setProductCreated] = useState(null);
  const [productStatus, setProductStatus] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [accountCreationData, setAccountCreationData] = useState({
    legal_business_name: "",
    business_type: "",
    category: "services",
    subcategory: "professional_services",
    addresses: {
      registered: {
        street1: "",
        street2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      },
    },
    pan: "",
    gst: "",
  });
  const [productDetails, setProductDetails] = useState(null);
  const [productData, setProductData] = useState({
    beneficiary_name: "",
    account_number: "",
    ifsc_code: "",
  });
  
  // Dropdown state management
  const [dropdowns, setDropdowns] = useState({
    business_type: false,
    business_category: false,
    state: false
  });

  const toggleDropdown = (dropdownName) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const selectOption = (field, value) => {
    if (field === 'business_type') {
      setAccountCreationData({
        ...accountCreationData,
        business_type: value
      });
    } else if (field === 'business_category') {
      setAccountCreationData({
        ...accountCreationData,
        subcategory: value
      });
    } else if (field === 'state') {
      setAccountCreationData({
        ...accountCreationData,
        addresses: {
          ...accountCreationData.addresses,
          registered: {
            ...accountCreationData.addresses.registered,
            state: value
          }
        }
      });
    }
    
    setDropdowns(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.select-field') && !event.target.closest('.dropdown-option')) {
        setDropdowns({
          business_type: false,
          business_category: false,
          state: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load Google Maps API
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const fetchUserProfile = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        }
        return response.json();
      })
      .then((response) => {
        if (response) {
          setUserProfile(response);
          // Autofill account name from profile if not already set
          if (response.businessName && !accountCreationData.legal_business_name) {
            setAccountCreationData(prev => ({
              ...prev,
              legal_business_name: response.businessName
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  const fetchAccount = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements?checkStatus=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response.message === "success") {
          setAccountCreated(response?.accountCreated);
          if (response?.accountCreated) {
            setAccountDetails(response?.accountDetails);
          }
          setProductCreated(response?.productCreated);
          setProductStatus(response?.razporPay_product_status);
          setProductDetails(response?.razporPay_product_info);
          setRazorPayStatusCompleted(response?.razorPay_setup_completed);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchAccountDetails = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=accountDetails`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setAccountDetails(response.accountDetails);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateAccountDetails = async () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        accountDetails,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchAccountDetails();
        if (response.message !== "success") {
          toast.error("Error updating account details.", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const createSettlementAccount = async () => {
    
    // Debug: Log the data being sent
    console.log("Sending account creation data:", accountCreationData);
    console.log("User profile data:", userProfile);
    
    // Format phone number for Razorpay (remove + prefix)
    const formattedPhone = userProfile?.phone?.replace('+', '') || userProfile?.phone || "919142365645";
    
    // Prepare data based on business type
    const businessType = accountCreationData.business_type || "proprietorship";
    
    const dataToSend = {
      legal_business_name: accountCreationData.legal_business_name,
      business_type: businessType,
      category: accountCreationData.category || "services",
      subcategory: accountCreationData.subcategory || "professional_services",
      addresses: {
        registered: {
          street1: accountCreationData.addresses?.registered?.street1,
          street2: accountCreationData.addresses?.registered?.street2 || "N/A",
          city: accountCreationData.addresses?.registered?.city,
          state: accountCreationData.addresses?.registered?.state,
          postal_code: accountCreationData.addresses?.registered?.postal_code,
          country: accountCreationData.addresses?.registered?.country || "India"
        }
      }
    };

    // Add PAN and GST based on business type
    if (businessType === "proprietorship" || businessType === "not_yet_registered") {
      // For proprietorship, we don't send company PAN
      if (accountCreationData.pan) {
        dataToSend.pan = accountCreationData.pan;
      }
      if (accountCreationData.gst) {
        dataToSend.gst = accountCreationData.gst;
      }
    } else {
      // For other business types, send PAN and GST
      dataToSend.pan = accountCreationData.pan;
      dataToSend.gst = accountCreationData.gst;
    }
    
    console.log("Processed data to send:", dataToSend);
    console.log("Phone number formatting:");
    console.log("- Original phone:", userProfile?.phone);
    console.log("- Formatted phone:", formattedPhone);
    console.log("Data validation:");
    console.log("- Legal business name:", dataToSend.legal_business_name);
    console.log("- Business type:", dataToSend.business_type);
    console.log("- Category:", dataToSend.category);
    console.log("- Subcategory:", dataToSend.subcategory);
    console.log("- PAN:", dataToSend.pan, "Length:", dataToSend.pan?.length);
    console.log("- GST:", dataToSend.gst, "Length:", dataToSend.gst?.length);
    console.log("- Address:", dataToSend.addresses);
    
    // Check authentication token
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in again", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      router.push("/login");
      return;
    }
    
    // Validate required fields
    if (!dataToSend.legal_business_name || !dataToSend.business_type || !dataToSend.category || !dataToSend.subcategory) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    if (!dataToSend.addresses.registered.street1 || !dataToSend.addresses.registered.city || 
        !dataToSend.addresses.registered.state || !dataToSend.addresses.registered.postal_code) {
      toast.error("Please fill in all address fields", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Validate GST format if provided
    if (dataToSend.gst && dataToSend.gst.length !== 15) {
      toast.error(`GST number must be 15 characters long. Current length: ${dataToSend.gst.length}. Please enter a valid GST number or leave it empty.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Validate PAN format if provided
    if (dataToSend.pan && dataToSend.pan.length !== 10) {
      toast.error("PAN number must be 10 characters long", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Add formatted phone number to the data
    dataToSend.phone = formattedPhone;
    
    // Show loading toast
    toast.info("Creating your settlement account...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error("Server error response:", errorData);
            console.error("Full error details:", JSON.stringify(errorData, null, 2));
            
            // Check if it's a Razorpay API error
            if (errorData.error && errorData.error.response) {
              console.error("Razorpay API error:", errorData.error.response.data);
              toast.error(`Razorpay API Error: ${JSON.stringify(errorData.error.response.data)}`, {
                position: "top-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } else {
              toast.error(`Error: ${errorData.message || 'Unknown error occurred'}`, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
            
            throw new Error(`Server error: ${response.status} - ${JSON.stringify(errorData)}`);
          });
        }
        return response.json();
      })
      .then((response) => {
        console.log("Success response:", response);
        if (response.message === "success") {
          toast.success("Account created successfully! Proceeding to bank details...", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/product`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.message === "success") {
                fetchAccount();
              } else {
                toast.error("Error updating account details.", {
                  position: "top-right",
                  autoClose: 4000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }
            })
            .catch((error) => {
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            });
        } else {
          toast.error("Error updating account details.", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateSettlementAccount = async () => {
    
    // Show loading toast
    toast.info("Updating bank details...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/product`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(productData),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message === "success") {
          toast.success("Bank details updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          fetchAccount();
        } else {
          toast.error("Error updating account details.", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    // fetchAccountDetails();
    fetchAccount();
    fetchUserProfile();
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        await loadGoogleMaps();
        
        if (autocompleteInputRef.current && !googleInstanceRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
            componentRestrictions: { country: 'in' }, // Restrict to India
            fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
          });

          googleInstanceRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.address_components) {
              let street1 = '';
              let street2 = '';
              let city = '';
              let state = '';
              let postalCode = '';
              let country = 'India';

              // Parse address components
              place.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('street_number') || types.includes('route')) {
                  if (street1) {
                    street1 += ' ' + component.long_name;
                  } else {
                    street1 = component.long_name;
                  }
                }
                
                if (types.includes('locality')) {
                  city = component.long_name;
                }
                
                if (types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                }
                
                if (types.includes('postal_code')) {
                  postalCode = component.long_name;
                }
              });

              // Update the form data
              setAccountCreationData(prev => ({
                ...prev,
                addresses: {
                  ...prev.addresses,
                  registered: {
                    ...prev.addresses.registered,
                    street1: street1,
                    city: city,
                    state: state,
                    postal_code: postalCode,
                    country: country
                  }
                }
              }));

              // Update the search input with formatted address
              if (autocompleteInputRef.current) {
                autocompleteInputRef.current.value = place.formatted_address;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeAutocomplete();
  }, []);
  return (
    <>
      <style jsx>{`
        .select-field {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 12px 16px;
          padding-right: 40px;
          font-size: 16px;
          color: #374151;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .select-field:focus {
          outline: none !important;
          border-color: #2B3F6C !important;
          box-shadow: none !important;
        }
        .select-field:hover {
          border-color: #2B3F6C;
        }
        .dropdown-option {
          padding: 12px 16px;
          cursor: pointer;
          color: #374151;
          transition: background-color 0.2s;
        }
        .dropdown-option:hover {
          background-color: #F3F4F6;
        }
        .dropdown-option.selected {
          background-color: #FEF2F2;
          color: #2B3F6C;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex flex-row gap-3 items-center">
              <BackIcon />
              <h1 className="text-2xl font-bold text-gray-900">Account Details</h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 py-8">
        {accountCreated && productCreated && razorPaySetupCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Account Setup Complete!</h3>
                <p className="text-sm text-green-700 mt-1">Your business account is fully configured and ready to use.</p>
              </div>
            </div>
          </div>
        )}
        
        {!accountCreated && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Business Information</h2>
              <p className="text-sm text-gray-600">Enter your business details to set up your account</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label value="Account Name" className="text-sm font-medium text-gray-700" />
                <TextInput
                  placeholder="Enter your business name"
                  disabled={false}
                  value={accountCreationData?.legal_business_name}
                  onChange={(e) => {
                    setAccountCreationData({
                      ...accountCreationData,
                      legal_business_name: e.target.value,
                    });
                  }}
                  className="w-full"
                  style={{ color: '#2B3F6C' }}
                />
                {userProfile?.businessName && (
                  <p className="text-xs text-blue-600">
                    ✓ Autofilled from your profile
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label value="Business Type" className="text-sm font-medium text-gray-700" />
                <div className="relative">
                  <div
                    className="select-field"
                    onClick={() => toggleDropdown('business_type')}
                  >
                    {accountCreationData?.business_type ? 
                      accountCreationData.business_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
                      'Select Business Type'
                    }
                    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
                    </svg>
                  </div>
                  {dropdowns.business_type && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div
                        className={`dropdown-option ${accountCreationData?.business_type === 'partnership' ? 'selected' : ''}`}
                        onClick={() => selectOption('business_type', 'partnership')}
                      >
                        Partnership
                      </div>
                      <div
                        className={`dropdown-option ${accountCreationData?.business_type === 'proprietorship' ? 'selected' : ''}`}
                        onClick={() => selectOption('business_type', 'proprietorship')}
                      >
                        Proprietorship
                      </div>
                      <div
                        className={`dropdown-option ${accountCreationData?.business_type === 'private_limited' ? 'selected' : ''}`}
                        onClick={() => selectOption('business_type', 'private_limited')}
                      >
                        Private Limited
                      </div>
                      <div
                        className={`dropdown-option ${accountCreationData?.business_type === 'not_yet_registered' ? 'selected' : ''}`}
                        onClick={() => selectOption('business_type', 'not_yet_registered')}
                      >
                        Not Yet Registered
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {(accountCreationData?.business_type === "partnership" || 
              accountCreationData?.business_type === "private_limited") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label value="Business PAN" className="text-sm font-medium text-gray-700" />
                  <TextInput
                    placeholder="Enter your PAN number"
                    disabled={false}
                    value={accountCreationData?.pan}
                    onChange={(e) => {
                      setAccountCreationData({
                        ...accountCreationData,
                        pan: e.target.value,
                      });
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label value="GST Number" className="text-sm font-medium text-gray-700" />
                  <TextInput
                    placeholder="Enter your GST number"
                    disabled={false}
                    value={accountCreationData?.gst}
                    onChange={(e) => {
                      setAccountCreationData({
                        ...accountCreationData,
                        gst: e.target.value,
                      });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label value="Search Address" className="text-sm font-medium text-gray-700" />
                  <TextInput
                    placeholder="Start typing your address..."
                    disabled={false}
                    ref={autocompleteInputRef}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Use the search above to auto-fill address details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label value="Street 1" className="text-sm font-medium text-gray-700" />
                    <TextInput
                      placeholder="Street address line 1"
                      value={accountCreationData?.addresses?.registered?.street1}
                      onChange={(e) => {
                        setAccountCreationData({
                          ...accountCreationData,
                          addresses: {
                            ...accountCreationData.addresses,
                            registered: {
                              ...accountCreationData?.addresses?.registered,
                              street1: e.target.value,
                            },
                          },
                        });
                      }}
                      disabled={false}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label value="Street 2" className="text-sm font-medium text-gray-700" />
                    <TextInput
                      placeholder="Street address line 2 (optional)"
                      value={accountCreationData?.addresses?.registered?.street2}
                      onChange={(e) => {
                        setAccountCreationData({
                          ...accountCreationData,
                          addresses: {
                            ...accountCreationData.addresses,
                            registered: {
                              ...accountCreationData?.addresses?.registered,
                              street2: e.target.value,
                            },
                          },
                        });
                      }}
                      disabled={false}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label value="City" className="text-sm font-medium text-gray-700" />
                    <TextInput
                      placeholder="City"
                      value={accountCreationData?.addresses?.registered?.city}
                      onChange={(e) => {
                        setAccountCreationData({
                          ...accountCreationData,
                          addresses: {
                            ...accountCreationData.addresses,
                            registered: {
                              ...accountCreationData?.addresses?.registered,
                              city: e.target.value,
                            },
                          },
                        });
                      }}
                      disabled={false}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label value="State" className="text-sm font-medium text-gray-700" />
                    <TextInput
                      placeholder="State"
                      value={accountCreationData?.addresses?.registered?.state}
                      onChange={(e) => {
                        setAccountCreationData({
                          ...accountCreationData,
                          addresses: {
                            ...accountCreationData.addresses,
                            registered: {
                              ...accountCreationData?.addresses?.registered,
                              state: e.target.value,
                            },
                          },
                        });
                      }}
                      disabled={false}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label value="Postal Code" className="text-sm font-medium text-gray-700" />
                    <TextInput
                      placeholder="Postal Code"
                      value={accountCreationData?.addresses?.registered?.postal_code}
                      onChange={(e) => {
                        setAccountCreationData({
                          ...accountCreationData,
                          addresses: {
                            ...accountCreationData.addresses,
                            registered: {
                              ...accountCreationData?.addresses?.registered,
                              postal_code: e.target.value,
                            },
                          },
                        });
                      }}
                      disabled={false}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label value="Country" className="text-sm font-medium text-gray-700" />
              <TextInput
                placeholder="Country"
                readOnly={true}
                value={accountCreationData?.addresses?.registered?.country || "India"}
                disabled={false}
                className="w-full bg-gray-50"
              />
            </div>
            
            <div className="flex justify-center mt-8">
              <Button
                className="px-6 py-2 bg-[#2B3F6C] hover:bg-[#1e2d4a] text-white font-semibold rounded-full transition-colors"
                disabled={
                  !accountCreationData?.legal_business_name ||
                  !accountCreationData?.business_type ||
                  !accountCreationData?.category ||
                  !accountCreationData?.subcategory ||
                  // Only require PAN and GST for business types that need them
                  (accountCreationData?.business_type === "partnership" || 
                   accountCreationData?.business_type === "private_limited"
                    ? (!accountCreationData?.gst || !accountCreationData?.pan)
                    : false) ||
                  !accountCreationData?.addresses?.registered?.postal_code ||
                  !accountCreationData?.addresses?.registered?.state ||
                  !accountCreationData?.addresses?.registered?.street1 ||
                  !accountCreationData?.addresses?.registered?.city
                }
                onClick={createSettlementAccount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {accountCreated && productCreated && !razorPaySetupCompleted && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Bank Account Details</h2>
              <p className="text-sm text-gray-600">Enter your bank account information for payments</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label value="Account Name" className="text-sm font-medium text-gray-700" />
                <TextInput
                  placeholder="Enter account holder name"
                  disabled={false}
                  value={productData?.beneficiary_name || userProfile?.businessName || ""}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      beneficiary_name: e.target.value,
                    });
                  }}
                  className="w-full"
                  style={{ color: '#2B3F6C' }}
                />
                {userProfile?.businessName && (
                  <p className="text-xs text-blue-600">
                    ✓ Autofilled from your profile
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label value="Account Number" className="text-sm font-medium text-gray-700" />
                <TextInput
                  placeholder="Enter your account number"
                  disabled={false}
                  value={productData?.account_number}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      account_number: e.target.value,
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="space-y-2">
                <Label value="IFSC Code" className="text-sm font-medium text-gray-700" />
                <TextInput
                  placeholder="Enter your bank's IFSC code"
                  disabled={false}
                  value={productData?.ifsc_code}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      ifsc_code: e.target.value,
                    });
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">You can find your IFSC code on your bank statement or passbook</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button
                className="px-8 py-3 bg-[#2B3F6C] hover:bg-[#1e2d4a] text-white font-semibold rounded-lg transition-colors"
                disabled={
                  !productData?.beneficiary_name ||
                  !productData?.account_number ||
                  !productData?.ifsc_code
                }
                onClick={updateSettlementAccount}
              >
                Update Bank Details
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
