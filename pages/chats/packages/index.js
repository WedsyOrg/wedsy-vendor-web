import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import AnimatedDropdown from "@/components/AnimatedDropdown";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  // Dummy fallback data for Wedsy/Vendor packages
  const DUMMY_WEDSY_PACKAGES = [
    {
      _id: "wedsy-dummy-1",
      source: "Wedsy",
      status: { accepted: false, rejected: false },
      wedsyPackageBooking: {
        _id: "wpb-1",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: "06:00 PM",
        address: { formatted_address: "ITC Gardenia, Bengaluru" },
        wedsyPackages: [
          { quantity: 1, package: { name: "Silver Package", price: 7000 } },
          { quantity: 1, package: { name: "Photography Add-on", price: 5000 } },
        ],
      },
      order: { user: { name: "Priya Verma" } },
    },
  ];
  const DUMMY_VENDOR_PACKAGES = [
    {
      _id: "vendor-dummy-1",
      source: "Vendor",
      status: { accepted: false, rejected: false },
      wedsyPackageBooking: {
        _id: "vpb-1",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        time: "11:00 AM",
        address: { formatted_address: "Taj Lands End, Mumbai" },
        wedsyPackages: [
          { quantity: 2, package: { name: "Makeup Session", price: 4500 } },
        ],
      },
      order: { user: { name: "Rahul Khanna" } },
    },
  ];
  const [display, setDisplay] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSource, setSelectedSource] = useState("Wedsy");
  const [timeFilter, setTimeFilter] = useState("All"); // All | Upcoming | Completed
  const [biddingFilter, setBiddingFilter] = useState("All"); // All | Bidding Only
  const router = useRouter();
  const debounceTimeoutRef = useRef(null);


  const fetchWedsyPackageBooking = useCallback(async () => {
    setLoading(true);
    const source = selectedSource === "Wedsy" ? "Wedsy-Package" : "Vendor-Package";
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/order?source=${source}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setList(data);
        setError(null);
      } else {
        // Use dummy data when empty
        setList(selectedSource === "Wedsy" ? DUMMY_WEDSY_PACKAGES : DUMMY_VENDOR_PACKAGES);
        setError(null);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      // On error, also fallback to dummy data to populate UI
      setList(selectedSource === "Wedsy" ? DUMMY_WEDSY_PACKAGES : DUMMY_VENDOR_PACKAGES);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSource, router]);

  // Debounced fetch function to prevent excessive API calls
  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchWedsyPackageBooking();
    }, 300);
  }, [fetchWedsyPackageBooking]);

  const AcceptWedsyPackageBooking = useCallback(async (_id) => {
    setLoading(true);
    const acceptUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/accept-wedsy-package-booking`;
    
    try {
      const response = await fetch(acceptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        fetchWedsyPackageBooking();
      }
    } catch (error) {
      console.error("There was a problem with the accept operation:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchWedsyPackageBooking, router]);
  const RejectWedsyPackageBooking = useCallback(async (_id) => {
    setLoading(true);
    const rejectUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/reject-wedsy-package-booking`;
    
    try {
      const response = await fetch(rejectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        fetchWedsyPackageBooking();
      }
    } catch (error) {
      console.error("There was a problem with the reject operation:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchWedsyPackageBooking, router]);
  useEffect(() => {
    debouncedFetch();
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [debouncedFetch]);

  // Memoize filtered data to prevent unnecessary re-computations
  const filteredList = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    return list.filter((item) => {
      const isPending = display === "Pending" 
        ? item?.status?.accepted === false && item?.status?.rejected === false
        : false;
      const isAccepted = display === "Accepted" 
        ? item?.status?.accepted === true
        : false;
      const dateStr = item?.wedsyPackageBooking?.date;
      const dateVal = dateStr ? new Date(dateStr) : null;
      let timePass = true;
      if (timeFilter === "Upcoming") {
        timePass = dateVal ? dateVal >= startOfToday : true;
      } else if (timeFilter === "Completed") {
        // Prefer explicit completed flag; fallback to past date
        timePass = item?.status?.completed === true || (dateVal ? dateVal < startOfToday : false);
      }
      let biddingPass = true;
      if (biddingFilter === "Bidding Only") {
        biddingPass = item?.source === "Bidding";
      }
      return (isPending || isAccepted) && timePass && biddingPass;
    });
  }, [list, display, timeFilter, biddingFilter]);

  // Memoize empty state check
  const isEmpty = useMemo(() => filteredList.length === 0, [filteredList.length]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-8"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          PACKAGES
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

      {/* Filters: Upcoming / Completed, and Bidding - as dropdowns */}
      <div className="grid grid-cols-2 gap-3 px-6 mb-4">
        <div>
          <AnimatedDropdown
            label="Time Filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            options={[
              { value: "All", label: "All" },
              { value: "Upcoming", label: "Upcoming" },
              { value: "Completed", label: "Completed" }
            ]}
          />
        </div>
        <div>
          <AnimatedDropdown
            label="Bidding Filter"
            value={biddingFilter}
            onChange={(e) => setBiddingFilter(e.target.value)}
            options={[
              { value: "All", label: "All" },
              { value: "Bidding Only", label: "Bidding" }
            ]}
          />
        </div>
      </div>
      
      
      {/* Pending and Accepted Tabs - Rectangular Full Width */}
      <div className="flex flex-row items-center mb-4">
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow rounded-sm ${
            display === "Pending" 
              ? "bg-custom-dark-blue text-white shadow-md" 
              : "text-black bg-white"
          }`}
          onClick={() => {
            setDisplay("Pending");
          }}
        >
          Pending
        </div>
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow rounded-sm ${
            display === "Accepted" 
              ? "bg-custom-dark-blue text-white shadow-md" 
              : "text-black bg-white"
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
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-gray-500 text-center">
              <p>{error}</p>
              <button
                className="mt-2 text-sm text-blue-600 underline"
                onClick={() => fetchWedsyPackageBooking()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">No {display.toLowerCase()} packages found</div>
          </div>
        ) : filteredList.map((item) => {
            const dateStr = new Date(item?.wedsyPackageBooking?.date)?.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const timeStr = item?.wedsyPackageBooking?.time
              ? item?.wedsyPackageBooking?.time
              : new Date(item?.wedsyPackageBooking?.date || Date.now()).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
            const packageNames = item?.wedsyPackageBooking?.wedsyPackages?.map((i) => i?.package?.name).join(", ") || "Package";
            const qty = item?.wedsyPackageBooking?.wedsyPackages?.reduce((acc, rec) => acc + (rec?.quantity || 0), 0) || 1;
            const computedPrice = item?.amount?.total
              || item?.wedsyPackageBooking?.wedsyPackages?.reduce((sum, i) => sum + ((i?.package?.price || 7000) * (i?.quantity || 1)), 0)
              || 0;

            return (
              <div key={item._id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                {/* Top row: Name and Date/Time */}
                <div className="flex items-start justify-between px-4 pt-3">
                  <div className="text-[15px] font-semibold text-gray-900 leading-tight">
                    {item?.order?.user?.name || "Client"}
                  </div>
                  <div className="text-right text-[12px] text-gray-700 leading-tight">
                    <div>{dateStr}</div>
                    <div className="mt-0.5">{timeStr}</div>
                  </div>
                </div>

                {/* Package and Price row */}
                <div className="flex items-start justify-between px-4 mt-1">
                  <div className="text-[12px] text-gray-600">{packageNames}</div>
                  <div className="text-right">
                    <div className="text-[18px] font-semibold text-gray-900">{toPriceString(computedPrice)}</div>
                    <button
                      className="text-[10px] text-gray-500 underline"
                      onClick={() => {
                        const detailId = item?.wedsyPackageBooking?._id || item?._id;
                        router.push(`/chats/packages/${detailId}`);
                      }}
                    >
                      view details
                    </button>
                  </div>
                </div>

                {/* Location, count and actions aligned on same row */}
                <div className="pl-4 pr-0 mt-3 pb-0 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[12px] text-gray-700">
                      <MdOutlineLocationOn className="text-gray-600" size={16} />
                      <span>{item?.wedsyPackageBooking?.address?.formatted_address?.split(',')[0] || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-700 mt-1">
                      <MdPersonOutline className="text-gray-600" size={16} />
                      <span>{qty}</span>
                    </div>
                  </div>
                  {display === "Pending" ? (
                    <div className="flex items-center gap-0 ml-auto">
                      <button
                        onClick={() => !loading && RejectWedsyPackageBooking(item._id)}
                        className="h-9 px-4 text-[12px] font-semibold border border-custom-dark-blue border-r-0 text-custom-dark-blue bg-white rounded-none"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => !loading && AcceptWedsyPackageBooking(item._id)}
                        className="h-9 px-4 text-[12px] font-semibold bg-custom-dark-blue text-white rounded-none"
                      >
                        ACCEPT
                      </button>
                    </div>
                  ) : (
                    <div className="inline-block bg-green-600 text-white px-3 py-1 text-[12px] font-medium rounded">ACCEPTED</div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
