import BackIcon from "@/components/icons/BackIcon";
import { loadGoogleMaps } from "@/utils/loadGoogleMaps";
import { toProperCase } from "@/utils/text";
import { Alert, Button, Label, Select, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";

export default function Settings({}) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [googleInstance, setGoogleInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorPaySetupCompleted, setRazorPayStatusCompleted] = useState(null);
  const [accountCreated, setAccountCreated] = useState(null);
  const [productCreated, setProductCreated] = useState(null);
  const [productStatus, setProductStatus] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [accountCreationData, setAccountCreationData] = useState({
    legal_business_name: "",
    business_type: "",
    category: "services",
    subcategory: "",
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
  const fetchAccount = () => {
    setLoading(true);
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
          setLoading(false);
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
    setLoading(true);
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
          setLoading(false);
          setAccountDetails(response.accountDetails);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateAccountDetails = async () => {
    setLoading(true);
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
        setLoading(false);
        if (response.message !== "success") {
          alert("Error updating account details.");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const createSettlementAccount = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...accountCreationData,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message === "success") {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/product`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((response) => response.json())
            .then((response) => {
              setLoading(false);
              if (response.message === "success") {
                fetchAccount();
              } else {
                alert("Error updating account details.");
              }
            })
            .catch((error) => {
              setLoading(false);
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            });
        } else {
          alert("Error updating account details.");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateSettlementAccount = async () => {
    setLoading(true);
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
        setLoading(false);
        if (response.message === "success") {
          fetchAccount();
        } else {
          alert("Error updating account details.");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const extractAddressComponents = (components) => {
    const result = {
      street1: "", // Primary street address
      street2: "", // Secondary street address (e.g., apartment, suite)
      city: "", // City or locality
      state: "", // State or administrative area
      postal_code: "", // Postal or ZIP code
      country: "", // Country
    };

    components.forEach((component) => {
      if (component.types.includes("street_number")) {
        result.street1 = component.long_name; // Add street number
      }
      if (component.types.includes("route")) {
        result.street1 += result.street1
          ? ` ${component.long_name}`
          : component.long_name; // Combine with street name
      }
      if (component.types.includes("subpremise")) {
        result.street2 = component.long_name; // Secondary address info
      }
      if (component.types.includes("locality")) {
        result.city = component.long_name; // City or locality
      }
      if (
        component.types.includes("administrative_area_level_2") &&
        !result.city
      ) {
        result.city = component.long_name; // Fallback if locality isn't available
      }
      if (component.types.includes("postal_code")) {
        result.postal_code = component.long_name; // Postal or ZIP code
      }
      if (component.types.includes("administrative_area_level_1")) {
        result.state = component.long_name; // State or province
      }
      if (component.types.includes("country")) {
        result.country = component.short_name; // Country (short name like IN for India)
      }
    });

    return result;
  };
  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        let google = null;
        if (!isLoaded) {
          google = await loadGoogleMaps(); // Load Google Maps API
          setGoogleInstance(google);
          setIsLoaded(true);
        } else {
          google = googleInstance;
        }
        if (!google?.maps) {
          throw new Error("Google Maps library is not loaded properly.");
        }
        // Check if inputRef.current exists before initializing Autocomplete
        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["geocode"], // Restrict results to addresses only
            }
          );
          // Listen for place selection
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              const { street1, street2, city, state, postal_code, country } =
                extractAddressComponents(place.address_components);
              setAccountCreationData((prev) => ({
                ...prev,
                addresses: {
                  ...prev?.addresses,
                  registered: {
                    ...prev?.addresses?.registered,
                    street1,
                    street2,
                    city,
                    state,
                    postal_code,
                    country,
                  },
                },
              }));
            }
          });
        } else {
          console.warn("Input reference is not available yet.");
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };
    if (accountCreated === false) {
      initializeAutocomplete();
    }
  }, [accountCreated]);
  useEffect(() => {
    // fetchAccountDetails();
    fetchAccount();
  }, []);
  return (
    <>
      <div className="flex flex-col gap-4 py-4 px-8 pt-8">
        <div className="flex flex-row gap-3 items-center mb-4">
          <BackIcon />
          <p className="text-lg font-medium">Account Details</p>
        </div>
        {accountCreated && productCreated && razorPaySetupCompleted && (
          <Alert color="success">
            <span className="font-medium block">Account Setup Complete!</span>
          </Alert>
        )}
        {!accountCreated && (
          <>
            <div>
              <Label value="Account Name" />
              <TextInput
                placeholder="Account Name"
                disabled={loading}
                value={accountCreationData?.legal_business_name}
                onChange={(e) => {
                  setAccountCreationData({
                    ...accountCreationData,
                    legal_business_name: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <Label value="Business Type" />
              <Select
                placeholder="Business Type"
                disabled={loading}
                value={accountCreationData?.business_type}
                onChange={(e) => {
                  setAccountCreationData({
                    ...accountCreationData,
                    business_type: e.target.value,
                  });
                }}
              >
                <option value={""}>Select Business Type</option>
                <option value={"partnership"}>Partnership</option>
                <option value={"proprietorship"}>Proprietorship</option>
                <option value={"private_limited"}>Private Limited</option>
                <option value={"not_yet_registered"}>Not Yet Registered</option>
              </Select>
            </div>
            <div>
              <Label value="Business Category" />
              <Select
                placeholder="Business Category"
                disabled={loading}
                value={accountCreationData?.subcategory}
                onChange={(e) => {
                  setAccountCreationData({
                    ...accountCreationData,
                    subcategory: e.target.value,
                  });
                }}
              >
                <option value={""}>Select Business Category</option>
                {["professional_services", "photographic_studio"]?.map(
                  (item) => (
                    <option value={item} key={item}>
                      {toProperCase(item?.replaceAll("_", " "))}
                    </option>
                  )
                )}
              </Select>
            </div>
            {accountCreationData?.business_type !== "not_yet_registered" && (
              <>
                <div>
                  <Label value="Business PAN" />
                  <TextInput
                    placeholder="Business PAN"
                    disabled={loading}
                    value={accountCreationData?.pan}
                    onChange={(e) => {
                      setAccountCreationData({
                        ...accountCreationData,
                        pan: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label value="GST" />
                  <TextInput
                    placeholder="GST"
                    disabled={loading}
                    value={accountCreationData?.gst}
                    onChange={(e) => {
                      setAccountCreationData({
                        ...accountCreationData,
                        gst: e.target.value,
                      });
                    }}
                  />
                </div>
              </>
            )}
            <div>
              <Label value="Registered Address" />
              <TextInput
                placeholder="Registered Address"
                disabled={loading}
                ref={inputRef}
              />
            </div>
            <div className="">
              <Label value="Street 1" />
              <TextInput
                placeholder="Street 1"
                // readOnly={true}
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
                disabled={loading}
              />
            </div>
            <div className="">
              <Label value="Street 2" />
              <TextInput
                placeholder="Street 2"
                // readOnly={true}
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
                disabled={loading}
              />
            </div>
            <div className="">
              <Label value="City" />
              <TextInput
                placeholder="City"
                // readOnly={true}
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
                disabled={loading}
              />
            </div>
            <div className="">
              <Label value="State" />
              <TextInput
                placeholder="State"
                // readOnly={true}
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
                disabled={loading}
              />
            </div>
            <div className="">
              <Label value="Postal Code" />
              <TextInput
                placeholder="Postal Code"
                // readOnly={true}
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
                disabled={loading}
              />
            </div>
            <div className="">
              <Label value="Country" />
              <TextInput
                placeholder="Country"
                readOnly={true}
                value={accountCreationData?.addresses?.registered?.country}
                disabled={loading}
              />
            </div>
            <Button
              className="text-white bg-rose-900 enabled:hover:bg-900 max-w-max mx-auto"
              disabled={
                loading ||
                !accountCreationData?.legal_business_name ||
                !accountCreationData?.business_type ||
                !accountCreationData?.category ||
                !accountCreationData?.subcategory ||
                (accountCreationData?.business_type !== "not_yet_registered" &&
                accountCreationData?.business_type !== "proprietorship"
                  ? !accountCreationData?.gst || !accountCreationData?.pan
                  : false) ||
                !accountCreationData?.addresses?.registered?.postal_code ||
                !accountCreationData?.addresses?.registered?.state ||
                !accountCreationData?.addresses?.registered?.street1 ||
                !accountCreationData?.addresses?.registered?.street2 ||
                !accountCreationData?.addresses?.registered?.city ||
                !accountCreationData?.addresses?.registered?.country
              }
              onClick={createSettlementAccount}
            >
              Next
            </Button>
          </>
        )}
        {accountCreated && productCreated && !razorPaySetupCompleted && (
          <>
            <>
              <div>
                <Label value="Account Name" />
                <TextInput
                  placeholder="Account Name"
                  className="border border-rose-900 rounded-lg"
                  disabled={loading}
                  value={productData?.beneficiary_name}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      beneficiary_name: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label value="Account Number" />
                <TextInput
                  placeholder="Account Number"
                  className="border border-rose-900 rounded-lg"
                  disabled={loading}
                  value={productData?.account_number}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      account_number: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label value="IFSC Code" />
                <TextInput
                  placeholder="IFSC Code"
                  className="border border-rose-900 rounded-lg"
                  disabled={loading}
                  value={productData?.ifsc_code}
                  onChange={(e) => {
                    setProductData({
                      ...productData,
                      ifsc_code: e.target.value,
                    });
                  }}
                />
              </div>
              <Button
                className="text-white bg-rose-900 enabled:hover:bg-900 max-w-max mx-auto"
                disabled={
                  loading ||
                  !productData?.beneficiary_name ||
                  !productData?.account_number ||
                  !productData?.ifsc_code
                }
                onClick={updateSettlementAccount}
              >
                Update
              </Button>
            </>
          </>
        )}
      </div>
    </>
  );
}
