import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdCheck,
  MdClear,
  MdOutlineLocationOn,
  MdPersonOutline,
  MdSearch,
} from "react-icons/md";
import { useRouter } from "next/router";
import { Avatar, Button, TextInput } from "flowbite-react";
import { toPriceString } from "@/utils/text";

export default function Home({}) {
  const [display, setDisplay] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [selectedSource, setSelectedSource] = useState("Wedsy");
  const router = useRouter();


  const fetchWedsyPackageBooking = async () => {
    setLoading(true);
    const source = selectedSource === "Wedsy" ? "Wedsy-Package" : "Vendor-Package";
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/order?source=${source}`;
    
    console.log("Fetching packages for source:", source);
    
    fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        console.log("API Response Status:", response.status);
        console.log("API Response Headers:", response.headers);
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized - redirecting to login");
            router.push("/login");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log("API Response Data:", response);
        console.log("Response type:", typeof response);
        console.log("Is array:", Array.isArray(response));
        console.log("Response length:", response?.length);
        
        if (response) {
          setLoading(false);
          setList(Array.isArray(response) ? response : []);
        } else {
          setLoading(false);
          setList([]);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
        setList([]);
      });
  };
  const AcceptWedsyPackageBooking = (_id) => {
    setLoading(true);
    console.log("Accepting package booking with ID:", _id);
    const acceptUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/accept-wedsy-package-booking`;
    console.log("Accept URL:", acceptUrl);
    
    fetch(acceptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        console.log("Accept Response Status:", response.status);
        if (!response.ok) {
          console.log("Accept failed - redirecting to login");
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log("Accept Response Data:", response);
        if (response) {
          setLoading(false);
          fetchWedsyPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the accept operation:", error);
        setLoading(false);
      });
  };
  const RejectWedsyPackageBooking = (_id) => {
    setLoading(true);
    console.log("Rejecting package booking with ID:", _id);
    const rejectUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/reject-wedsy-package-booking`;
    console.log("Reject URL:", rejectUrl);
    
    fetch(rejectUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        console.log("Reject Response Status:", response.status);
        if (!response.ok) {
          console.log("Reject failed - redirecting to login");
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log("Reject Response Data:", response);
        if (response) {
          setLoading(false);
          fetchWedsyPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the reject operation:", error);
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchWedsyPackageBooking();
  }, [selectedSource]);

  useEffect(() => {
    fetchWedsyPackageBooking();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Packages
        </p>
      </div>
      
      {/* Wedsy and Vendor Tabs - Rounded Pills */}
      <div className="flex flex-row items-center gap-4 mb-4 px-6 pt-2">
        <div
          className={`font-semibold text-sm py-3 px-6 text-center flex-grow rounded-full relative shadow-md transition-all duration-200 whitespace-nowrap ${
            selectedSource === "Wedsy" 
              ? "text-white bg-custom-dark-blue shadow-lg" 
              : "text-custom-dark-blue bg-white border border-custom-dark-blue shadow-sm hover:shadow-md"
          }`}
          onClick={() => {
            setSelectedSource("Wedsy");
          }}
        >
          Wedsy Package
        </div>
        <div
          className={`font-semibold text-sm py-3 px-6 text-center flex-grow rounded-full relative shadow-md transition-all duration-200 whitespace-nowrap ${
            selectedSource === "Vendor" 
              ? "text-white bg-custom-dark-blue shadow-lg" 
              : "text-custom-dark-blue bg-white border border-custom-dark-blue shadow-sm hover:shadow-md"
          }`}
          onClick={() => {
            setSelectedSource("Vendor");
          }}
        >
          Vendor Package
        </div>
      </div>
      
      
      {/* Pending and Accepted Tabs - Rectangular Full Width */}
      <div className="flex flex-row items-center mb-4">
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Pending" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setDisplay("Pending");
          }}
        >
          Pending
        </div>
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Accepted" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setDisplay("Accepted");
          }}
        >
          Accepted
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading packages...</div>
          </div>
            ) : list.filter((item) => {
              const isPending = display === "Pending" 
                ? item?.status?.accepted === false && item?.status?.rejected === false
                : false;
              const isAccepted = display === "Accepted" 
                ? item?.status?.accepted === true
                : false;
              return isPending || isAccepted;
            }).length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">No {display.toLowerCase()} packages found</div>
          </div>
        ) : list
          .filter((item) => {
            const isPending = display === "Pending" 
              ? item?.status?.accepted === false && item?.status?.rejected === false
              : false;
            const isAccepted = display === "Accepted" 
              ? item?.status?.accepted === true
              : false;
            return isPending || isAccepted;
          })
          .map((item, index) => (
            <div key={item._id} className="bg-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-bold text-gray-800">
                  {item?.order?.user?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(item?.wedsyPackageBooking?.date)?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <MdOutlineLocationOn className="text-gray-500 text-sm" />
                    <span className="text-sm text-gray-600">
                      {item?.wedsyPackageBooking?.address?.formatted_address?.split(',')[0] || 'Location not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-1">
                    <MdPersonOutline className="text-gray-500 text-sm" />
                    <span className="text-sm text-gray-600">
                      {item?.wedsyPackageBooking?.wedsyPackages?.reduce(
                        (acc, rec) => acc + rec.quantity,
                        0
                      )}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {item?.wedsyPackageBooking?.wedsyPackages
                      ?.map((i) => i?.package?.name)
                      .join(", ")}
                  </div>
                </div>

                <div className="text-right">
                  {display === "Pending" ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (!loading) {
                            RejectWedsyPackageBooking(item._id);
                          }
                        }}
                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <MdClear className="text-xs" />
                      </button>
                      <button
                        onClick={() => {
                          if (!loading) {
                            AcceptWedsyPackageBooking(item._id);
                          }
                        }}
                        className="bg-custom-dark-blue text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <MdCheck className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
                      Accepted
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
