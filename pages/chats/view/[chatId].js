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
} from "react-icons/md";
import { useRouter } from "next/router";
import { Avatar, Label, Select, TextInput } from "flowbite-react";
import { formatMessageTime } from "@/utils/chat";
import { VscSend } from "react-icons/vsc";
import { toPriceString } from "@/utils/text";
import { RxDashboard } from "react-icons/rx";
import { loadGoogleMaps } from "@/utils/loadGoogleMaps";

function BiddingRequirement({ chat, fetchChatMessages }) {
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
        setEditRequirements(false);
        setExpandRequirements(false);
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
  return (
    <>
      <div className="bg-[#2B3F6C] text-white flex flex-row items-center p-4">
        <div className="text-xs text-left  flex-1">
          Best offer
          <br />
          <span className="text-base font-medium">
            {bidding?.bids && bidding.bids.length > 0 
              ? toPriceString(Math.min(...bidding.bids.map(bid => bid.bid).filter(bid => bid > 0)))
              : "NULL"
            }
          </span>
        </div>
        <div className="w-px h-8 bg-white mx-2"></div>
        <div className="text-xs text-left px-2 flex-1">
          Your offer
          <br />
          <span className="text-base font-medium">
            {toPriceString(parseInt(chat?.content))}
          </span>
        </div>
        <div className="w-px h-8 bg-white mx-2"></div>
        <div className="text-xs text-left pr-2 flex-1">
          Edit
          <br /> Requirements
        </div>
        {!editRequirements && (
          <MdEdit
            className="flex-shrink-0 border border-[#2B3F6C] text-[#2B3F6C] bg-white p-1 m-1 rounded-md"
            onClick={() => {
              setExpandRequirements(true);
              setEditRequirements(true);
              setEvents(
                chat?.contentType === "BiddingBid"
                  ? bidding?.events
                  : chat?.other?.events
              );
              setNewPrice(chat?.content);
              setEventIndex(0);
            }}
            size={24}
          />
        )}
        {expandRequirements ? (
          <MdOutlineKeyboardArrowUp
            className="flex-shrink-0 border border-[#2B3F6C] text-[#2B3F6C] bg-white p-1 m-1 rounded-md"
            onClick={() => {
              setExpandRequirements(false);
            }}
            size={24}
          />
        ) : (
          <MdOutlineKeyboardArrowDown
            className="flex-shrink-0 border border-white bg-white text-[#2B3F6C] p-1 m-1 rounded-md"
            onClick={() => {
              setExpandRequirements(true);
            }}
            size={24}
          />
        )}
      </div>
      {expandRequirements && !editRequirements && (
        <div className="bg-[#E7EFFF] p-4">
          <div className="flex flex-row gap-2 mb-2">
            {((chat?.contentType === "BiddingBid" ? bidding?.events : chat?.other?.events) || []).map((item, index) => (
              <div
                key={index}
                className={`cursor-pointer px-6 py-1 font-medium rounded-full text-sm ${
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
                <div className="flex flex-row gap-4 items-top text-sm mt-6 mb-4 font-medium">
                  <p className="my-0 py-0 flex flex-row items-center gap-1">
                    <MdOutlineLocationOn className="flex-shrink-0 text-base" />{" "}
                    {item?.location}
                  </p>
                  <p className="text-right flex-shrink-0">
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
                      className="flex flex-row gap-4 items-top text-sm font-medium"
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
                      className="flex flex-row gap-4 items-top text-sm font-medium mb-2"
                      key={`recIndex-`}
                    >
                      <p className="my-0 py-0 flex flex-row items-center gap-1">
                        <RxDashboard className="flex-shrink-0 text-base" />{" "}
                        {rec?.addOns}
                      </p>
                    </div>
                  </>
                ))}
                {item?.notes?.length > 0 && (
                  <>
                    <p className="text-xs text-[#2B3F6C] font-medium mt-6">
                      NOTES
                    </p>
                    <div className="border rounded-lg text-xs p-2 bg-white">
                      {item?.notes?.join("\n")}
                    </div>
                  </>
                )}
              </>
            ))}
          <div className="py-2 flex flex-row gap-4 justify-center items-center mt-4">
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
      {expandRequirements && editRequirements && (
        <div className="bg-[#E7EFFF] flex md:hidden flex-col">
          <div className="grid grid-cols-3 gap-4 p-4 items-center border-b-4 border-b-white">
            {events?.map((item, index) => (
              <div
                className={`relative p-2 rounded-full font-medium text-center border ${
                  eventIndex === index
                    ? "border-[#2B3F6C] bg-[#2B3F6C] text-white"
                    : "border-[#2B3F6C] bg-white text-[#2B3F6C]"
                }`}
                key={index}
                onClick={() => {
                  setEventIndex(index);
                }}
              >
                {item?.eventName || `Event ${index + 1}`}
              </div>
            ))}
            <div
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
              className={`p-2 rounded-full font-medium text-center border-2 bg-gray-700 text-white cursor-pointer`}
            >
              + Add
            </div>
            {events.length > 1 && (
              <MdDelete
                className={`h-10 w-10 p-2 rounded-lg bg-white border ml-auto col-start-3 text-[#2B3F6C]`}
                onClick={() => {
                  let tempCount = parseInt(eventsCount);
                  tempCount--;
                  setEventIndex(0);
                  setEventsCount(String(tempCount));
                  setEvents(
                    events.filter((_, recIndex) => recIndex !== eventIndex)
                  );
                }}
                cursor={"pointer"}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 border-b-4 border-b-white">
            <div className="col-span-2">
              <Label value="Event Name" />
              <TextInput
                value={events[eventIndex]?.eventName}
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
            <div>
              <Label value="Date" />
              <TextInput
                type="date"
                value={events[eventIndex]?.date}
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
              <Label value="Time" />
              <TextInput
                type="time"
                value={events[eventIndex]?.time}
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
            <div className="col-span-2">
              <Label value="Location" />
              <TextInput
                ref={inputRef}
                value={events[eventIndex]?.location}
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
          </div>
          {events[eventIndex]?.peoples?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4 border-b-4 border-b-white p-4"
            >
              <div>
                <TextInput
                  icon={MdPersonOutline}
                  value={item?.noOfPeople}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                        peoples: updated[eventIndex]?.peoples.map((person, i) =>
                          i === index
                            ? {
                                ...person,
                                noOfPeople: e.target.value,
                              }
                            : person
                        ),
                      };
                      return updated;
                    });
                  }}
                />
              </div>
              <div>
                <Select
                  value={item?.makeupStyle}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                        peoples: updated[eventIndex]?.peoples.map((person, i) =>
                          i === index
                            ? {
                                ...person,
                                makeupStyle: e.target.value,
                              }
                            : person
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                  <option value={""}>Select Makeup Style</option>
                  {makeupStyle?.map((r, i) => (
                    <option value={r?.title} key={i}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  value={item?.preferredLook}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                        peoples: updated[eventIndex]?.peoples.map((person, i) =>
                          i === index
                            ? {
                                ...person,
                                preferredLook: e.target.value,
                              }
                            : person
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                  <option value={""}>Select Preferred Look</option>
                  {preferredLook?.map((r, i) => (
                    <option value={r?.title} key={i}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  value={item?.addOns}
                  onChange={(e) => {
                    setEvents((prev) => {
                      const updated = [...prev];
                      updated[eventIndex] = {
                        ...updated[eventIndex],
                        peoples: updated[eventIndex]?.peoples.map((person, i) =>
                          i === index
                            ? {
                                ...person,
                                addOns: e.target.value,
                              }
                            : person
                        ),
                      };
                      return updated;
                    });
                  }}
                >
                  <option value={""}>Select AddOns</option>
                  {addOns?.map((r, i) => (
                    <option value={r?.title} key={i}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
          {events[eventIndex]?.notes?.length > 0 && (
            <>
              <div className="border-b-4 border-b-white p-4">
                <Label value="Notes" />
                {events[eventIndex]?.notes?.map((item, index) => (
                  <TextInput
                    key={index}
                    className="mb-2"
                    value={item}
                    onChange={(e) => {
                      setEvents((prev) => {
                        const updated = [...prev];
                        updated[eventIndex] = {
                          ...updated[eventIndex],
                          notes: updated[eventIndex]?.notes.map((rec, i) =>
                            i === index ? e.target.value : rec
                          ),
                        };
                        return updated;
                      });
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4 p-4 border-b-4 border-b-white">
            <button
              onClick={() => {
                setEvents((prev) => {
                  const updated = [...prev];
                  updated[eventIndex] = {
                    ...updated[eventIndex],
                    peoples: [
                      ...updated[eventIndex]?.peoples,
                      {
                        noOfPeople: "",
                        makeupStyle: "",
                        preferredLook: "",
                        addOns: "",
                      },
                    ],
                  };
                  return updated;
                });
              }}
              className={`py-2 px-4 rounded-lg font-medium text-center bg-[#2B3F6C] text-white cursor-pointer`}
            >
              + Add more people
            </button>
            <button
              onClick={() => {
                setEvents((prev) => {
                  const updated = [...prev];
                  updated[eventIndex] = {
                    ...updated[eventIndex],
                    notes: [...updated[eventIndex]?.notes, ""],
                  };
                  return updated;
                });
              }}
              className={`py-2 px-4 rounded-lg font-medium text-center bg-[#2B3F6C] text-white cursor-pointer`}
            >
              + Add Notes
            </button>
          </div>
          <div className="p-4">
            <Label value="Enter new Price" />
            <TextInput
              icon={MdCurrencyRupee}
              value={newPrice}
              onChange={(e) => {
                setNewPrice(e.target.value);
              }}
            />
            <button
              className="bg-[#2B3F6C] text-white rounded-lg px-16 py-2  font-medium m-4 mx-auto block"
              onClick={() => {
                CreateBiddingOffer();
              }}
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
        <div className="p-2 bg-[#f5f5f5] rounded-xl rounded-bl-none shadow self-start px-6">
          {chat?.content}
        </div>
      );
    } else if (chat?.sender?.role === "vendor") {
      return (
        <div className="p-2 bg-[#2B3F6C] text-white rounded-xl rounded-br-none shadow self-end px-6">
          {chat?.content}
        </div>
      );
    }
  } else if (chat?.contentType === "PersonalPackageAccepted") {
    return (
      <>
        {order?._id && order?.amount?.due === 0 && (
          <div className="bg-[#2C7300] text-white text-center py-2">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="p-2 bg-[#F5F5F5] shadow self-end px-6 underline cursor-pointer">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="p-2 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-6">
          Package price
          <p className="text-2xl font-semibold">
            {toPriceString(order?.amount?.total)}
          </p>
        </div>
        <div className="bg-[#2C7300] text-white text-center py-2">
          Package request accepted
        </div>
      </>
    );
  } else if (chat?.contentType === "BiddingBid") {
    return (
      <>
        {chat?.other?.rejected && (
          <div className="bg-gray-600 text-white text-center py-2">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="bg-[#2C7300] text-white text-center py-2">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="p-2 bg-[#F5F5F5] shadow self-end px-6 underline cursor-pointer">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="p-2 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-6">
          Offer received
          <p className="text-2xl font-semibold">
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
          <div className="bg-gray-600 text-white text-center py-2">
            Offer Declined
          </div>
        )}
        {chat?.other?.accepted && chat?.other?.order && (
          <div className="bg-[#2C7300] text-white text-center py-2">
            Congratulations! Booking confirmed ✅
          </div>
        )}
        <div className="p-2 bg-[#F5F5F5] shadow self-end px-6 underline cursor-pointer">
          View details
          {/* --PendingWork-- */}
        </div>
        <div className="p-2 bg-[#F5F5F5] rounded-xl rounded-br-none shadow self-end px-6">
          Offer received
          <p className="text-2xl font-semibold">
            {toPriceString(parseInt(chat?.content))}
          </p>
        </div>
        <div className="bg-gray-200 text-center py-2">
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
  const [displayRequirements, setDisplayRequirements] = useState(null);
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
          for (let i = (response?.messages?.length || 0) - 1; i >= 0; i--) {
            let temp = response?.messages[i];
            if (
              temp?.contentType === "BiddingBid" ||
              temp?.contentType === "BiddingOffer"
            ) {
              display = temp;
              break;
            }
          }
          setDisplayRequirements(display);
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
      <div className="flex flex-col h-full">
        <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
          <BackIcon />
          <Avatar size="sm" rounded img={chat?.user?.profilePhoto} />
          <p className="grow text-lg font-semibold text-custom-dark-blue">
            {chat?.user?.name}
          </p>
        </div>
        {displayRequirements?._id && (
          <BiddingRequirement
            chat={displayRequirements}
            fetchChatMessages={fetchChatMessages}
          />
        )}
        <div
          id="chat-container"
          className="flex-1 overflow-y-auto p-2 bg-white flex flex-col-reverse gap-2 hide-scrollbar"
        >
          {/* {console.log("Rendering messages:", chat?.messages)} */}
          {chat?.messages?.length > 0 ? (
            chat?.messages?.map((item, index) => {
              {/* console.log(`Rendering message ${index}:`, item); */}
              return <ChatMessage chat={item} key={index} />;
            })
          ) : (
            <div className="text-center text-gray-500 py-4">
              No messages yet
            </div>
          )}
        </div>
        <div className="p-2 flex items-center gap-2 bg-white sticky bottom-0">
          {/* Debug: Current content state */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              Content: &quot;{content}&quot; | Length: {content.length}
            </div>
          )}
          <input
            id="messageInput"
            type="text"
            placeholder="Send message here..."
            className="flex-1 rounded-full px-4 py-2 focus:outline-0 focus:ring-0 focus:ring-offset-0 bg-[#F2F2F2]"
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
            className="inline-flex items-center justify-center rounded-full bg-[#2B3F6C] text-white h-10 w-10 disabled:bg-[#A9B4D3]"
            disabled={loading || !content.trim()}
            onClick={CreateChatMessage}
          >
            <VscSend size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
