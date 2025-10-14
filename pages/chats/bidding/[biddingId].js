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
import {
  Avatar,
  Button,
  Label,
  Modal,
  Textarea,
  TextInput,
} from "flowbite-react";
import { RxDashboard } from "react-icons/rx";
import { toPriceString } from "@/utils/text";
import SwipeToAccept from "@/components/button/SwipeToAcceptButton";

export default function Home({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bidding, setBidding] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const { biddingId } = router.query;
  const [bid, setBid] = useState("");
  const [notes, setNotes] = useState("");
  const [accept, setAccept] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingAmount, setBookingAmount] = useState({});
  const [wedsyAmount, setWedsyAmount] = useState(0);
  const [vendorAmount, setVendorAmount] = useState(0);
  const [additionalNotes, setAdditionalNotes] = useState([]);
  const [showPayableToWedsy, setShowPayableToWedsy] = useState(false);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [isQuoteFocused, setIsQuoteFocused] = useState(false);
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const fetchBookingAmount = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/config?code=MUA-BookingAmount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setBookingAmount(response.data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchBidding = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order?source=Bidding&biddingId=${biddingId}`,
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
          setBidding(response[0] || {});
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const RejectBiddingBid = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${biddingId}/reject-bidding-bid`,
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
  const AcceptBiddingBid = () => {
    const allNotes = [notes, ...additionalNotes].filter(note => note.trim() !== "");
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${biddingId}/accept-bidding-bid`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          bid: parseInt(bid) || 0, 
          vendor_notes: allNotes.join(" | ")
        }),
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
          setBidSubmitted(true);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addNote = () => {
    setShowAddNoteInput(true);
    setNewNote("");
  };

  const saveNote = () => {
    if (newNote.trim() !== "") {
      setAdditionalNotes([...additionalNotes, newNote.trim()]);
    }
    setShowAddNoteInput(false);
    setNewNote("");
  };

  const cancelAddNote = () => {
    setShowAddNoteInput(false);
    setNewNote("");
  };

  const updateNote = (index, value) => {
    const newNotes = [...additionalNotes];
    newNotes[index] = value;
    setAdditionalNotes(newNotes);
  };

  const removeNote = (index) => {
    const newNotes = additionalNotes.filter((_, i) => i !== index);
    setAdditionalNotes(newNotes);
  };

  const handleDeclineConfirm = () => {
    RejectBiddingBid();
    setShowDeclineConfirm(false);
  };

  const handleDeclineCancel = () => {
    setShowDeclineConfirm(false);
  };

  const handleMakeOffer = () => {
    setShowDeclineConfirm(false);
    setAccept(true);
  };

  const handleBidChange = (value) => {
    setBid(value);
    if (value && parseInt(value) > 0) {
      setShowPayableToWedsy(true);
      // Calculate Wedsy amount as 10% of vendor amount
      let A = parseInt(value) || 0;
      let wA = A * 0.1; // 10% of the bid amount
      let vA = A - wA; // 90% goes to vendor
      setWedsyAmount(wA);
      setVendorAmount(vA);
    } else {
      setShowPayableToWedsy(false);
    }
  };
  useEffect(() => {
    if (biddingId) {
      fetchBidding();
      fetchBookingAmount();
    }
  }, [biddingId]);
  useEffect(() => {
    if (confirm) {
      let wA = 0;
      let vA = 0;
      let A = parseInt(bid) || 0;
      if (bookingAmount?.bidding?.bookingAmount === "percentage") {
        let p = bookingAmount?.bidding?.percentage;
        wA = A * (p / 100);
        vA = A * (1 - p / 100);
      } else if (bookingAmount?.bidding?.bookingAmount === "condition") {
        for (let conditionObj of bookingAmount?.bidding?.condition) {
          // Check the condition type and compare the value
          if (
            (conditionObj.condition === "lt" && bid < conditionObj.value) ||
            (conditionObj.condition === "lte" && bid <= conditionObj.value) ||
            (conditionObj.condition === "eq" && bid === conditionObj.value) ||
            (conditionObj.condition === "gte" && bid >= conditionObj.value) ||
            (conditionObj.condition === "gt" && bid > conditionObj.value)
          ) {
            if (conditionObj.bookingAmount === "amount") {
              wA = conditionObj.amount;
              vA = A - conditionObj.amount;
            } else if (conditionObj.bookingAmount === "percentage") {
              let p = conditionObj.percentage;
              wA = A * (p / 100);
              vA = A * (1 - p / 100);
            }
          }
        }
      }
      setWedsyAmount(wA);
      setVendorAmount(vA);
    }
  }, [confirm]);
  return (
    <>
      <Modal
        dismissible
        show={success}
        onClose={() => {
          setSuccess(false);
          fetchBidding();
        }}
        position={"center"}
      >
        <Modal.Body>
          <div className="relative h-full px-4 py-24 flex flex-col justify-center items-center gap-6">
            <MdClear
              onClick={() => {
                setSuccess(false);
                fetchBidding();
              }}
              className="absolute top-2 right-2"
              size={24}
            />
            <p className="text-xl font-semibold">Bid sent succesfully</p>
            <p>{"You’ll be notified when customer accepts the bid!"}</p>
          </div>
        </Modal.Body>
      </Modal>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-black">
          {bidding?.bidding?.user?.name}
        </p>
      </div>
      <div className="bg-[#E7EFFF] p-4">
        <div className="flex flex-row gap-2 mb-2 overflow-x-auto">
          {bidding?.bidding?.events?.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer px-6 py-1 font-medium rounded-full text-sm whitespace-nowrap ${
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

        {/* enquire first card section */}
        <div className="overflow-x-auto">
          <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${selectedEvent * 100}%)` }}>
            {bidding?.bidding?.events?.map((item, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                <div className="flex flex-row justify-between items-top text-sm mt-6 mb-4 font-medium">
                  <p className="my-0 py-0 flex flex-row items-center gap-2">
                    <MdOutlineLocationOn className="flex-shrink-0 text-base" />
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
                  <div key={recIndex}>
                    <div className="flex flex-row gap-4 items-top text-sm font-medium">
                      <p className="my-0 py-0 flex flex-row items-center gap-2">
                        <MdPersonOutline className="flex-shrink-0 text-base" />
                        {rec?.noOfPeople}
                      </p>
                      <p className="">{rec.makeupStyle}</p>
                      <p className="">{rec.preferredLook}</p>
                    </div>
                    <div className="flex flex-row gap-4 items-top text-sm font-medium mb-2">
                      <p className="my-0 py-0 flex flex-row items-center gap-2">
                        <RxDashboard className="flex-shrink-0 text-base" />
                        {rec?.addOns}
                      </p>
                    </div>
                  </div>
                ))}
                {item?.notes?.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-[#2B3F6C] mt-6 mb-2">
                      NOTES
                    </p>
                    <div className="bg-[#FFDA57] rounded-lg text-xs p-3 text-black break-words whitespace-pre-wrap min-h-[2rem]">
                      {item?.notes?.join("\n")}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {/*end */}


        {/*dot */}
        <div className="py-2 flex flex-row gap-4 justify-center items-center mt-4">
          {bidding?.bidding?.events?.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 border border-black rounded-full ${
                selectedEvent === index ? "bg-black" : "bg-white"
              }`}
            />
          ))}
        </div>


        {/*end */}
      </div>


      {/*best bid received section */}
      {bidding?.lowestBid?.bid && (
        <div className="py-3 flex flex-row gap-8 justify-center items-center bg-[#2B3F6C] text-white">
          <span className="font-semibold">Best Bid Received</span>
          <span className="font-semibold">{toPriceString(bidding?.lowestBid?.bid)}</span>
        </div>
      )}
      {/* Your Bid - Only show after bid is submitted */}
      {bidSubmitted && (
        <div className="py-3 flex flex-row gap-8 justify-center items-center bg-[#2B3F6C] text-white mb-6">
          <span className="font-semibold px-4">Your Bid</span>
          <span className="font-semibold px-4">{toPriceString(parseInt(bid))}</span>
        </div>
      )}
      {/*end */}

      {bidSubmitted && (
        <>
          <div className="bg-white px-8 py-6">
            <p className="text-sm font-bold text-[#2B3F6C] mb-2 text-center">Your Quote has been sent successfully!</p>
            <p className="text-xs text-black mb-6 text-center">You&apos;ll be notified when customer accepts the bid!</p>
            
            
            
            {additionalNotes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#2B3F6C] mb-2">NOTES</p>
                <div className="bg-[#FFDA57] rounded-lg p-4">
                  <p className="text-black font-medium text-center">
                    {additionalNotes.join(" ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      
      {!bidding?.status?.accepted && !bidding?.status?.rejected && !bidSubmitted && (
        <>

          {/*accept and make offer section */}
          {!accept && (
            <>
              <button
                className="mt-12 mx-auto text-red-500 font-semibold border-2 rounded-lg py-2 px-8 border-red-500 uppercase block"
                onClick={() => {
                  setShowDeclineConfirm(true);
                }}
              >
                Decline
              </button>
              <div className="p-6">
                <button
                  className="w-full bg-black text-white font-semibold rounded-lg py-3 px-8 uppercase"
                  onClick={() => {
                    setAccept(true);
                  }}
                >
                  Accept and make offer
                </button>
              </div>
            </>
          )}
          {/*end */}

          {/*confirm section */}
          {accept && !confirm && (
            <>
              <div className="bg-white px-8 py-6">
                <div className="relative mb-4">
                  <label 
                    className={`absolute left-0 transition-all duration-200 pointer-events-none ${
                      bid || isQuoteFocused
                        ? 'text-xs text-gray-500 -top-2'
                        : 'text-sm text-black top-0'
                    }`}
                  >
                    ENTER YOUR QUOTE
                  </label>
                  <input
                    value={bid}
                    onChange={(e) => handleBidChange(e.target.value)}
                    type="number"
                    className="w-full text-xl font-bold text-black border-0 border-b-2 border-gray-300 pb-2 bg-transparent focus:outline-none focus:border-[#2B3F6C] focus:ring-0 transition-colors duration-200 text-center"
                    onFocus={() => setIsQuoteFocused(true)}
                    onBlur={() => setIsQuoteFocused(false)}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                
                {showPayableToWedsy && (
                  <>
                    
                    <p className="text-sm text-gray-600 mb-2">Payable to Wedsy</p>
                    <div className="text-xl font-bold text-black border-b-2 border-[#2B3F6C] pb-2 mb-4 text-right">
                      {toPriceString(wedsyAmount)}
                    </div>
                  </>
                )}

                <div className="flex justify-center mb-4">
                  {!showAddNoteInput ? (
                    <button
                      onClick={addNote}
                      className="bg-[#FFDA57] text-black font-semibold rounded-lg py-3 px-8 w-full"
                    >
                      + ADD NOTES
                    </button>
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={cancelAddNote}
                        className="text-red-500 font-bold text-xl flex-shrink-0 bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50"
                      >
                        ×
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={1}
                          className="w-full text-lg font-bold text-black bg-[#FFDA57] rounded-lg py-3 px-4 border-0 focus:outline-none focus:ring-0 resize-none overflow-hidden min-h-[3rem]"
                          style={{
                            height: 'auto',
                            minHeight: '3rem',
                            outline: 'none',
                            boxShadow: 'none'
                          }}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={saveNote}
                        className="text-green-500 font-bold text-xl flex-shrink-0 bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-50"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>

                {additionalNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <textarea
                      value={note}
                      onChange={(e) => updateNote(index, e.target.value)}
                      placeholder="Enter note"
                      rows={1}
                      className="flex-1 text-lg font-bold text-black border-0 border-b-2 border-gray-300 pb-2 bg-transparent focus:outline-none focus:border-gray-500 focus:ring-0 resize-none overflow-hidden min-h-[2rem]"
                      style={{
                        height: 'auto',
                        minHeight: '2rem',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <button
                      onClick={() => removeNote(index)}
                      className="text-red-500 font-bold text-xl ml-2 flex-shrink-0 mt-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 mt-6 ">
                <button
                  className="text-[#2B2F6C] font-semibold border-2 py-3 px-6 border-blue-100 uppercase"
                  onClick={() => {
                    setShowDeclineConfirm(true);
                  }}
                >
                  Decline
                </button>
                <button
                  disabled={!bid}
                  className={`font-semibold border py-2 px-6 uppercase ${
                    bid 
                      ? "text-white bg-green-600 border-green-600 cursor-pointer hover:bg-blue-700" 
                      : "text-gray-400 bg-green-100 border-green-100 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (bid) {
                      setConfirm(true);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
          {accept && confirm && (
            <>
              <div className="bg-white px-8 py-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bid amount</p>
                    <p className="text-lg font-bold text-black">{toPriceString(parseInt(bid))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payable to Wedsy</p>
                    <p className="text-lg font-bold text-black">{toPriceString(wedsyAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payable to you</p>
                    <p className="text-lg font-bold text-black">{toPriceString(vendorAmount)}</p>
                  </div>
                </div>
                
                {additionalNotes.length > 0 && (
                  <div className="mt-6">
                    <div className="bg-[#FFDA57] rounded-lg p-4">
                      <p className="text-black font-medium text-center">
                        {additionalNotes.join(" ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 mt-6">
                <button
                  className="text-[#2B2F6C] font-semibold border-2 py-3 px-6 border-blue-100 bg-blue-50 uppercase"
                  onClick={() => {
                    setConfirm(false);
                  }}
                >
                  Decline
                </button>
                <button
                  className="text-white bg-green-600 font-semibold border py-3 px-6 border-green-600 uppercase"
                  onClick={() => {
                    AcceptBiddingBid();
                  }}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </>
      )}

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
