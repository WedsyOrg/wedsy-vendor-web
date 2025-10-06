import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useMemo, useState } from "react";
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
  // Dummy fallback orders for package detail view
  const DUMMY_ORDERS = {
    "wpb-1": {
      _id: "ord-wedsy-1",
      status: { accepted: false, rejected: false },
      order: { user: { name: "Priya Verma", phone: "+91 90000 11111" } },
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
      amount: {
        total: 12000,
        payableToWedsy: 1000,
        payableToVendor: 11000,
      },
    },
    "vpb-1": {
      _id: "ord-vendor-1",
      status: { accepted: false, rejected: false },
      order: { user: { name: "Rahul Khanna", phone: "+91 98888 22222" } },
      wedsyPackageBooking: {
        _id: "vpb-1",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        time: "11:00 AM",
        address: { formatted_address: "Taj Lands End, Mumbai" },
        wedsyPackages: [
          { quantity: 2, package: { name: "Makeup Session", price: 4500 } },
        ],
      },
      amount: {
        total: 9000,
        payableToWedsy: 800,
        payableToVendor: 8200,
      },
    },
  };
  const [display, setDisplay] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { packageId } = router.query;
  const fetchOrderDetails = () => {
    if (!packageId) return;
    setLoading(true);
    setError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/${packageId}?populate=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return null;
          }
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setOrder(data);
        if (data?.status) {
          setDisplay(data.status.accepted ? "Accepted" : "Pending");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Fallback to dummy order by packageId when API is unavailable
        const dummy = DUMMY_ORDERS[packageId];
        if (dummy) {
          setOrder(dummy);
          setDisplay(dummy?.status?.accepted ? "Accepted" : "Pending");
          setError(null);
        } else {
          setOrder(null);
          setError("Unable to load package details");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const AcceptWedsyPackageBooking = (_id) => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/accept-wedsy-package-booking`,
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
        }
        return response.json();
      })
      .then((response) => {
        if (response) {
          fetchOrderDetails();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const RejectWedsyPackageBooking = (_id) => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/reject-wedsy-package-booking`,
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
          fetchOrderDetails();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchOrderDetails();
  }, [packageId]);
  
  const currentBooking = useMemo(() => order, [order]);
  
  const bookingSummary = useMemo(() => {
    if (!currentBooking) return null;
    const packages = currentBooking?.wedsyPackageBooking?.wedsyPackages || [];
    const personalPackages = currentBooking?.vendorPersonalPackageBooking?.personalPackages || [];
    const services = currentBooking?.biddingBooking?.events?.[0]?.peoples || [];
    return {
      customer: currentBooking?.order?.user || currentBooking?.user,
      address: currentBooking?.wedsyPackageBooking?.address?.formatted_address ||
        currentBooking?.vendorPersonalPackageBooking?.address?.formatted_address ||
        currentBooking?.biddingBooking?.events?.[0]?.location,
      date: currentBooking?.wedsyPackageBooking?.date ||
        currentBooking?.vendorPersonalPackageBooking?.date ||
        currentBooking?.biddingBooking?.events?.[0]?.date,
      time: currentBooking?.wedsyPackageBooking?.time ||
        currentBooking?.vendorPersonalPackageBooking?.time ||
        currentBooking?.biddingBooking?.events?.[0]?.time,
      items: packages.length ? packages : personalPackages.length ? personalPackages : services,
      amount: currentBooking?.amount,
    };
  }, [currentBooking]);
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Packages
        </p>
      </div>
      <div className="flex flex-row items-center mb-4 border-b">
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Pending" && "text-white bg-custom-dark-blue"
          }`}
          onClick={() => {
            // setDisplay("Pending");
            router.push("/chats/packages");
          }}
        >
          Pending
        </div>
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Accepted" && "text-white bg-custom-dark-blue"
          }`}
          onClick={() => {
            // setDisplay("Accepted");
            router.push("/chats/packages");
          }}
        >
          Accepted
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 pb-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading package...</div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">{error}</div>
        ) : !currentBooking ? (
          <div className="text-center py-8 text-gray-500">Package not found.</div>
        ) : (
          <div className="flex flex-col gap-1 relative">
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-3">
                <div className="text-lg font-semibold">
                  {bookingSummary?.customer?.name || "Client"}
                </div>
                <p className="text-xs text-gray-700 mt-0.5">
                  {bookingSummary?.customer?.phone || bookingSummary?.customer?.mobile || ""}
                </p>
                <p className="text-sm my-0 py-0 flex flex-row items-center gap-1 font-semibold">
                  {bookingSummary?.items?.map((i) => i?.package?.name || i?.preferredLook || i?.makeupStyle).filter(Boolean).join(", ") || "Package"}
                </p>
              </div>
              <div className="col-span-2 row-span-2 text-right">
                <div className="text-sm font-semibold">
                  {bookingSummary?.date ? new Date(bookingSummary.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }) : "Date TBD"}{" "}
                  {(bookingSummary?.time && typeof bookingSummary.time === "string") ? bookingSummary.time : bookingSummary?.date ? new Date(bookingSummary.date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }) : ""}
                </div>
                <p className="text-right text-xl font-semibold">
                  {toPriceString(bookingSummary?.amount?.total)}
                </p>
              </div>
              <div className="col-span-3">
                <button
                  type="button"
                  className="my-0 py-0 flex flex-row items-center gap-1 text-left"
                  onClick={() => {
                    if (bookingSummary?.address) {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingSummary.address)}`;
                      window.open(url, "_blank");
                    }
                  }}
                >
                  <MdOutlineLocationOn className="flex-shrink-0" />{" "}
                  <span className="text-xs underline text-blue-700">
                    {bookingSummary?.address?.split(',')[0] || "Location"}
                  </span>
                </button>
                <p className="my-0 py-0 flex flex-row items-center gap-1">
                  <MdPersonOutline />{" "}
                  {bookingSummary?.items?.reduce((acc, rec) => acc + (rec.quantity || rec.noOfPeople || 0), 0) || 1}
                </p>
              </div>
              <div className="col-span-5 mt-3">
                <div className="text-sm font-semibold mb-1">Package Details</div>
                <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
                  {(bookingSummary?.items || []).map((p, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-800">
                        {(p?.package?.name || p?.preferredLook || p?.makeupStyle || "Item")} x {p?.quantity || p?.noOfPeople || 1}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {toPriceString((p?.package?.price || p?.price || 0) * (p?.quantity || p?.noOfPeople || 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-2 mt-4 mb-6">
                <p className="font-medium">Total Price</p>
                <p className="font-medium text-right">
                  {toPriceString(bookingSummary?.amount?.total)}
                </p>
                <p className="font-medium">Wedsy Commission</p>
                <p className="font-medium text-right">
                  {toPriceString(bookingSummary?.amount?.payableToWedsy)}
                </p>
                <div className="h-[2px] bg-black w-full col-span-2 mb-2 mt-1" />
                <p className="font-medium text-lg">Payable to you</p>
                <p className="font-semibold text-lg text-right">
                  {toPriceString(bookingSummary?.amount?.payableToVendor)}
                </p>
                <div className="h-[2px] bg-black w-full col-span-2 mt-2" />
              </div>
              {display === "Pending" && (
                <div className="uppercase flex flex-row w-full justify-center items-center text-xs col-span-5">
                  <span
                    onClick={() => {
                      if (!loading) {
                        RejectWedsyPackageBooking(currentBooking?._id);
                      }
                    }}
                    className="border border-custom-dark-blue text-custom-dark-blue py-2 px-6"
                  >
                    Cancel
                  </span>
                  <span
                    onClick={() => {
                      if (!loading) {
                        AcceptWedsyPackageBooking(currentBooking?._id);
                      }
                    }}
                    className="border border-custom-dark-blue bg-custom-dark-blue text-white py-2 px-6"
                  >
                    Accept
                  </span>
                </div>
              )}
              {display === "Accepted" && (
                <div className="col-span-5">
                  <div className="w-full bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Booking confirmed</span>
                    <span className="text-xs text-green-700">Thank you</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
