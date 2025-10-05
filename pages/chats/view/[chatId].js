import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useRef, useState, useCallback } from "react";
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
} from "react-icons/md";
import { useRouter } from "next/router";
import { Avatar, Label, Select, TextInput } from "flowbite-react";
import { formatMessageTime } from "@/utils/chat";
import { VscSend } from "react-icons/vsc";
import { toPriceString } from "@/utils/text";
import { RxDashboard } from "react-icons/rx";
import { BiRupee } from "react-icons/bi";
import { IoArrowUpCircle } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BiddingRequirement({ chat, fetchChatMessages, hasVendorOffer, onClose }) {
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
  const [preferredLook, setPreferredLook] = useState([]);
  const [makeupStyle, setMakeupStyle] = useState([]);
  const [addOns, setAddOns] = useState([]);
  
  // Debug: Log chat data when component mounts or updates
  useEffect(() => {
    console.log("🔵 BiddingRequirement component - chat prop:", chat);
    console.log("🔵 chat.contentType:", chat?.contentType);
    console.log("🔵 chat.other:", chat?.other);
  }, [chat]);
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
    console.log("fetchBidding called");
    console.log("chat?.other?.bidding:", chat?.other?.bidding);
    
    if (!chat?.other?.bidding) {
      console.log("No bidding ID available, skipping fetch");
      return;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    console.log("Fetching bidding from:", `${apiUrl}/bidding/${chat?.other?.bidding}`);
    
    fetch(`${apiUrl}/bidding/${chat?.other?.bidding}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("✅ Bidding response received:", response);
        console.log("✅ Bidding events:", response?.events);
        setBidding(response);
      })
      .catch((error) => {
        console.error("❌ Error fetching bidding:", error);
      });
  };
  const CreateBiddingOffer = (isEditMode = false) => {
    // Validate price
    if (!newPrice || newPrice <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    // Check if vendor has already made an offer (only for new offers, not edits)
    if (!isEditMode && hasVendorOffer) {
      toast.warning("You have already made an offer. You can only make one offer per chat.");
      return;
    }

    // Validate events data when editing
    if (isEditMode && events) {
      const hasInvalidEvent = events.some(event => 
        !event.eventName || !event.date || !event.location
      );
      if (hasInvalidEvent) {
        toast.error("Please fill in all required fields (Event Name, Date, Location).");
        return;
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    fetch(`${apiUrl}/chat/${chat?.chat}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        content: newPrice,
        contentType: "BiddingOffer",
        other: {
          bidding: chat?.other?.bidding,
          biddingBid: chat.other?.biddingBid,
          events: events || chat?.other?.events,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Offer sent successfully:", response);
        toast.success(isEditMode ? "Offer updated successfully!" : "Offer sent successfully!");
        // Immediately set the flag to prevent duplicate submissions
        if (!isEditMode) {
          setHasVendorOffer(true);
        }
        fetchChatMessages();
        setEvents(null);
        setSelectedEvent(0);
        setEventIndex(0);
        setEditRequirements(false);
        setExpandRequirements(false);
        setNewPrice(null);
        if (onClose) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Failed to send offer. Please try again.");
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

  // Initialize events when entering edit mode
  useEffect(() => {
    if (editRequirements && !events) {
      const initialEvents = chat?.contentType === "BiddingBid"
        ? bidding?.events
        : chat?.other?.events;
      
      console.log("useEffect trying to initialize events");
      console.log("editRequirements:", editRequirements);
      console.log("events:", events);
      console.log("initialEvents:", initialEvents);
      
      if (initialEvents && initialEvents.length > 0) {
        console.log("Setting events from useEffect");
        setEvents(JSON.parse(JSON.stringify(initialEvents))); // Deep clone
      } else {
        console.log("No initialEvents available yet");
      }
    }
  }, [editRequirements, chat, bidding, events]);

  // Initialize newPrice from chat content
  useEffect(() => {
    if ((newPrice === null || newPrice === undefined) && chat?.content) {
      setNewPrice(chat?.content);
    }
  }, [chat, newPrice]);
  return (
    <>
      <div className="bg-[#2B3F6C] text-white flex flex-row items-center p-3 sm:p-4">
        <div className="text-[10px] sm:text-xs text-left flex-1 min-w-0 px-1">
              Best offer
          <br />
          <span className="text-xs sm:text-base font-medium whitespace-nowrap">
            {bidding?.bids && bidding.bids.length > 0 
              ? toPriceString(Math.min(...bidding.bids.map(bid => bid.bid).filter(bid => bid > 0)))
              : "NULL"
            }
          </span>
        </div>
        <div className="w-px h-8 bg-white mx-1 sm:mx-2"></div>
        <div className="text-[10px] sm:text-xs text-left flex-1 min-w-0 px-1">
              Your offer
          <br />
          <span className="text-xs sm:text-base font-medium whitespace-nowrap">
            {toPriceString(parseInt(chat?.content))}
          </span>
        </div>
        <div className="w-px h-8 bg-white mx-1 sm:mx-2"></div>
        <div className="text-[10px] sm:text-xs text-left flex-1 min-w-0 px-1">
          Edit
          <br /> requirement
    </div>
        <MdEdit
          className="flex-shrink-0 border border-[#2B3F6C] text-[#2B3F6C] bg-white p-1 rounded-md cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            console.log("🔴 EDIT BUTTON CLICKED!");
            
            // Try to get events from multiple sources
            let eventsData = null;
            
            if (chat?.contentType === "BiddingBid" && bidding?.events) {
              eventsData = bidding?.events;
            } else if (chat?.other?.events) {
              eventsData = chat?.other?.events;
            } else if (bidding?.events) {
              // Fallback to bidding events
              eventsData = bidding?.events;
            }
            
            console.log("=== Edit button clicked ===");
            console.log("chat:", chat);
            console.log("chat?.contentType:", chat?.contentType);
            console.log("bidding:", bidding);
            console.log("bidding?.events:", bidding?.events);
            console.log("chat?.other?.events:", chat?.other?.events);
            console.log("eventsData to set:", eventsData);
            console.log("expandRequirements BEFORE:", expandRequirements);
            console.log("editRequirements BEFORE:", editRequirements);
            console.log("=========================");
            
            // Always set edit mode to true and expand
            setExpandRequirements(true);
            setEditRequirements(true);
            
            console.log("setExpandRequirements(true) called");
            console.log("setEditRequirements(true) called");
            
            if (eventsData && eventsData.length > 0) {
              setEvents(JSON.parse(JSON.stringify(eventsData))); // Deep clone
      setNewPrice(chat?.content);
              setEventIndex(0);
            } else {
              // Show alert but keep edit mode active so debug message shows
              console.log("No event data found!");
            }
          }}
          size={24}
        />
        {expandRequirements ? (
          <MdOutlineKeyboardArrowUp
            className="flex-shrink-0 border border-[#2B3F6C] text-[#2B3F6C] bg-white p-1 rounded-md"
              onClick={() => {
              setExpandRequirements(false);
              setEditRequirements(false);
            }}
            size={20}
          />
        ) : (
          <MdOutlineKeyboardArrowDown
            className="flex-shrink-0 border border-white bg-white text-[#2B3F6C] p-1 rounded-md"
            onClick={() => {
              // Just expand to view mode, not edit mode
              setExpandRequirements(true);
              setEditRequirements(false);
            }}
            size={20}
          />
      )}
      </div>
      {expandRequirements && !editRequirements && (
        <div className="bg-[#E7EFFF] p-3 sm:p-4">
          <div className="flex flex-row gap-2 mb-2 overflow-x-auto hide-scrollbar">
            {((chat?.contentType === "BiddingBid" ? bidding?.events : chat?.other?.events) || []).map((item, index) => (
              <div
              key={index}
                className={`cursor-pointer px-4 sm:px-6 py-1 font-medium rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                selectedEvent === index
                  ? "bg-[#2B3F6C] text-white"
                  : "bg-white text-[#2B3F6C]"
              }`}
              onClick={() => {
                setSelectedEvent(index);
              }}
            >
                {item.eventName || `Day ${index + 1}`}
              </div>
          ))}
          </div>
          {((chat?.contentType === "BiddingBid" ? bidding?.events : chat?.other?.events) || [])
          ?.filter((_, index) => index === selectedEvent)
            ?.map((item, index) => (
              <>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start text-xs sm:text-sm mt-4 sm:mt-6 mb-4 font-medium">
                  <p className="my-0 py-0 flex flex-row items-center gap-1 flex-1 min-w-0">
                    <MdOutlineLocationOn className="flex-shrink-0 text-base" />{" "}
                    <span className="break-words">{item?.location}</span>
                  </p>
                  <p className="text-left sm:text-right flex-shrink-0">
                    {new Date(item?.date)?.toLocaleDateString("en-GB", {
                      day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                  </p>
              </div>
                {item?.peoples?.map((rec, recIndex) => (
                  <>
                    <div
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start text-xs sm:text-sm font-medium"
                      key={`recIndex+`}
                    >
                      <p className="my-0 py-0 flex flex-row items-center gap-1">
                        <MdPersonOutline className="flex-shrink-0 text-base" />{" "}
                        {rec?.noOfPeople}
                      </p>
                      <p className="">{rec.makeupStyle}</p>
                      <p className="">{rec.preferredLook}</p>
                    </div>
                    <div
                      className="flex flex-row gap-2 sm:gap-4 items-top text-xs sm:text-sm font-medium mb-2"
                      key={`recIndex-`}
                    >
                      <p className="my-0 py-0 flex flex-row items-center gap-1">
                        <RxDashboard className="flex-shrink-0 text-base" />{" "}
                        <span className="break-words">{rec?.addOns}</span>
                      </p>
                    </div>
                  </>
                ))}
                {item?.notes?.length > 0 && (
                  <>
                    <p className="text-xs text-[#2B3F6C] font-medium mt-4 sm:mt-6">
                      NOTES
                    </p>
                    <div className="border rounded-lg text-xs p-2 bg-white break-words">
                      {item?.notes?.join("\n")}
                    </div>
                  </>
                )}
              </>
            ))}
          <div className="py-2 flex flex-row gap-3 sm:gap-4 justify-center items-center mt-4">
            {((chat?.contentType === "BiddingBid" ? bidding?.events : chat?.other?.events) || []).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 border border-black rounded-full ${
                  selectedEvent === index ? "bg-black" : "bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {expandRequirements && editRequirements && !events && (
        <div className="bg-[#E7EFFF] p-4 text-center">
          <p className="text-sm text-red-600">Debug: No events state available</p>
          <p className="text-xs text-gray-600">expandRequirements: {expandRequirements.toString()}</p>
          <p className="text-xs text-gray-600">editRequirements: {editRequirements.toString()}</p>
          <p className="text-xs text-gray-600">events: {JSON.stringify(events)}</p>
          <p className="text-xs text-gray-600">chat.other.events: {JSON.stringify(chat?.other?.events)}</p>
          <p className="text-xs text-gray-600">bidding.events: {JSON.stringify(bidding?.events)}</p>
            </div>
      )}
      {expandRequirements && editRequirements && events && events.length > 0 && (
        <div className="bg-[#E7EFFF] p-3 sm:p-4">
          <div className="flex flex-row gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {events?.map((item, index) => (
                  <button
                    key={index}
                className={`px-4 sm:px-6 py-2 font-medium rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  eventIndex === index
                        ? "bg-[#2B3F6C] text-white"
                    : "bg-white text-[#2B3F6C] border border-[#2B3F6C]"
                }`}
                onClick={() => setEventIndex(index)}
              >
                    {item?.eventName || `Day ${index + 1}`}
                  </button>
            ))}
                <button
              onClick={() => {
                setEvents([
                  ...events,
                  {
                    eventName: "",
                    date: "",
                    time: "",
                    location: "",
                    address: {},
                    notes: [],
                    peoples: [{
                        noOfPeople: "",
                        makeupStyle: "",
                        preferredLook: "",
                        addOns: "",
                    }],
                  },
                ]);
                setEventIndex(events.length);
              }}
              className="px-4 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm bg-gray-700 text-white border-2 whitespace-nowrap flex-shrink-0"
            >
              + Add
                </button>
            {events.length > 1 && (
                <button
                onClick={() => {
                  setEvents(events.filter((_, i) => i !== eventIndex));
                  setEventIndex(0);
                }}
                className="p-1.5 sm:p-2 rounded-lg bg-white border text-[#2B3F6C] hover:bg-red-50 flex-shrink-0"
                >
                  <MdDelete size={20} className="sm:w-6 sm:h-6" />
                </button>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
                  <div>
              <Label value="Event Name" />
              <TextInput
                value={events[eventIndex]?.eventName || ""}
                onChange={(e) => {
                  const updated = [...events];
                  updated[eventIndex] = { ...updated[eventIndex], eventName: e.target.value };
                  setEvents(updated);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <Label value="Date" />
                <TextInput
                type="date"
                  value={events[eventIndex]?.date || ""}
                onChange={(e) => {
                    const updated = [...events];
                    updated[eventIndex] = { ...updated[eventIndex], date: e.target.value };
                    setEvents(updated);
                }}
              />
            </div>
            <div>
                <Label value="Time" />
                <TextInput
                type="time"
                  value={events[eventIndex]?.time || ""}
                onChange={(e) => {
                    const updated = [...events];
                    updated[eventIndex] = { ...updated[eventIndex], time: e.target.value };
                    setEvents(updated);
                }}
              />
            </div>
                  </div>

                  <div>
              <Label value="Location" />
              <TextInput
                ref={inputRef}
                value={events[eventIndex]?.location || ""}
                onChange={(e) => {
                  const updated = [...events];
                  updated[eventIndex] = { ...updated[eventIndex], location: e.target.value };
                  setEvents(updated);
                }}
              />
            </div>

            {events[eventIndex]?.peoples?.map((person, personIdx) => (
              <div key={personIdx} className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
              <div>
                  <TextInput
                    icon={MdPersonOutline}
                    placeholder="Number of people"
                              value={person?.noOfPeople || ""}
                  onChange={(e) => {
                      const updated = [...events];
                      updated[eventIndex].peoples[personIdx].noOfPeople = e.target.value;
                      setEvents(updated);
                    }}
                  />
              </div>
              <div>
                  <Select
                            value={person?.makeupStyle || ""}
                  onChange={(e) => {
                      const updated = [...events];
                      updated[eventIndex].peoples[personIdx].makeupStyle = e.target.value;
                      setEvents(updated);
                    }}
                  >
                    <option value="">Select Makeup Style</option>
                    {makeupStyle?.map((style, i) => (
                      <option key={i} value={style?.title}>{style?.title}</option>
                    ))}
                  </Select>
              </div>
              <div>
                  <Select
                            value={person?.preferredLook || ""}
                  onChange={(e) => {
                      const updated = [...events];
                      updated[eventIndex].peoples[personIdx].preferredLook = e.target.value;
                      setEvents(updated);
                    }}
                  >
                    <option value="">Select Preferred Look</option>
                    {preferredLook?.map((look, i) => (
                      <option key={i} value={look?.title}>{look?.title}</option>
                    ))}
                  </Select>
              </div>
              <div>
                  <Select
                            value={person?.addOns || ""}
                  onChange={(e) => {
                      const updated = [...events];
                      updated[eventIndex].peoples[personIdx].addOns = e.target.value;
                      setEvents(updated);
                    }}
                  >
                    <option value="">Select Add-ons</option>
                    {addOns?.map((addon, i) => (
                      <option key={i} value={addon?.title}>{addon?.title}</option>
                    ))}
                  </Select>
            </div>
              </div>
                  ))}

            <button
              onClick={() => {
                const updated = [...events];
                updated[eventIndex].peoples = [
                  ...updated[eventIndex].peoples,
                  { noOfPeople: "", makeupStyle: "", preferredLook: "", addOns: "" },
                ];
                setEvents(updated);
              }}
              className="w-full py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm bg-[#2B3F6C] text-white"
            >
              + Add more people
            </button>

            {events[eventIndex]?.notes?.length > 0 && (
              <div>
                <Label value="Notes" />
                {events[eventIndex]?.notes?.map((note, noteIdx) => (
                  <TextInput
                    key={noteIdx}
                    className="mb-2"
                    value={note}
                    onChange={(e) => {
                      const updated = [...events];
                      updated[eventIndex].notes[noteIdx] = e.target.value;
                      setEvents(updated);
                    }}
                  />
                ))}
          </div>
        )}
      
            <button
              onClick={() => {
                const updated = [...events];
                updated[eventIndex].notes = [...(updated[eventIndex].notes || []), ""];
                setEvents(updated);
            }}
              className="w-full py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm bg-[#2B3F6C] text-white"
          >
              + Add Notes
          </button>

            <div>
              <Label value="Enter new Price" className="text-xs sm:text-sm" />
              <TextInput
                icon={MdCurrencyRupee}
                value={newPrice || ""}
                onChange={(e) => setNewPrice(e.target.value)}
                className="text-sm sm:text-base"
              />
          </div>

            <button
              onClick={() => {
                console.log("Sending updated events:", events);
                console.log("Sending updated price:", newPrice);
                CreateBiddingOffer(true); // Pass true for isEditMode
              }}
              className="w-full bg-[#2B3F6C] text-white rounded-lg px-8 sm:px-16 py-2 sm:py-3 font-medium text-sm sm:text-base"
            >
              Update & Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ChatMessage({ chat }) {
  const [order, setOrder] = useState(null);
  const [bidding, setBidding] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [fetchingBidding, setFetchingBidding] = useState(false);
  
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
    if (chat?.sender?.role === "user") {
      return (
        <div className="p-2 bg-[#f5f5f5] rounded-xl rounded-bl-none shadow self-start px-4 sm:px-6 max-w-[85%] sm:max-w-[70%] text-sm sm:text-base">
          {chat?.content}
        </div>
      );
    } else if (chat?.sender?.role === "vendor") {
      return (
        <div className="p-2 bg-[#2B3F6C] text-white rounded-xl rounded-br-none shadow self-end px-4 sm:px-6 max-w-[85%] sm:max-w-[70%] text-sm sm:text-base">
          {chat?.content}
        </div>
      );
    }
  } else if (chat?.contentType === "PersonalPackageAccepted") {
    return (
      <>
        {order?._id && order?.amount?.due === 0 && (
          <div className="bg-[#2C7300] text-white text-center py-2 text-sm sm:text-base">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        {order?._id && (
          <div className="p-2 bg-white shadow self-end px-4 underline cursor-pointer text-[#2B3F6C] text-sm font-medium my-1">
            View details
            {/* --PendingWork-- */}
          </div>
        )}
        <div className="p-3 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-4 sm:px-6 max-w-[85%] sm:max-w-full">
          <p className="text-xs sm:text-sm mb-1">Package price</p>
          <p className="text-xl sm:text-2xl font-semibold">
            {toPriceString(order?.amount?.total)}
          </p>
        </div>
        <div className="bg-[#2C7300] text-white text-center py-2 text-sm sm:text-base">
          Package request accepted
        </div>
      </>
    );
  } else if (chat?.contentType === "BiddingBid") {
    return (
      <>
        {chat?.other?.rejected && (
          <div className="bg-gray-600 text-white text-center py-2 text-sm sm:text-base">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="bg-[#2C7300] text-white text-center py-2 text-sm sm:text-base">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="p-2 bg-white shadow self-end px-4 underline cursor-pointer text-[#2B3F6C] text-sm font-medium my-1">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="p-3 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-4 sm:px-6 max-w-[85%] sm:max-w-full">
          <p className="text-xs sm:text-sm mb-1">Offer received</p>
          <p className="text-xl sm:text-2xl font-semibold">
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
          <div className="bg-gray-600 text-white text-center py-2 text-sm sm:text-base">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="bg-[#2C7300] text-white text-center py-2 text-sm sm:text-base">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="p-2 bg-white shadow self-end px-4 underline cursor-pointer text-[#2B3F6C] text-sm font-medium my-1">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="p-3 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-4 sm:px-6 max-w-[85%] sm:max-w-full">
          <p className="text-xs sm:text-sm mb-1">Offer received</p>
          <p className="text-xl sm:text-2xl font-semibold">
            {toPriceString(parseInt(chat?.content))}
          </p>
        </div>
        <div className="bg-gray-200 text-center py-2 text-sm sm:text-base">
          Here&apos;s your custom offer
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
  const [displayRequirements, setDisplayRequirements] = useState(null);
  const [hasVendorOffer, setHasVendorOffer] = useState(false);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [newPrice, setNewPrice] = useState(null);
  const router = useRouter();
  const { chatId } = router.query;
  const activeControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  const fetchChatMessages = (showSpinner = true) => {
    if (!chatId) return;
    
    if (showSpinner) setLoading(true);

    console.log("Chat ID:", chatId);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
    console.log("fetchChatMessages - API URL:", apiUrl);
    
    fetch(`${apiUrl}/chat/${encodeURIComponent(chatId)}`, {
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
          let display = null;
          let vendorOfferExists = false;
          
          // Get current vendor ID from chat participants
          const currentVendorId = response?.participants?.find(p => p?.role === "vendor")?._id;
          console.log("Current vendor ID:", currentVendorId);
          
          for (let i = (response?.messages?.length || 0) - 1; i >= 0; i--) {
            let temp = response?.messages[i];
            
            // Check if vendor has already made an offer
            if (temp?.contentType === "BiddingOffer") {
              console.log("Found BiddingOffer at index", i, ":", temp);
              console.log("Sender:", temp?.sender);
              console.log("Sender ID:", temp?.sender?._id);
              console.log("Sender role:", temp?.sender?.role);
              
              // Check if this offer is from the current vendor
              if (
                temp?.sender?.role === "vendor" ||
                temp?.sender?._id === currentVendorId ||
                temp?.sender?._id?.toString() === currentVendorId?.toString()
              ) {
                console.log("This is a vendor offer!");
                vendorOfferExists = true;
              }
            }
            
            if (
              temp?.contentType === "BiddingBid" ||
              temp?.contentType === "BiddingOffer"
            ) {
              display = temp;
              break;
            }
          }
          console.log("Final vendorOfferExists:", vendorOfferExists);
          setDisplayRequirements(display);
          setHasVendorOffer(vendorOfferExists);
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
  console.log("chatId: last", chatId);

  // Derive high-level status for UI color coding
  const deriveStatus = useCallback(() => {
    const dr = displayRequirements;
    if (!dr) return { label: "ONGOING", color: "bg-yellow-100 text-yellow-800" };
    if (dr?.other?.cancelled) return { label: "CANCELLED", color: "bg-red-100 text-red-800" };
    const eventDateStr = dr?.other?.events?.[0]?.date || dr?.events?.[0]?.date;
    const eventDate = eventDateStr ? new Date(eventDateStr) : null;
    const now = new Date();
    if (dr?.other?.order) {
      if (!eventDate || eventDate >= now) {
        return { label: "FINALIZED", color: "bg-green-100 text-green-800" };
      }
      return { label: "COMPLETED", color: "bg-green-100 text-green-800" };
    }
    return { label: "ONGOING", color: "bg-yellow-100 text-yellow-800" };
  }, [displayRequirements]);
  
  useEffect(() => {
    const onFocus = () => { if (chatId) fetchChatMessages(false); };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && chatId) fetchChatMessages(false);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [chatId]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex flex-col h-full">
        <div className="sticky top-0 w-full flex flex-row items-center gap-2 sm:gap-3 px-3 sm:px-6 border-b py-3 shadow-lg bg-white z-10">
          <BackIcon />
          <Avatar size="sm" rounded img={chat?.user?.profilePhoto} />
          <p className="grow text-base sm:text-lg font-semibold text-custom-dark-blue truncate">
            {chat?.user?.name}
          </p>
        {/* Status Chip */}
        {(() => { const s = deriveStatus(); return (
          <span className={`text-xs sm:text-sm px-2 py-1 rounded-md whitespace-nowrap ${s.color}`}>{s.label}</span>
        ); })()}
        </div>
        {displayRequirements?._id && (
          <BiddingRequirement
            chat={displayRequirements}
            fetchChatMessages={fetchChatMessages}
            hasVendorOffer={hasVendorOffer}
          />
        )}
        <div
          id="chat-container"
          className="flex-1 overflow-y-auto p-2 bg-white flex flex-col-reverse gap-2 hide-scrollbar"
        >
          {(() => {
            const cutoff = Date.now() - 60 * 1000;
            const filtered = (chat?.messages || []).filter((m) => {
              const ts = m?.createdAt ? new Date(m.createdAt).getTime() : 0;
              return ts >= cutoff;
            });
            return filtered.length > 0 ? (
              filtered.map((item) => (
                <ChatMessage chat={item} key={item?._id || item?.id || Math.random()} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No messages yet</div>
            );
          })()}
        </div>
        <div className="bg-white sticky bottom-0">
          {showMakeOffer && displayRequirements?._id && (
            <div className="p-3 sm:p-4 border-t">
              <div className="bg-[#2B3F6C] rounded-3xl p-3 sm:p-4">
                <label className="block text-white text-xs sm:text-sm font-semibold mb-2">
                  Make offer
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                    <span className="text-[#2B3F6C] text-base sm:text-lg font-semibold">₹</span>
                    <input
                      type="number"
                      className="flex-1 border-0 bg-transparent text-[#2B3F6C] text-base sm:text-lg font-semibold focus:outline-none focus:ring-0 min-w-0"
                      value={newPrice ?? ""}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter amount"
                />
              </div>
                  <button
                    onClick={() => {
                      // Validate price
                      if (!newPrice || newPrice <= 0) {
                        toast.error("Please enter a valid price.");
                        return;
                      }

                      // Check if vendor has already made an offer
                      if (hasVendorOffer) {
                        toast.warning("You have already made an offer. You can only make one offer per chat.");
                        return;
                      }
                      
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
                      fetch(`${apiUrl}/chat/${displayRequirements?.chat}/content`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                          content: newPrice,
                          contentType: "BiddingOffer",
                          other: {
                            bidding: displayRequirements?.other?.bidding,
                            biddingBid: displayRequirements.other?.biddingBid,
                            events: displayRequirements?.other?.events,
                          },
                        }),
                      })
                        .then((response) => response.json())
                        .then((response) => {
                          console.log("New offer sent successfully:", response);
                          toast.success("Offer sent successfully!");
                          // Immediately set the flag to prevent duplicate submissions
                          setHasVendorOffer(true);
                          fetchChatMessages();
                          setNewPrice(null);
                          setShowMakeOffer(false);
                        })
                        .catch((error) => {
                          console.error("There was a problem with the fetch operation:", error);
                          toast.error("Failed to send offer. Please try again.");
                        });
                    }}
                    className="flex-shrink-0 bg-white rounded-full p-2 hover:bg-gray-100 transition"
                  >
                    <IoArrowUpCircle className="text-[#2B3F6C]" size={32} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="p-2 sm:p-3">
          <input
            id="messageInput"
            type="text"
            placeholder="Send message here..."
              className="flex-1 rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-0 focus:ring-0 focus:ring-offset-0 bg-[#F2F2F2] w-full mb-2"
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
            <div className="flex items-center justify-between px-1 sm:px-2">
          <button
              type="button"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowMakeOffer(!showMakeOffer)}
              >
                <BiRupee size={22} className="sm:w-6 sm:h-6" />
          </button>
              <button type="button" className="p-1.5 sm:p-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800">
              Aa
            </button>
            <button
                className="ml-auto inline-flex items-center justify-center rounded-full bg-[#2B3F6C] text-white h-9 w-9 sm:h-10 sm:w-10 disabled:bg-[#A9B4D3]"
                disabled={loading || !content.trim()}
                onClick={CreateChatMessage}
              >
                <VscSend size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          </div>
      </div>
    </>
  );
}
