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
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";

export default function Signup({}) {
  const inputRefs = useRef([]);
  const router = useRouter();
  const [display, setDisplay] = useState("SignUp");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
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
  const updateAddress = async (tag) => {
    setLoading(true);
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
          setLoading(false);
          router.push("/");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleChange = (element, index) => {
    if (/[^0-9]/.test(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const SendOTP = () => {
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
  };
  const handleSubmit = () => {
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
        alert(error.response.message);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchLocationData = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/location`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false);
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
  const fetchVendorCategories = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false);
        setVendorCategories(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    fetchVendorCategories();
    fetchLocationData();
  }, []);
  useEffect(() => {
    setData({ ...data, Otp: otp.join("") });
  }, [otp]);
  return (
    <>
      <div className="bg-white text-black flex flex-col p-8 gap-6 h-screen w-screen overflow-scroll">
        {display === "SignUp" && (
          <>
            <h1 className="mt-8 mb-4 text-2xl font-medium uppercase text-center">
              Vendor Sign up
            </h1>
            <div>
              <TextInput
                placeholder="Contact Name"
                type="text"
                value={data.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    name: e.target.value,
                  })
                }
                name="Contact Name"
              />
              <Label
                value="This should be your name and not Business Name"
                className="text-sm text-gray-500"
              />
            </div>
            <TextInput
              placeholder="Mobile No."
              type="text"
              value={data.phone}
              onChange={(e) =>
                setData({
                  ...data,
                  phone: e.target.value,
                })
              }
              name="Mobile No."
            />
            <TextInput
              placeholder="Email-Id"
              type="text"
              value={data.email}
              onChange={(e) =>
                setData({
                  ...data,
                  email: e.target.value,
                })
              }
              name="Email-Id"
            />
            <div>
              <Label value="Date of Birth" />
              <TextInput
                placeholder="Date of Birth"
                type="date"
                value={data.dob}
                onChange={(e) =>
                  setData({
                    ...data,
                    dob: e.target.value,
                  })
                }
                name="Date of Birth"
              />
            </div>
            <Select
              value={data.gender}
              onChange={(e) =>
                setData({
                  ...data,
                  gender: e.target.value,
                })
              }
            >
              <option value={""}>Select Gender</option>
              <option value={"Male"}>Male</option>
              <option value={"Female"}>Female</option>
              <option value={"Other"}>Other</option>
            </Select>
            <Select
              value={data.category}
              onChange={(e) =>
                setData({
                  ...data,
                  category: e.target.value,
                })
              }
            >
              <option value="">Select Category</option>
              {vendorCategories.map((item, index) => (
                <option value={item.title} key={index}>
                  {item.title}
                </option>
              ))}
            </Select>
            {data?.category === "Makeup and Hair styling" && (
              <div className="flex flex-col gap-2">
                <Label value="Services you offer" />
                <Label
                  htmlFor="service-makeup"
                  className="flex flex-row justify-between items-center px-2.5 py-2 rounded-lg border border-black"
                >
                  <p>Makeup</p>{" "}
                  <Checkbox
                    id="service-makeup"
                    name="service-makeup"
                    checked={
                      data.servicesOffered.includes("MUA") &&
                      !data.servicesOffered.includes("Hairstylist")
                    }
                    onChange={(e) =>
                      setData({
                        ...data,
                        servicesOffered: e.target.checked
                          ? ["MUA"]
                          : data.servicesOffered.filter((i) => i !== "MUA"),
                      })
                    }
                  />
                </Label>
                <Label
                  htmlFor="service-hairstyling"
                  className="flex flex-row justify-between items-center px-2.5 py-2 rounded-lg border border-black"
                >
                  <p>Hairstyling</p>
                  <Checkbox
                    id="service-hairstyling"
                    name="service-hairstyling"
                    checked={
                      data.servicesOffered.includes("Hairstylist") &&
                      !data.servicesOffered.includes("MUA")
                    }
                    onChange={(e) =>
                      setData({
                        ...data,
                        servicesOffered: e.target.checked
                          ? ["Hairstylist"]
                          : data.servicesOffered.filter(
                              (i) => i !== "Hairstylist"
                            ),
                      })
                    }
                  />
                </Label>
                <Label
                  htmlFor="service-both"
                  className="flex flex-row justify-between items-center px-2.5 py-2 rounded-lg border border-black"
                >
                  <p>Both</p>
                  <Checkbox
                    id="service-both"
                    name="service-both"
                    checked={
                      data.servicesOffered.includes("Hairstylist") &&
                      data.servicesOffered.includes("MUA")
                    }
                    onChange={(e) =>
                      setData({
                        ...data,
                        servicesOffered: e.target.checked
                          ? ["Hairstylist", "MUA"]
                          : data.servicesOffered.filter(
                              (i) => i !== "Hairstylist" && i !== "MUA"
                            ),
                      })
                    }
                  />
                </Label>
              </div>
            )}
            <Button
              className="text-white bg-rose-900 enabled:hover:bg-900 self-center rounded-full"
              disabled={
                !data.phone ||
                !data.email ||
                !data.name ||
                !processMobileNumber(data.phone)
              }
              onClick={() => {
                SendOTP();
              }}
            >
              SIGN UP
            </Button>
          </>
        )}
        {display === "OTP" && (
          <>
            <h1 className="mt-8 mb-4 text-2xl font-medium uppercase text-center">
              Vendor Sign up
            </h1>
            <div className="flex flex-col gap-2">
              <Label value="Verify with otp" />
              <div className="flex justify-between">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 text-lg text-center border border-gray-900 rounded-lg"
                  />
                ))}
              </div>
              <Label>
                <p>Otp is sent on this mobile number</p>
                <p>{processMobileNumber(data.phone)}</p>

                <p
                  className="underline flex items-center"
                  onClick={() => {
                    setOtp(new Array(6).fill(""));
                    setDisplay("SignUp");
                  }}
                >
                  Edit mobile no?
                  <MdEdit className="ml-1" />
                  {showResend && (
                    <p
                      className="ml-auto underline flex items-center"
                      onClick={() => {
                        setOtp(new Array(6).fill(""));
                        setShowResend(false);
                        SendOTP();
                      }}
                    >
                      Resend OTP
                    </p>
                  )}
                </p>
              </Label>
            </div>
            <Button
              className="text-white bg-rose-900 enabled:hover:bg-900 self-center rounded-full"
              disabled={loading || data.Otp.length !== 6}
              onClick={() => {
                handleSubmit();
              }}
            >
              Next
            </Button>
          </>
        )}
        {display === "Address" && (
          <>
            <h1 className="mt-8 mb-4 text-2xl font-medium">Business Address</h1>
            <Alert color="info">
              <span className="font-medium">Note: </span>We are currently
              operational in Bangalore, will get to other cities soon 🙂
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
        )}
      </div>
    </>
  );
}
