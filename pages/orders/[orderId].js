import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import SearchBox from "@/components/SearchBox";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdArrowForwardIos,
  MdChevronRight,
  MdEdit,
  MdFilterAlt,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdOutlineChevronRight,
  MdOutlineLocationOn,
  MdPersonOutline,
} from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, Button, Label, Select, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { RxDashboard } from "react-icons/rx";

export default function Packages({}) {
  const router = useRouter();
  const { orderId } = router.query;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [display, setDisplay] = useState("");
  const [order, setOrder] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/${orderId}?populate=true`, {
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
        if (response) {
          setLoading(false);
          setOrder(response);
          setDisplay(response?.source);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#840032]"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">Order not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#840032] text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 py-4 bg-white z-10 border-b border-gray-200">
        <BackIcon />
        <p className="grow text-xl font-bold text-black">
          Orders
        </p>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black bg-white flex items-center gap-2"
          >
            {display === "Bidding" ? "Bidding" : 
             display === "Wedsy-Package" ? "Packages" : 
             display === "Personal-Package" ? "Personal" : "Bidding"}
            <MdKeyboardArrowDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {showDropdown && (
            <div 
              className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
              style={{
                width: '131px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB'
              }}
            >
              <div 
                className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setDisplay("Bidding");
                  setShowDropdown(false);
                }}
              >
                Bidding
              </div>
              <div className="border-t border-gray-200"></div>
              <div 
                className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setDisplay("Wedsy-Package");
                  setShowDropdown(false);
                }}
              >
                Packages
              </div>
              <div className="border-t border-gray-200"></div>
              <div 
                className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setDisplay("Personal-Package");
                  setShowDropdown(false);
                }}
              >
                Personal
              </div>
              <div className="border-t border-gray-200"></div>
              <div 
                className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setDisplay("");
                  setShowDropdown(false);
                }}
              >
                All
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 flex justify-center">
        <SearchBox
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Order Details */}
      <div className="flex flex-col px-6 py-4">
        {/* Client Name and Date for Bidding Orders */}
        {order?.source === "Bidding" && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-black">
              {order?.user?.name || "Deepika Padukone"}
            </div>
            <div className="text-sm font-medium text-black">
              {order?.biddingBooking?.events?.[0]?.date ? 
                new Date(order.biddingBooking.events[0].date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }) : "18 May 2023"}
            </div>
          </div>
        )}

        {/* Client Information for Package Orders */}
        {(order?.source === "Wedsy-Package" || order?.source === "Personal-Package") && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-black mb-2">Client Information</h3>
            <div className="bg-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-black font-medium">Name:</span>
                <span className="text-black">{order?.user?.name || "Deepika Padukone"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-medium">Phone:</span>
                <span className="text-black">{order?.user?.phone || order?.user?.mobile || "+91 9876543210"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-black mb-2">Location</h3>
          <div 
            className="bg-gray-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => {
              const address = order?.wedsyPackageBooking?.address?.formatted_address || 
                             order?.vendorPersonalPackageBooking?.address?.formatted_address || 
                             order?.biddingBooking?.events?.[0]?.location ||
                             "#2014, Prestige garden bay, Yelahan";
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
              window.open(mapsUrl, '_blank');
            }}
          >
            <MdOutlineLocationOn className="text-[#840032]" size={20} />
            <span className="text-black font-medium">HOME</span>
            <span className="text-black">{order?.wedsyPackageBooking?.address?.formatted_address || order?.vendorPersonalPackageBooking?.address?.formatted_address || order?.biddingBooking?.events?.[0]?.location || "#2014, Prestige garden bay, Yelahan"}</span>
          </div>
        </div>

        {/* Date Section */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-black mb-2">Date</h3>
          <div className="bg-gray-200 rounded-lg p-3">
            <span className="text-black">
              {order?.source === "Bidding" && (
                order?.biddingBooking?.events?.[0]?.date ? 
                  new Date(order.biddingBooking.events[0].date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).toUpperCase() : "14 OCT 2025"
              )}
              {order?.source === "Wedsy-Package" && (
                new Date(order?.wedsyPackageBooking?.date)?.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).toUpperCase() || "11 OCT 2024"
              )}
              {order?.source === "Personal-Package" && (
                new Date(order?.vendorPersonalPackageBooking?.date)?.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).toUpperCase() || "11 OCT 2024"
              )}
              {!order?.source && "14 OCT 2025"}
            </span>
          </div>
        </div>

        {/* Time Section */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-black mb-2">Time</h3>
          <div className="bg-gray-200 rounded-lg p-3">
            <span className="text-black">
              {order?.wedsyPackageBooking?.time || order?.vendorPersonalPackageBooking?.time || "05:30 pm"}
            </span>
          </div>
        </div>

        {/* Dynamic Events Section */}
        {order?.source === "Bidding" && order?.biddingBooking?.events?.map((event, eventIndex) => (
          <div key={eventIndex} className="px-6 py-4">
            <div className="text-lg font-bold text-black mb-4">Day {eventIndex + 1}</div>
            <div className="flex items-center gap-2 mb-4">
              <MdOutlineLocationOn className="text-gray-600" size={20} />
              <span className="text-black">{event?.location || "Taj MG Road, Bengaluru"}</span>
            </div>
            <div className="space-y-3">
              {event?.peoples?.map((person, personIndex) => (
                <div key={personIndex}>
                  <div className="flex items-center gap-2">
                    <MdPersonOutline className="text-gray-600" size={20} />
                    <span className="text-black">
                      {person?.noOfPeople || 1} {person?.makeupStyle || "Bridal"} {person?.preferredLook || "North indian"}
                    </span>
                  </div>
                  {person?.addOns && (
                    <div className="flex items-center gap-2 ml-8">
                      <RxDashboard className="text-gray-600" size={20} />
                      <span className="text-black">{person.addOns}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {event?.notes && event.notes.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm font-medium text-black mb-2">Notes:</p>
                <p className="text-sm text-black">{event.notes.join(", ")}</p>
              </div>
            )}
            <div className="border-t border-dashed border-gray-400 my-4"></div>
          </div>
        ))}

        {/* Personal Package Section - Same style as Wedsy Package */}
        {order?.source === "Personal-Package" && (
          <div className="px-6 py-4">
            {/* Address Section */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-black mb-2">Address</h3>
              <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-2">
                <MdOutlineLocationOn className="text-[#840032]" size={20} />
                <span className="text-black font-medium">HOME</span>
                <span className="text-black">{order?.vendorPersonalPackageBooking?.address?.formatted_address || "#2014, Prestige garden bay, Yelahan"}</span>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-black mb-2">Date</h3>
              <div className="bg-gray-200 rounded-lg p-3">
                <span className="text-black">
                  {new Date(order?.vendorPersonalPackageBooking?.date)?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).toUpperCase() || "11 OCT 2024"}
                </span>
              </div>
            </div>

            {/* Time Section */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-black mb-2">Time</h3>
              <div className="bg-gray-200 rounded-lg p-3">
                <span className="text-black">
                  {order?.vendorPersonalPackageBooking?.time || "05:30 pm"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wedsy Package Section */}
        {order?.source === "Wedsy-Package" && (
          <div className="px-6 py-4">
            <div className="text-lg font-bold text-black mb-4">Event Details</div>
            <div className="flex items-center gap-2 mb-4">
              <MdOutlineLocationOn className="text-gray-600" size={20} />
              <span className="text-black">
                {order?.wedsyPackageBooking?.address?.formatted_address || "Location not specified"}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MdPersonOutline className="text-gray-600" size={20} />
                <span className="text-black">
                  Date: {new Date(order?.wedsyPackageBooking?.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RxDashboard className="text-gray-600" size={20} />
                <span className="text-black">
                  Time: {order?.wedsyPackageBooking?.time}
                </span>
              </div>
              {order?.wedsyPackageBooking?.wedsyPackages?.map((pkg, pkgIndex) => (
                <div key={pkgIndex} className="flex items-center gap-2">
                  <MdPersonOutline className="text-gray-600" size={20} />
                  <span className="text-black">
                    {pkg?.package?.name} x {pkg?.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-400 my-4"></div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="px-6 py-4">
          <div className="text-lg font-bold text-black mb-4">Payment Summary</div>
          
          {/* Package Items with Full Details */}
          {order?.source === "Wedsy-Package" && order?.wedsyPackageBooking?.wedsyPackages?.map((pkg, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-black font-medium">{pkg?.package?.name} x {pkg?.quantity}</span>
                <span className="text-black font-bold">{toPriceString(pkg?.package?.price * pkg?.quantity || 5850)}</span>
              </div>
              {pkg?.package?.description && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Description:</span> {pkg?.package?.description}
                </div>
              )}
              {pkg?.package?.deliverables && pkg?.package?.deliverables.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Deliverables:</span>
                  <ul className="list-disc list-inside ml-2">
                    {pkg?.package?.deliverables.map((deliverable, idx) => (
                      <li key={idx}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          {order?.source === "Personal-Package" && order?.vendorPersonalPackageBooking?.personalPackages?.map((pkg, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-black font-medium">{pkg?.package?.name} x {pkg?.quantity}</span>
                <span className="text-black font-bold">{toPriceString(pkg?.package?.price * pkg?.quantity || 5850)}</span>
              </div>
              {pkg?.package?.description && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Description:</span> {pkg?.package?.description}
                </div>
              )}
              {pkg?.package?.deliverables && pkg?.package?.deliverables.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Deliverables:</span>
                  <ul className="list-disc list-inside ml-2">
                    {pkg?.package?.deliverables.map((deliverable, idx) => (
                      <li key={idx}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          {/* Default package items if no data */}
          {(!order?.source || (!order?.wedsyPackageBooking?.wedsyPackages && !order?.vendorPersonalPackageBooking?.personalPackages)) && (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-black">Basic Makeup Package x 1</span>
                <span className="text-black">₹ 5,850</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-black">Draping x 1</span>
                <span className="text-black">₹ 5,850</span>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-300 my-2"></div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-black">Taxes and fare</span>
            <span className="text-black">₹ 5,850</span>
          </div>
          
          <div className="border-t border-gray-300 my-2"></div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-black font-bold">Total</span>
            <span className="text-black font-bold">₹ 5,850</span>
          </div>
          
          <div className="border-t border-gray-300 my-4"></div>
          
          {/* Clear Payment Information */}
          <div className="mb-4">
            <div className="text-lg font-bold text-black mb-4">Payment Details</div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-black font-medium">Booked Amount:</span>
                <span className="text-black font-bold text-lg">{toPriceString(order?.amount?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-medium">Amount Paid:</span>
                <span className="text-green-600 font-bold text-lg">{toPriceString(order?.amount?.paid || 5000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-medium">Balance Amount:</span>
                <span className="text-red-500 font-bold text-lg">{toPriceString(order?.amount?.due || 9000)}</span>
              </div>
              <div className="flex justify-start mt-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  (order?.amount?.due || 9000) > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {(order?.amount?.due || 9000) > 0 ? 'Not Paid' : 'Paid'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Wedsy Settlements */}
          <div className="mb-4">
            <div className="text-lg font-bold text-black mb-4">Wedsy Settlements</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-black font-medium">Total amount</span>
              <span className="text-black font-medium">{toPriceString(order?.amount?.total ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-black font-medium">Amount payable to wedsy</span>
              <span className="text-black font-medium">{toPriceString(order?.amount?.total ?? 0)}</span>
            </div>
          </div>
          <div className="border-t border-gray-300 my-4"></div>
        </div>

        {/* Review Section */}
        <div className="px-6 py-4">
          <div className="border-t border-gray-300 my-4"></div>
          <button className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Ask for review
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            (Available only after order date)
          </p>
        </div>
      </div>
    </>
  );
}
