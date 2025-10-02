import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useRef, useState } from "react";
import {
  MdArrowForwardIos,
  MdCurrencyRupee,
  MdDelete,
  MdEdit,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdOutlineLocationOn,
  MdPersonOutline,
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { useRouter } from "next/router";
import { Avatar, Label, Select, TextInput } from "flowbite-react";
import { formatMessageTime } from "@/utils/chat";
import { VscSend } from "react-icons/vsc";
import { toPriceString } from "@/utils/text";
import { RxDashboard } from "react-icons/rx";
import { FiEdit3 } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import { BsPaperclip, BsImage, BsMic } from "react-icons/bs";

function BiddingRequirement({ chat, fetchChatMessages, onClose }) {
  const inputRef = useRef(null);
  const [googleInstance, setGoogleInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bidding, setBidding] = useState(null);
  const [expandRequirements, setExpandRequirements] = useState(false);
  const [editRequirements, setEditRequirements] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [events, setEvents] = useState(null);
  const [newPrice, setNewPrice] = useState(null);
  const [eventIndex, setEventIndex] = useState(0);
  const [eventsCount, setEventsCount] = useState("1");
  const [preferredLook, setPreferredLook] = useState([]);
  const [makeupStyle, setMakeupStyle] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const extractAddressComponents = (components) => {
    const result = {
      city: "",
      postal_code: "",
      state: "",
      country: "",
      locality: "",
    };

    components.forEach((component) => {
      if (component.types.includes("locality")) {
        result.city = component.long_name; // Locality usually represents the city
      }
      if (
        component.types.includes("administrative_area_level_2") &&
        !result.city
      ) {
        result.city = component.long_name; // Fallback if locality isn't available
      }
      if (component.types.includes("postal_code")) {
        result.postal_code = component.long_name; // Extract postal code
      }
      if (component.types.includes("administrative_area_level_1")) {
        result.state = component.long_name; // Extract state
      }
      if (component.types.includes("country")) {
        result.country = component.long_name; // Extract country
      }
      if (
        component.types.includes("sublocality") ||
        component.types.includes("neighborhood")
      ) {
        result.locality = component.long_name; // More granular locality info
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
              const { city, postal_code, state, country, locality } =
                extractAddressComponents(place.address_components);
              setEvents((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems[eventIndex] = {
                  ...updatedItems[eventIndex],
                  location: place.formatted_address,
                  address: {
                    city,
                    postal_code,
                    state,
                    country,
                    locality,
                    place_id: place.place_id,
                    formatted_address: place.formatted_address,
                    geometry: {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    },
                  },
                };
                return updatedItems;
              });
            }
          });
        } else {
          console.warn("Input reference is not available yet.");
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };
    if (editRequirements) {
      initializeAutocomplete();
    }
  }, [eventIndex, editRequirements]);
  const fetchPreferredLook = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-preferred-look`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setPreferredLook(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchMakeupStyle = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-makeup-style`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setMakeupStyle(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchAddOns = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-add-ons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setAddOns(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchBidding = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/bidding/${chat?.other?.bidding}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Bidding response:", response);
        console.log("Bidding events:", response?.events);
        setBidding(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const CreateBiddingOffer = () => {
  const priceToSend = (newPrice ?? chat?.content ?? "").toString().trim();
    if (!priceToSend) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/chat/${chat?.chat}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        content: priceToSend,
        contentType: "BiddingOffer",
        other: {
          bidding: chat?.other?.bidding,
          biddingBid: chat.other?.biddingBid,
          events,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchChatMessages();
        setEvents(null);
        setSelectedEvent(0);
        setEventIndex(0);
        setNewPrice(null);
        setEditRequirements(false);
        setExpandRequirements(false);
        if (onClose) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    if (chat?._id) {
      console.log("Chat data:", chat);
      console.log("Chat other:", chat?.other);
      fetchBidding();
      fetchAddOns();
      fetchMakeupStyle();
      fetchPreferredLook();
    }
  }, [chat]);
  useEffect(() => {
    if ((newPrice === null || newPrice === undefined) && chat?.content) {
      setNewPrice(chat?.content);
    }
  }, [chat, newPrice]);

  return (
    <div 
      className="bg-[#2B3F6C] border border-[#2B3F6C] px-4 py-3 flex items-center gap-3 max-w-full"
      style={{
        borderTopLeftRadius: '25px',
        borderTopRightRadius: '25px',
        borderBottomRightRadius: '25px',
        borderBottomLeftRadius: '0px'
      }}
    >
      <div className="flex-1 min-w-0">
        <label className="block text-white text-xs font-semibold mb-1.5">
          Make offer
        </label>
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
          <span className="text-sm font-semibold text-[#2B3F6C]">₹</span>
          <input
            type="number"
            className="w-full border-0 bg-transparent text-sm font-semibold text-[#2B3F6C] focus:outline-none"
            value={newPrice ?? ""}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        </div>
      <button
            onClick={() => {
          CreateBiddingOffer();
          if (onClose) {
            onClose();
          }
        }}
        className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#2B3F6C] transition"
      >
        <span className="text-xl font-bold leading-none">↑</span>
      </button>
    </div>
  );
}

function EditRequirementsPanel({ chat, onClose, fetchChatMessages, onSaved }) {
  const inputRef = useRef(null);
  const [bidding, setBidding] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [fetchingBidding, setFetchingBidding] = useState(false);
  const [events, setEvents] = useState(null);
  const [eventIndex, setEventIndex] = useState(0);
  const [eventsCount, setEventsCount] = useState("1");
  const [newPrice, setNewPrice] = useState(null);
  const [preferredLook, setPreferredLook] = useState([]);
  const [makeupStyle, setMakeupStyle] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [expandRequirements, setExpandRequirements] = useState(false);

  function fetchBidding() {
    if (fetchingBidding) return;
    
    const biddingId = chat?.other?.bidding;
    console.log("EditRequirementsPanel fetchBidding - bidding ID:", biddingId);
    console.log("EditRequirementsPanel chat object:", chat);
    
    if (!biddingId) {
      console.error("EditRequirementsPanel: No bidding ID found in chat.other.bidding");
      setFetchingBidding(false);
      return;
    }
    
    setFetchingBidding(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/bidding/${biddingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("EditRequirementsPanel: Bidding data received:", response);
        setBidding(response);
        setFetchingBidding(false);
      })
      .catch((error) => {
        console.error("EditRequirementsPanel fetch error:", error);
        setFetchingBidding(false);
      });
  }

  const fetchPreferredLook = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-preferred-look`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setPreferredLook(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const fetchMakeupStyle = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-makeup-style`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setMakeupStyle(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const fetchAddOns = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-add-ons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setAddOns(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const SaveRequirements = async () => {
    if (!events || events.length === 0) {
      console.error("SaveRequirements: No events to save");
      return;
    }

    console.log("====== SAVING REQUIREMENTS ======");
    console.log("Events:", events);
    console.log("Chat ID:", chat?.chat);
    console.log("Bidding ID:", chat?.other?.bidding);
    console.log("=================================");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    
    // Create a new BiddingOffer message with updated events (same price as current offer)
    const priceToSend = (newPrice ?? chat?.content ?? "").toString().trim();
    
    try {
      const response = await fetch(`${apiUrl}/chat/${chat?.chat}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: priceToSend || chat?.content,
          contentType: "BiddingOffer",
          other: {
            bidding: chat?.other?.bidding,
            biddingBid: chat?.other?.biddingBid,
            events: events,
          },
        }),
      });

      console.log("Save response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✓ Saved successfully! New message:", data);
      
      // Update parent state with the new message
      if (onSaved) {
        onSaved(data);
      }
      
      // Refresh chat messages to show the updated offer
      if (fetchChatMessages) {
        console.log("Refreshing chat messages...");
        await fetchChatMessages(false);
      }
      
      onClose();
    } catch (error) {
      console.error("❌ Error saving requirements:", error);
    }
  };

  const CreateBiddingOffer = () => {
    const priceToSend = (newPrice ?? chat?.content ?? "").toString().trim();
    if (!priceToSend) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/chat/${chat?.chat}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        content: priceToSend,
        contentType: "BiddingOffer",
        other: {
          bidding: chat?.other?.bidding,
          biddingBid: chat.other?.biddingBid,
          events,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchChatMessages();
        setEvents(null);
        setSelectedEvent(0);
              setEventIndex(0);
        setNewPrice(null);
              setExpandRequirements(false);
        onClose();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    if (!chat?._id) return;
    
    // Always fetch when chat ID changes
    fetchBidding();
    fetchPreferredLook();
    fetchMakeupStyle();
    fetchAddOns();
  }, [chat?._id]);

  // Force re-initialization whenever chat prop changes
  useEffect(() => {
    setEvents(null); // Clear first
    setEventIndex(0);
    setSelectedEvent(0);
  }, [chat?._id]); // Trigger on chat message ID change

  useEffect(() => {
    // Prioritize chat.other.events (latest offer message) over bidding.events (may be stale)
    const newEvents = chat?.other?.events || bidding?.events;
    if (newEvents) {
      console.log("Updating events in EditRequirementsPanel:");
      console.log("  Chat ID:", chat?._id);
      console.log("  Events:", newEvents);
      // Deep clone to avoid reference issues
      setEvents(JSON.parse(JSON.stringify(newEvents)));
    }
  }, [bidding, chat]);

  useEffect(() => {
    if ((newPrice === null || newPrice === undefined) && chat?.content) {
      setNewPrice(chat?.content);
    }
  }, [chat, newPrice]);

  return (
    <div 
      className="flex flex-1 flex-col overflow-hidden bg-[#E7EFFF]" 
      style={{ 
        width: '100%',
        maxWidth: '394px',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
      }}
    >
      {/* Header section with Best offer, Your offer, Edit requirement */}
      <div className="relative bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
        {/* Close button */}
        <button
          onClick={async () => {
            // Auto-save before closing
            if (events && events.length > 0) {
              await SaveRequirements();
            } else {
              onClose();
            }
          }}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1F2C] text-white transition hover:bg-[#2B3F6C] z-10"
        >
          <span className="text-sm font-bold">×</span>
        </button>
        <div className="flex items-center justify-between">
          {/* Best offer */}
          <div className="flex-1">
            <div 
              className="text-[#2B3F6C] font-semibold" 
              style={{ 
                fontFamily: 'Montserrat', 
                fontSize: '10px', 
                lineHeight: '140%' 
              }}
            >
              Best offer
      </div>
            <div 
              className="text-[#2B3F6C] font-medium" 
              style={{ 
                fontFamily: 'Montserrat', 
                fontSize: '14px', 
                lineHeight: '140%' 
              }}
            >
              ₹ 8000
              </div>
          </div>

          {/* Vertical divider */}
          <div className="h-12 w-px bg-[#2B3F6C] mx-4"></div>

          {/* Your offer */}
          <div className="flex-1">
            <div 
              className="text-[#2B3F6C] font-semibold" 
              style={{ 
                fontFamily: 'Montserrat', 
                fontSize: '10px', 
                lineHeight: '140%' 
              }}
            >
              Your offer
                    </div>
                    <div
              className="text-[#2B3F6C] font-medium" 
              style={{ 
                fontFamily: 'Montserrat', 
                fontSize: '14px', 
                lineHeight: '140%' 
              }}
            >
              ₹ 8000
                    </div>
                    </div>

          {/* Vertical divider */}
          <div className="h-12 w-px bg-[#2B3F6C] mx-4"></div>

          {/* Edit requirement button */}
          <div className="flex items-center gap-2">
            <div>
              <div 
                className="text-[#2B3F6C] font-semibold" 
                style={{ 
                  fontFamily: 'Montserrat', 
                  fontSize: '10px', 
                  lineHeight: '12px' 
                }}
              >
                Edit requirement
          </div>
        </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center w-7 h-7 bg-[#2B3F6C] rounded-md">
                <MdEdit className="text-white" size={16} />
              </button>
              <button 
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 border border-[#2B3F6C] rounded-md"
              >
                <span className="text-[#2B3F6C] text-lg leading-none">↑</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
        {/* Event tabs */}
        {events && events.length > 0 ? (
          <>
            <div className="flex flex-row gap-3 items-center">
              <div className="flex flex-row gap-3 flex-wrap flex-1">
                {events.map((item, index) => (
                  <button
                    key={index}
                    className={`px-6 py-2.5 font-semibold text-sm transition rounded-full ${
                  eventIndex === index
                        ? "bg-[#2B3F6C] text-white"
                        : "bg-transparent text-[#2B3F6C] border-0"
                }`}
                onClick={() => {
                  setEventIndex(index);
                }}
              >
                    {item?.eventName || `Day ${index + 1}`}
                  </button>
            ))}
                <button
              onClick={() => {
                let tempCount = parseInt(eventsCount);
                tempCount++;
                setEvents([
                  ...events,
                  {
                    eventName: "",
                    date: "",
                    time: "",
                    location: "",
                    address: {},
                    notes: [],
                    peoples: [
                      {
                        noOfPeople: "",
                        makeupStyle: "",
                        preferredLook: "",
                        addOns: "",
                      },
                    ],
                  },
                ]);
                setEventIndex(tempCount - 1);
                setEventsCount(String(tempCount));
              }}
                  className="px-6 py-2.5 font-semibold text-sm bg-[#5A6B7D] text-white rounded-full transition hover:bg-[#4A5B6D]"
            >
              + Add
                </button>
            </div>
            {events.length > 1 && (
                <button
                onClick={() => {
                  let tempCount = parseInt(eventsCount);
                  tempCount--;
                  setEventIndex(0);
                  setEventsCount(String(tempCount));
                  setEvents(
                    events.filter((_, recIndex) => recIndex !== eventIndex)
                  );
                }}
                  className="text-red-600 hover:text-red-700"
                >
                  <MdDelete size={24} />
                </button>
            )}
          </div>

            {/* Event form */}
            {events
              ?.filter((_, index) => index === eventIndex)
              ?.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#1A1F2C]">
                      Event Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-center text-[#1A1F2C] focus:outline-none"
                      value={item?.eventName || ""}
                onChange={(e) => {
                  setEvents(
                    events?.map((rec, recIndex) =>
                      recIndex === eventIndex
                        ? { ...rec, eventName: e.target.value }
                        : rec
                    )
                  );
                }}
              />
            </div>

                  <div className="grid grid-cols-2 gap-3">
            <div>
                      <label className="mb-1 block text-xs font-semibold text-[#1A1F2C]">
                        Date
                      </label>
                      <input
                type="date"
                        className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-center text-[#1A1F2C] focus:outline-none"
                        value={item?.date || ""}
                onChange={(e) => {
                  setEvents(
                    events?.map((rec, recIndex) =>
                      recIndex === eventIndex
                        ? { ...rec, date: e.target.value }
                        : rec
                    )
                  );
                }}
              />
            </div>
            <div>
                      <label className="mb-1 block text-xs font-semibold text-[#1A1F2C]">
                        Time
                      </label>
                      <input
                type="time"
                        className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-center text-[#1A1F2C] focus:outline-none"
                        value={item?.time || ""}
                onChange={(e) => {
                  setEvents(
                    events?.map((rec, recIndex) =>
                      recIndex === eventIndex
                        ? { ...rec, time: e.target.value }
                        : rec
                    )
                  );
                }}
              />
            </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#1A1F2C]">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-center text-[#1A1F2C] focus:outline-none"
                      value={item?.location || ""}
                onChange={(e) => {
                  setEvents(
                    events?.map((rec, recIndex) =>
                      recIndex === eventIndex
                        ? { ...rec, location: e.target.value }
                        : rec
                    )
                  );
                }}
              />
            </div>

                  {/* People fields */}
                  {item?.peoples?.map((person, personIdx) => (
                    <div key={personIdx} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
              <div>
                          <div className="flex items-center gap-3 rounded-lg border-0 bg-white px-4 py-3.5">
                            <MdPersonOutline className="text-[#1A1F2C]" size={20} />
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent text-sm text-[#1A1F2C] focus:outline-none"
                              placeholder="No. of people"
                              value={person?.noOfPeople || ""}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                                    peoples: updated[eventIndex]?.peoples.map((p, i) =>
                                      i === personIdx
                                        ? { ...p, noOfPeople: e.target.value }
                                        : p
                        ),
                      };
                      return updated;
                    });
                  }}
                />
                          </div>
              </div>
              <div>
                          <select
                            className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-[#1A1F2C] focus:outline-none"
                            value={person?.makeupStyle || ""}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                                  peoples: updated[eventIndex]?.peoples.map((p, i) =>
                                    i === personIdx
                                      ? { ...p, makeupStyle: e.target.value }
                                      : p
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                            <option value="">Makeup Style</option>
                  {makeupStyle?.map((r, i) => (
                    <option value={r?.title} key={i}>
                                {r?.title}
                    </option>
                  ))}
                          </select>
              </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
              <div>
                          <select
                            className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-[#1A1F2C] focus:outline-none"
                            value={person?.preferredLook || ""}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                                  peoples: updated[eventIndex]?.peoples.map((p, i) =>
                                    i === personIdx
                                      ? { ...p, preferredLook: e.target.value }
                                      : p
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                            <option value="">Preferred Look</option>
                  {preferredLook?.map((r, i) => (
                    <option value={r?.title} key={i}>
                                {r?.title}
                    </option>
                  ))}
                          </select>
              </div>
              <div>
                          <select
                            className="w-full rounded-lg border-0 bg-white px-4 py-3.5 text-sm text-[#1A1F2C] focus:outline-none"
                            value={person?.addOns || ""}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                                  peoples: updated[eventIndex]?.peoples.map((p, i) =>
                                    i === personIdx
                                      ? { ...p, addOns: e.target.value }
                                      : p
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                            <option value="">Add ons</option>
                  {addOns?.map((r, i) => (
                    <option value={r?.title} key={i}>
                                {r?.title}
                    </option>
                  ))}
                          </select>
              </div>
            </div>
              </div>
                  ))}

                  {/* Add more people button */}
            <button
              onClick={() => {
                      console.log("Adding more people to event", eventIndex);
                setEvents((prev) => {
                  const updated = [...prev];
                  updated[eventIndex] = {
                    ...updated[eventIndex],
                    peoples: [
                            ...(updated[eventIndex]?.peoples || []),
                      {
                        noOfPeople: "",
                        makeupStyle: "",
                        preferredLook: "",
                        addOns: "",
                      },
                    ],
                  };
                        console.log("Updated events after adding people:", updated);
                  return updated;
                });
              }}
                    className="w-full py-3.5 px-4 rounded-lg font-semibold text-sm bg-[#2B3F6C] text-white transition hover:bg-[#1f2f4f]"
            >
              + Add more people
            </button>
                </div>
              ))}
          </>
        ) : (
          <div className="text-center text-[#667085] py-8">
            Loading requirements...
          </div>
        )}
      </div>
      
      {/* Save button */}
      {events && events.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 flex-shrink-0">
            <button
              onClick={() => {
              SaveRequirements();
            }}
            className="w-full rounded-lg bg-[#2B3F6C] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1f2f4f]"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function RequirementsViewPanel({ chat, onClose }) {
  const [bidding, setBidding] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [fetchingBidding, setFetchingBidding] = useState(false);
  const [events, setEvents] = useState(null);
  const [eventsCount, setEventsCount] = useState("1");
  const [preferredLook, setPreferredLook] = useState([]);
  const [makeupStyle, setMakeupStyle] = useState([]);
  const [addOns, setAddOns] = useState([]);

  function fetchBidding() {
    if (fetchingBidding) return;
    
    const biddingId = chat?.other?.bidding;
    console.log("RequirementsViewPanel fetchBidding - bidding ID:", biddingId);
    
    if (!biddingId) {
      console.error("RequirementsViewPanel: No bidding ID found");
      setFetchingBidding(false);
      return;
    }
    
    setFetchingBidding(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/bidding/${biddingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("RequirementsViewPanel: Bidding data received:", response);
        setBidding(response);
        setFetchingBidding(false);
      })
      .catch((error) => {
        console.error("RequirementsViewPanel fetch error:", error);
        setFetchingBidding(false);
      });
  }

  const fetchPreferredLook = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-preferred-look`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setPreferredLook(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const fetchMakeupStyle = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-makeup-style`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setMakeupStyle(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const fetchAddOns = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/vendor-add-ons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setAddOns(response);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    if (!chat?._id) return;
    
    fetchBidding();
    fetchPreferredLook();
    fetchMakeupStyle();
    fetchAddOns();
  }, [chat?._id]);

  // Force re-initialization whenever chat prop changes
  useEffect(() => {
    console.log("RequirementsViewPanel: Chat ID changed, clearing state");
    setEvents(null); // Clear first
    setSelectedEvent(0);
  }, [chat?._id]); // Trigger on chat message ID change

  useEffect(() => {
    // Prioritize chat.other.events (latest offer message) over bidding.events (may be stale)
    const newEvents = chat?.other?.events || bidding?.events;
    if (newEvents) {
      console.log("===== RequirementsViewPanel Data Update =====");
      console.log("Chat message ID:", chat?._id);
      console.log("Events data:", newEvents);
      console.log("First event date:", newEvents?.[0]?.date);
      console.log("===========================================");
      setEvents(JSON.parse(JSON.stringify(newEvents)));
    }
  }, [bidding, chat]);

  // Always use fresh data: chat.other.events (priority) or bidding.events or state
  const displayEvents = chat?.other?.events || bidding?.events || events;

  return (
    <div 
      className="flex flex-1 flex-col overflow-hidden bg-[#E7EFFF]" 
      style={{ 
        width: '100%',
        maxWidth: '394px',
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
      }}
    >
      {/* Header with close button */}
      <div className="flex justify-end p-4 pb-0 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1F2C] text-white transition hover:bg-[#2B3F6C]"
        >
          <span className="text-lg font-bold">×</span>
            </button>
          </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
        {/* Event tabs */}
        <div className="flex flex-row gap-2 flex-wrap">
          {(displayEvents || []).map((item, index) => (
            <button
              key={index}
              className={`cursor-pointer px-6 py-2 font-semibold rounded-full text-sm transition ${
                selectedEvent === index
                  ? "bg-[#2B3F6C] text-white"
                  : "bg-white text-[#2B3F6C]"
              }`}
              onClick={() => {
                setSelectedEvent(index);
              }}
            >
              {item?.eventName || `Day ${index + 1}`}
            </button>
          ))}
        </div>

        {/* Event details - Read Only */}
        {(displayEvents || [])
          ?.filter((_, index) => index === selectedEvent)
          ?.map((item, eventIdx) => (
            <div key={eventIdx} className="space-y-4">
              {/* Location and Date */}
              <div className="flex items-center justify-between text-[#1A1F2C]">
                <div className="flex items-center gap-2">
                  <MdOutlineLocationOn size={20} />
                  <span className="text-sm font-medium">{item?.location}</span>
                </div>
                <span className="text-sm font-medium">
                  {item?.date
                    ? new Date(item?.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>

              {/* People information */}
              {item?.peoples?.map((person, personIdx) => (
                <div key={personIdx} className="space-y-3">
                  <div className="flex items-center gap-4 text-[#1A1F2C]">
                    <div className="flex items-center gap-2">
                      <MdPersonOutline size={20} />
                      <span className="text-sm font-medium">{person?.noOfPeople}</span>
                    </div>
                    <span className="text-sm font-medium">{person?.makeupStyle}</span>
                    <span className="text-sm font-medium">{person?.preferredLook}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1A1F2C]">
                    <RxDashboard size={20} />
                    <span className="text-sm font-medium">{person?.addOns}</span>
                  </div>
                </div>
              ))}

              {/* Notes */}
              {item?.notes && item?.notes?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A1F2C]">
                    Notes
                  </p>
                  <div className="rounded-lg border border-[#D1D5DB] bg-white p-4">
                    <p className="text-sm text-[#1A1F2C]">{item?.notes?.join("\n")}</p>
          </div>
        </div>
      )}
            </div>
          ))}

        {/* Pagination dots */}
        {(displayEvents || []).length > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {(displayEvents || []).map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedEvent(index)}
                className={`h-2 w-2 rounded-full transition ${
                  selectedEvent === index ? "bg-[#2B3F6C]" : "bg-[#2B3F6C] opacity-30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatMessage({ chat }) {
  const [order, setOrder] = useState(null);
  const [bidding, setBidding] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [fetchingBidding, setFetchingBidding] = useState(false);
  const isVendorMessage = chat?.sender?.role === "vendor";
  
  // console.log("ChatMessage rendering with chat:", chat);
  
  function fetchOrder() {
    if (fetchingOrder || order) return; // Prevent duplicate requests
    setFetchingOrder(true);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/order/${chat?.other?.order}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setOrder(response);
        setFetchingOrder(false);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setFetchingOrder(false);
      });
  }
  
  function fetchBidding() {
    if (fetchingBidding || bidding) return; // Prevent duplicate requests
    setFetchingBidding(true);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(
      `${apiUrl}/bidding/${chat?.other?.bidding}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setBidding(response);
        setFetchingBidding(false);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setFetchingBidding(false);
      });
  }
  
  useEffect(() => {
    if (chat?.contentType === "PersonalPackageAccepted" && chat?.other?.order) {
      fetchOrder();
    } else if (
      (chat?.contentType === "BiddingBid" ||
        chat?.contentType === "BiddingOffer") &&
      chat?.other?.bidding
    ) {
      fetchBidding();
    }
  }, [chat]);

  if (chat?.contentType === "Text") {
    const bubbleClasses = isVendorMessage
      ? "ml-auto rounded-3xl rounded-br-sm bg-[#1C2B5A] text-white"
      : "mr-auto rounded-3xl rounded-bl-sm bg-white text-[#1A1F2C]";
      return (
      <div
        className={`max-w-[80%] px-5 py-3 text-sm leading-relaxed shadow-md transition-all ${bubbleClasses}`}
      >
          {chat?.content}
        </div>
      );
  } else if (chat?.contentType === "PersonalPackageAccepted") {
    return (
      <>
        {order?._id && order?.amount?.due === 0 && (
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#1C2B5A] px-4 py-3 text-center text-sm font-medium text-white shadow">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-3 text-sm font-medium text-[#1C2B5A] underline shadow-md">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-4 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
          Package price
          </p>
          <p className="text-2xl font-semibold text-[#1C2B5A]">
            {toPriceString(order?.amount?.total)}
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#E8EEF9] px-4 py-2 text-center text-sm font-medium text-[#1C2B5A] shadow">
          Package request accepted
        </div>
      </>
    );
  } else if (chat?.contentType === "BiddingBid") {
    return (
      <>
        {chat?.other?.rejected && (
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#1F2937] px-4 py-2 text-center text-sm font-medium text-white shadow">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#1C2B5A] px-4 py-2 text-center text-sm font-medium text-white shadow">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-3 text-sm font-medium text-[#1C2B5A] underline shadow-md">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-4 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
          Offer received
          </p>
          <p className="text-2xl font-semibold text-[#1C2B5A]">
            {toPriceString(
              bidding?.bids?.find(
                (item) => item?._id === chat?.other?.biddingBid
              )?.bid
            )}
          </p>
        </div>
      </>
    );
  } else if (chat?.contentType === "BiddingOffer") {
    return (
      <>
        {chat?.other?.rejected && (
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#1F2937] px-4 py-2 text-center text-sm font-medium text-white shadow">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#1C2B5A] px-4 py-2 text-center text-sm font-medium text-white shadow">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-3 text-sm font-medium text-[#1C2B5A] underline shadow-md">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="mr-auto max-w-[85%] rounded-3xl rounded-bl-sm bg-white px-5 py-4 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
          Offer received
          </p>
          <p className="text-2xl font-semibold text-[#1C2B5A]">
            {toPriceString(parseInt(chat?.content))}
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#E8EEF9] px-4 py-2 text-center text-sm font-medium text-[#1C2B5A] shadow">
          Here’s your custom offer
        </div>
      </>
    );
  }
}

export default function Home({}) {
  const [chat, setChat] = useState({});
  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [offerContext, setOfferContext] = useState(null);
  const [showOfferComposer, setShowOfferComposer] = useState(false);
  const [showRequirementsView, setShowRequirementsView] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const { chatId } = router.query;
  const activeControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  const fetchChatMessages = (showSpinner = true) => {
    if (!chatId) return Promise.resolve();
    
    if (showSpinner) setLoading(true);

    console.log("Chat ID:", chatId);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    console.log("fetchChatMessages - API URL:", apiUrl);
    
    return fetch(`${apiUrl}/chat/${encodeURIComponent(chatId)}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        console.log("fetchChatMessages raw response:", response);
        console.log("fetchChatMessages response status:", response.status);
        console.log("fetchChatMessages response ok:", response.ok);
        return response.json();
      })
      .then((response) => {
        console.log("Messages array:", response?.messages);
        console.log("Messages count:", response?.messages?.length);
        
        if (response && (response.messages || response._id)) {
          setChat(response);
          let latestOffer = null;
          let latestBid = null;
          console.log("Searching for latest BiddingOffer/BiddingBid from", response?.messages?.length, "messages");
          
          // Find the LATEST offer/bid by checking createdAt timestamp
          let latestOfferTime = null;
          let latestBidTime = null;
          
          for (let i = 0; i < (response?.messages?.length || 0); i++) {
            let temp = response?.messages[i];
            const type = temp?.contentType;
            const createdAt = new Date(temp?.createdAt).getTime();
            
            if (type === "BiddingOffer") {
              if (!latestOfferTime || createdAt > latestOfferTime) {
                latestOffer = temp;
                latestOfferTime = createdAt;
              }
            }
            if (type === "BiddingBid") {
              if (!latestBidTime || createdAt > latestBidTime) {
                latestBid = temp;
                latestBidTime = createdAt;
              }
            }
          }
          
          // Use the most recent one based on timestamp
          let display;
          if (latestOffer && latestBid) {
            display = latestOfferTime > latestBidTime ? latestOffer : latestBid;
          } else {
            display = latestOffer || latestBid;
          }
          
          console.log("Setting offerContext:", {
            id: display?._id,
            type: display?.contentType,
            createdAt: display?.createdAt,
            firstEventDate: display?.other?.events?.[0]?.date,
            eventsCount: display?.other?.events?.length
          });
          setOfferContext(display);
        }
        setLoading(false);
        // Mark as read in background (no spinner)
        fetch(`${apiUrl}/chat/${encodeURIComponent(chatId)}/mark-read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).catch(() => {});
        return response;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        console.error("Error details:", error.message);
        console.log("chat id", chatId);
        setLoading(false);
      });
  };
  
  const CreateChatMessage = () => {
    const text = content.trim();
    if (!text || loading) return;

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

    fetch(`${apiUrl}/chat/${encodeURIComponent(chatId)}/content/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content: text, contentType: "Text" }),
    })
      .then((r) => r.json())
      .then(() => {
        setContent("");
        fetchChatMessages(false);
      })
      .catch((e) => console.error("Error sending message:", e))
      .finally(() => setLoading(false));
    };
    
    useEffect(() => {
    if (!document.body.classList.contains("relative")) {
      document.body.classList.add("relative");
    }
    if (chatId) {
      fetchChatMessages();
    }
  }, [chatId]);
  
  useEffect(() => {
    console.log("***** offerContext CHANGED *****");
    console.log("New offerContext ID:", offerContext?._id);
    console.log("New offerContext content:", offerContext?.content);
    console.log("New offerContext events:", offerContext?.other?.events);
    console.log("First event date:", offerContext?.other?.events?.[0]?.date);
    console.log("********************************");
  }, [offerContext]);
  
  console.log("chatId: last", chatId);
  
  // useEffect(() => {
    //   const onFocus = () => {
  //     if (chatId) fetchChatMessages(false);
  //   };
  //   const onVisibility = () => {
  //     if (document.visibilityState === "visible" && chatId) {
  //       fetchChatMessages(false);
  //     }
  //   };
  //   window.addEventListener("focus", onFocus);
  //   document.addEventListener("visibilitychange", onVisibility);
  //   return () => {
  //     window.removeEventListener("focus", onFocus);
  //     document.removeEventListener("visibilitychange", onVisibility);
  //   };
  // }, [chatId]);

  return (
    <>
      <div className="flex h-full flex-col bg-[#E9ECF7]">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
          <BackIcon />
          <Avatar size="sm" rounded img={chat?.user?.profilePhoto} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Client
            </p>
            <p className="text-lg font-semibold text-[#1C2B5A]">
              {chat?.user?.name || "--"}
          </p>
        </div>
        </header>
        {offerContext && (
          <div className="sticky top-[72px] z-10 flex items-center gap-2 border-b border-[#E5E7EB] bg-[#2B3F6C] px-3 py-1.5 text-white shadow">
            <div className="flex-1 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Best offer
              </p>
              <p className="text-xs font-semibold">
                {offerContext?.other?.bestOffer
                  ? toPriceString(offerContext.other.bestOffer)
                  : "₹ 8,000"}
              </p>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex-1 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Your offer
              </p>
              <p className="text-xs font-semibold">
                {offerContext?.content
                  ? toPriceString(parseInt(offerContext.content, 10))
                  : "₹ 8,000"}
              </p>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-0.5 px-1.5 text-center transition hover:opacity-80"
                onClick={() => {
                  console.log("Switching to View mode with offerContext:", offerContext);
                  setIsEditMode(false);
                  setShowRequirementsView(true);
                }}
              >
                <MdOutlineKeyboardArrowDown size={16} />
                <span className="text-[8px] font-semibold uppercase tracking-wider">
                  View
                </span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-0.5 px-1.5 text-center transition hover:opacity-80"
                onClick={() => {
                  console.log("Switching to Edit mode with offerContext:", offerContext);
                  setIsEditMode(true);
                  setShowRequirementsView(true);
                }}
              >
                <MdEdit size={14} />
                <span className="text-[8px] font-semibold uppercase tracking-wider">
                  Edit
                </span>
              </button>
            </div>
          </div>
        )}
        {showRequirementsView && offerContext && (
          <>
            {isEditMode ? (
              <EditRequirementsPanel 
                key={offerContext?._id}
                chat={offerContext}
                onClose={() => {
                  setShowRequirementsView(false);
                  setIsEditMode(false);
                }}
            fetchChatMessages={fetchChatMessages}
                onSaved={(newMsg) => {
                  // Set the latest offer context immediately to the new message from server
                  console.log("onSaved: setting offerContext to new message", newMsg?._id);
                  setOfferContext(newMsg);
                }}
              />
            ) : (
              <RequirementsViewPanel 
                key={offerContext?._id}
                chat={offerContext}
                onClose={() => {
                  setShowRequirementsView(false);
                  setIsEditMode(false);
                }}
              />
            )}
          </>
        )}
        {!showRequirementsView && (
        <div
          id="chat-container"
            className="hide-scrollbar flex flex-1 flex-col-reverse gap-5 overflow-y-auto bg-[#E9ECF7] px-5 py-8"
        >
          {chat?.messages?.length > 0 ? (
              chat?.messages?.map((item, index) => <ChatMessage chat={item} key={index} />)
          ) : (
              <div className="text-center text-[#667085]">
              No messages yet
            </div>
          )}
            </div>
          )}
        {!showRequirementsView && (
          <div className="border-t border-[#E5E7EB] bg-white pt-4 space-y-4">
            {showOfferComposer && offerContext ? (
              <div className="px-5">
                <BiddingRequirement
                  chat={offerContext}
                  fetchChatMessages={fetchChatMessages}
                  onClose={() => {
                    setShowOfferComposer(false);
                  }}
                />
              </div>
            ) : null}
            <div className="flex items-center gap-3 px-5">
          <input
            id="messageInput"
            type="text"
            placeholder="Send message here..."
              className="flex-1 rounded-full border border-[#CBD5F5] bg-white px-5 py-3 text-sm text-[#1A1F2C] shadow-sm focus:border-[#1C2B5A] focus:outline-none"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                CreateChatMessage();
              }
            }}
          />
          <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C2B5A] text-white shadow-md transition hover:bg-[#162349] disabled:bg-[#CBD5F5] disabled:text-white/70"
            disabled={loading || !content.trim()}
            onClick={CreateChatMessage}
          >
              <VscSend size={22} />
          </button>
        </div>
          <div className="flex items-center justify-between px-5 pb-4 text-[#1C2B5A]">
            <button
              type="button"
              className="text-sm font-semibold px-2 py-1"
              onClick={() => {
                if (showOfferComposer) {
                  // If card is already open, hide it (but keep top bar visible)
                  setShowOfferComposer(false);
                } else {
                  // If card is closed, find latest offer and show it
                  const latestOffer = [...(chat?.messages || [])]
                    .reverse()
                    .find((msg) =>
                      ["BiddingBid", "BiddingOffer"].includes(msg?.contentType)
                    );
                  if (latestOffer) {
                    setOfferContext(latestOffer);
                    setShowOfferComposer(true);
                  }
                }
              }}
            >
              ₹
            </button>
            <div className="flex items-center gap-4">
              <button type="button">
                <BsPaperclip size={18} />
              </button>
              <button type="button">
                <BsImage size={20} />
              </button>
              <button type="button">
                <BsMic size={18} />
              </button>
            </div>
            <button type="button" className="text-sm font-semibold">
              Aa
            </button>
          </div>
          </div>
        )}
      </div>
    </>
  );
}
