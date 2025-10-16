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
import { useNavigation } from "@/utils/navigation";

export default function Home({}) {
  const { navigateTo } = useNavigation();
  
  // Dummy fallback data for Personal Packages tab
  const DUMMY_PACKAGES = [
    {
      _id: "pkg-dummy-1",
      createdAt: new Date().toISOString(),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: { accepted: false, rejected: false },
      order: {
        user: { name: "Aisha Sharma" },
      },
      address: {
        formatted_address: "Taj Palace, New Delhi",
      },
      personalPackages: [
        { quantity: 1, package: { name: "Bridal Makeup" } },
        { quantity: 1, package: { name: "Hair Styling" } },
      ],
    },
    {
      _id: "pkg-dummy-2",
      createdAt: new Date().toISOString(),
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: { accepted: false, rejected: false },
      order: {
        user: { name: "Karan Mehta" },
      },
      address: {
        formatted_address: "The Leela, Mumbai",
      },
      personalPackages: [
        { quantity: 2, package: { name: "Party Makeup" } },
      ],
    },
  ];
  const [primaryTab, setPrimaryTab] = useState("Bidding");
  const [secondaryTab, setSecondaryTab] = useState("Pending");
  const router = useRouter();
  const [biddingList, setBiddingList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [biddingCount, setBiddingCount] = useState(0);
  const [personalPackageCount, setPersonalPackageCount] = useState(0);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [decliningBidId, setDecliningBidId] = useState(null);

  const fetchPendingCounts = () => {
    // Fetch bidding pending count
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=Bidding&stats=Pending`, {
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
        if (response && response.message === "success") {
          setBiddingCount(response.count);
        }
      })
      .catch((error) => {
        console.error("Error fetching bidding count:", error);
      });

    // Fetch personal package pending count
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=Personal-Package&stats=Pending`, {
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
        if (response && response.message === "success") {
          setPersonalPackageCount(response.count);
        }
      })
      .catch((error) => {
        console.error("Error fetching personal package count:", error);
      });
  };

  const fetchBidding = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=Bidding`, {
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
        console.log("Bidding API Response:", response);
        if (response) {
          setBiddingList(response);
        } else {
          setBiddingList([]);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setBiddingList([]);
      });
  };

  const fetchPackages = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=Personal-Package`, {
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
        console.log("Packages API Response:", response);
        const data = Array.isArray(response) ? response : [];
        if (data.length === 0) {
          setPackageList(DUMMY_PACKAGES);
        } else {
          setPackageList(data);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Use dummy data on failure for a demonstrable UI
        setPackageList(DUMMY_PACKAGES);
      });
  };

  const RejectBiddingBid = (_id) => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/reject-bidding-bid`,
      {
        method: "POST",
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
          fetchBidding();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleDeclineConfirm = () => {
    if (decliningBidId) {
      RejectBiddingBid(decliningBidId);
      setShowDeclineConfirm(false);
      setDecliningBidId(null);
    }
  };

  const handleDeclineCancel = () => {
    setShowDeclineConfirm(false);
    setDecliningBidId(null);
  };

  const handleMakeOffer = () => {
    if (decliningBidId) {
      setShowDeclineConfirm(false);
      setDecliningBidId(null);
      // Navigate to bidding detail page
      navigateTo(`/chats/bidding/${decliningBidId}`, 'right');
    }
  };
  useEffect(() => {
    fetchPendingCounts();
  }, []);


  useEffect(() => {
    if (primaryTab === "Bidding") {
      fetchBidding();
    } else if (primaryTab === "Personal Packages") {
      fetchPackages();
    }
  }, [primaryTab]);
  return (
    <>
      {/* header */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          ENQUIRIES
        </p>
      </div>
      
      {/* Primary Tabs - Bidding and Personal Packages */}
      <div className="flex flex-row items-center mb-4 gap-2 px-4 mt-4">
        <div
          className={`font-semibold text-sm py-3 px-8 text-center flex-grow rounded-full relative shadow-md transition-all duration-200 ${
            primaryTab === "Bidding" 
              ? "text-white bg-custom-dark-blue shadow-lg" 
              : "text-custom-dark-blue bg-white shadow-sm hover:shadow-md"
          }`}
          onClick={() => {
            setPrimaryTab("Bidding");
          }}
        >
          Bidding
          {biddingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {biddingCount}
            </span>
          )}
        </div>
        <div
          className={`font-semibold text-sm py-3 px-8 text-center flex-grow rounded-full relative shadow-md transition-all duration-200 ${
            primaryTab === "Personal Packages" 
              ? "text-white bg-custom-dark-blue shadow-lg" 
              : "text-custom-dark-blue bg-white shadow-sm hover:shadow-md"
          }`}
          onClick={() => {
            setPrimaryTab("Personal Packages");
          }}
        >
          Personal Packages
          {personalPackageCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {personalPackageCount}
            </span>
          )}
        </div>
      </div>
      
      {/* Pending and Accepted Tabs - Rectangular Full Width */}
      <div className="flex flex-row items-center mb-4">
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            secondaryTab === "Pending" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setSecondaryTab("Pending");
          }}
        >
          Pending
        </div>
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            secondaryTab === "Accepted" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setSecondaryTab("Accepted");
          }}
        >
          Accepted
        </div>
      </div>
      <div className="flex flex-col gap-0 pb-4">
        {primaryTab === "Bidding" && (() => {
          
          const filteredBiddingList = biddingList.filter((item) =>
            secondaryTab === "Pending"
              ? item?.status?.accepted === false
              : secondaryTab === "Accepted"
              ? item?.status?.accepted === true
              : false
          ).sort((a, b) => {
            // Sort by creation date - newest first
            const dateA = new Date(a?.bidding?.createdAt || a?.createdAt || 0);
            const dateB = new Date(b?.bidding?.createdAt || b?.createdAt || 0);
            return dateB - dateA;
          });
          
          if (filteredBiddingList.length === 0 && secondaryTab === "Pending") {
            return (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">No Pending Bids</p>
                  <p className="text-sm text-gray-500">You don&apos;t have any pending bidding requests at the moment.</p>
                  {/* Debug info removed */}
                </div>
              </div>
            );
          }
          
          if (filteredBiddingList.length === 0 && secondaryTab === "Accepted") {
            return (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">No Accepted Bids</p>
                  <p className="text-sm text-gray-500">You don&apos;t have any accepted bids at the moment.</p>
                </div>
              </div>
            );
          }
          
          return filteredBiddingList.map((item, index) => {
            const isRejected = item?.status?.rejected === true;
            const isDeclined = isRejected; // For styling purposes
            
            return (
            <div 
              key={index} 
              className={`px-4 py-4 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isDeclined 
                  ? 'bg-pink-50' 
                  : index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
              }`}
              onClick={() => {
                if (secondaryTab === "Pending" || secondaryTab === "Accepted") {
                  router.push(`/chats/bidding/${item?.bidding?._id}`);
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`text-lg font-bold ${isDeclined ? 'text-gray-400' : 'text-black'}`}>
                  {item?.bidding?.user?.name || "Customer"}
                </div>
                <div className={`text-sm font-semibold ${isDeclined ? 'text-gray-400' : 'text-black'}`}>
                  {new Date(
                    item?.bidding?.events[0]?.date
                  )?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              
              <div className="space-y-1 mb-3">
                <div className={`flex items-center gap-2 text-sm ${isDeclined ? 'text-gray-400' : 'text-black'}`}>
                  <MdOutlineLocationOn className={`flex-shrink-0 ${isDeclined ? 'text-gray-400' : 'text-custom-dark-blue'}`} size={16} />
                  <span>{item?.bidding?.events[0]?.location || "Location TBD"}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDeclined ? 'text-gray-400' : 'text-black'}`}>
                  <MdPersonOutline className={`flex-shrink-0 ${isDeclined ? 'text-gray-400' : 'text-custom-dark-blue'}`} size={16} />
                  <span>
                    {(() => {
                      const total = (item?.bidding?.events || []).reduce(
                        (eventAccumulator, event) => {
                          const eventTotal = (event.peoples || []).reduce(
                            (peopleAccumulator, person) => {
                              const count = parseInt(person?.noOfPeople, 10);
                              if (Number.isNaN(count)) {
                                return peopleAccumulator;
                              }
                              return peopleAccumulator + Math.max(count, 0);
                            },
                            0
                          );
                          // If count is still zero but preferred look is specified, treat as 1
                          const derivedTotal = eventTotal === 0
                            ? (event.peoples || []).reduce((acc, person) => acc + (person?.preferredLook?.trim() ? 1 : 0), 0)
                            : eventTotal;
                          return eventAccumulator + derivedTotal;
                        },
                        0
                      );
                      return total > 0 ? total : "Not specified";
                    })()}
                  </span>
                </div>
                <div className={`text-sm ${isDeclined ? 'text-gray-400' : 'text-black'}`}>
                  {item?.bidding?.events
                    ?.map((e) => {
                      return e.peoples.map((p) => p.makeupStyle).join(", ");
                    })
                    .join(", ")}
                </div>
              </div>
              
              <div className="flex justify-end">
                {secondaryTab === "Accepted" && (
                  <span className="text-sm px-4 py-2 rounded-lg bg-[#00ac4f] text-white font-semibold">
                    Accepted
                  </span>
                )}
                {secondaryTab === "Pending" && (
                  <div className="flex">
                    <button
                      className={`w-16 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm ${
                        isDeclined 
                          ? 'bg-white border border-gray-200' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDeclined) {
                          setDecliningBidId(item?.bidding?._id);
                          setShowDeclineConfirm(true);
                        }
                      }}
                    >
                      <MdClear className={`${isDeclined ? 'text-blue-300' : 'text-custom-dark-blue'}`} size={16} />
                    </button>
                    <button
                      className={`w-16 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm ${
                        isDeclined 
                          ? 'bg-purple-200' 
                          : 'bg-custom-dark-blue hover:bg-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDeclined) {
                          router.push(`/chats/bidding/${item?.bidding?._id}`);
                        }
                      }}
                    >
                      <MdCheck className={`${isDeclined ? 'text-gray-400' : 'text-white'}`} size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          });
        })()}
          
        {primaryTab === "Personal Packages" && (() => {
          const filteredPackageList = packageList.filter((item) =>
            secondaryTab === "Pending"
              ? item?.status?.accepted === false &&
                item?.status?.rejected === false
              : secondaryTab === "Accepted"
              ? item?.status?.accepted === true
              : false
          ).sort((a, b) => {
            // Sort by creation date - newest first
            const dateA = new Date(a?.createdAt || a?.order?.createdAt || 0);
            const dateB = new Date(b?.createdAt || b?.order?.createdAt || 0);
            return dateB - dateA;
          });
          
          if (filteredPackageList.length === 0 && secondaryTab === "Pending") {
            return (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">No Pending Packages</p>
                  <p className="text-sm text-gray-500">You don&apos;t have any pending package requests at the moment.</p>
                </div>
              </div>
            );
          }
          
          if (filteredPackageList.length === 0 && secondaryTab === "Accepted") {
            return (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600 mb-2">No Accepted Packages</p>
                  <p className="text-sm text-gray-500">You don&apos;t have any accepted packages at the moment.</p>
                </div>
              </div>
            );
          }
          
          return filteredPackageList.map((item, index) => (
            <div 
              key={index} 
              className={`px-4 py-4 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
              }`}
              onClick={() => {
                if (secondaryTab === "Pending" || secondaryTab === "Accepted") {
                  console.log("Navigate to package details:", item._id);
                  // TODO: Add navigation to package details page when implemented
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-bold text-black">
                  {item?.order?.user?.name || "Customer"}
                </div>
                <div className="text-sm font-semibold text-black">
                  {new Date(item?.date)?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-sm text-black">
                  <MdOutlineLocationOn className="text-custom-dark-blue flex-shrink-0" size={16} />
                  <span>{item?.address?.formatted_address || "Location TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black">
                  <MdPersonOutline className="text-custom-dark-blue flex-shrink-0" size={16} />
                  <span>
                    {item?.personalPackages?.reduce(
                      (acc, rec) => acc + rec.quantity,
                      0
                    ) || 1}
                  </span>
                </div>
                <div className="text-sm text-black">
                  {item?.personalPackages
                    ?.map((i) => i?.package?.name)
                    .join(", ")}
                </div>
              </div>
              
              <div className="flex justify-end">
                {secondaryTab === "Accepted" && (
                  <span className="text-sm px-4 py-2 rounded-lg bg-[#00ac4f] text-white font-semibold">
                    Accepted
                  </span>
                )}
                {secondaryTab === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      className="w-8 h-8 rounded-md bg-white border border-custom-dark-blue flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        {
                          console.log("Reject package:", item._id);
                        }
                      }}
                    >
                      <MdClear className="text-custom-dark-blue" size={16} />
                    </button>
                    <button
                      className="w-8 h-8 rounded-md bg-custom-dark-blue flex items-center justify-center hover:bg-blue-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        {
                          console.log("Accept package:", item._id);
                        }
                      }}
                    >
                      <MdCheck className="text-white" size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                Are you sure you want to decline ?
              </h3>
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 px-4 border border-[#2B3F6C] bg-white text-[#2B3F6C] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                onClick={handleDeclineConfirm}
              >
                Decline
              </button>
              <button
                className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                onClick={handleMakeOffer}
              >
                Make Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
