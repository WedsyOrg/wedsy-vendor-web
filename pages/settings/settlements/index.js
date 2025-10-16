import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
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
  MdSearch,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, Button, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Packages({}) {
  const router = useRouter();
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState("");
  const [display, setDisplay] = useState("");
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchList = () => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/transfer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => response.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => response.json()),
    ])
      .then((response) => {
        let [settlementsResponse, ordersResponse] = response;
        ordersResponse = ordersResponse.filter(
          (item) =>
            item?.status?.finalized &&
            item.source !== "Bidding" &&
            (item?.source === "Personal-Package"
              ? new Date().toLocaleDateString() >=
                new Date(
                  item?.vendorPersonalPackageBooking?.date
                )?.toLocaleDateString()
              : item?.source === "Wedsy-Package"
              ? new Date().toLocaleDateString() >=
                new Date(item?.wedsyPackageBooking?.date)?.toLocaleDateString()
              : false) &&
            item?.amount?.due <= 0
        );
        const uniqueMonthYear = [
          ...new Set(
            ordersResponse.map((item) => {
              const date =
                item.source === "Personal-Package"
                  ? new Date(item?.vendorPersonalPackageBooking?.date)
                  : new Date(item?.wedsyPackageBooking?.date);
              return `${date.toLocaleString("default", {
                month: "long",
              })} ${date.getFullYear()}`;
            })
          ),
        ];
        setMonths(uniqueMonthYear);
        setOrders(ordersResponse);
        setSettlements(settlementsResponse);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 py-3 bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          SETTLEMENTS
        </p>
      </div>
      <div className="flex flex-col gap-4 px-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <button
              className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C] transition-colors flex items-center justify-between"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{month || "Select"}</span>
              <MdKeyboardArrowDown className="text-gray-500" />
            </button>
            
            {showDropdown && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                style={{
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB'
                }}
              >
                <div 
                  className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setMonth("");
                    setShowDropdown(false);
                  }}
                >
                  Select
                </div>
                {months?.map((i) => (
                  <div key={i}>
                    <div className="border-t border-gray-200"></div>
                    <div 
                      className="px-4 py-3 text-sm font-bold text-black cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setMonth(i);
                        setShowDropdown(false);
                      }}
                    >
                      {i}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {month && (
          <div className="grid grid-cols-2 gap-6 items-center text-sm text-center">
            <div className="p-4 bg-white shadow-xl flex flex-col gap-2">
              <p>Wedsy Packages</p>
              <p className="text-lg font-medium">
                {toPriceString(
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    ?.filter((item) => item.source === "Wedsy-Package")
                    .reduce((acc, item) => {
                      return acc + (item.amount?.total || 0);
                    }, 0)
                )}
              </p>
              <p className="text-lg text-rose-900 font-semibold">
                {
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    ?.filter((item) => item.source === "Wedsy-Package").length
                }
              </p>
            </div>
            <div className="p-4 bg-white shadow-xl flex flex-col gap-2">
              <p>Personal Packages</p>
              <p className="text-lg font-medium">
                {toPriceString(
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    ?.filter((item) => item.source === "Personal-Package")
                    .reduce((acc, item) => {
                      return acc + (item.amount?.total || 0);
                    }, 0)
                )}
              </p>
              <p className="text-lg text-rose-900 font-semibold">
                {
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    ?.filter((item) => item.source === "Personal-Package")
                    .length
                }
              </p>
            </div>
            <div className="p-4 bg-white shadow-xl flex flex-col gap-2">
              <p>Payable to You</p>
              <p className="text-lg font-medium">
                {toPriceString(
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    .reduce((acc, item) => {
                      return acc + (item.amount?.payableToVendor || 0);
                    }, 0)
                )}
              </p>
              <p className="text-lg text-rose-900 font-semibold">
                {
                  orders?.filter((item) => {
                    const date =
                      item.source === "Personal-Package"
                        ? new Date(item?.vendorPersonalPackageBooking?.date)
                        : new Date(item?.wedsyPackageBooking?.date);

                    // Format date to "Month Year"
                    const monthYear = `${date.toLocaleString("default", {
                      month: "long",
                    })} ${date.getFullYear()}`;

                    return monthYear === month; // Match the given month-year string
                  }).length
                }
              </p>
            </div>
            <div className="p-4 bg-white shadow-xl flex flex-col gap-2">
              <p>Payable to Wedsy</p>
              <p className="text-lg font-medium">
                {toPriceString(
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    .reduce((acc, item) => {
                      return acc + (item.amount?.payableToWedsy || 0);
                    }, 0)
                )}
              </p>
              <p className="text-lg text-rose-900 font-semibold">
                {
                  orders?.filter((item) => {
                    const date =
                      item.source === "Personal-Package"
                        ? new Date(item?.vendorPersonalPackageBooking?.date)
                        : new Date(item?.wedsyPackageBooking?.date);

                    // Format date to "Month Year"
                    const monthYear = `${date.toLocaleString("default", {
                      month: "long",
                    })} ${date.getFullYear()}`;

                    return monthYear === month; // Match the given month-year string
                  }).length
                }
              </p>
            </div>
            <div className="p-4 col-span-2 bg-white shadow-xl flex flex-col gap-2">
              <p>Settlement Amount</p>
              <p className="text-lg font-medium">
                {toPriceString(
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    .filter(
                      (item) =>
                        item.amount?.payableToVendor -
                          item?.amount?.receivedByVendor ===
                        0
                    )
                    .reduce((acc, item) => {
                      return acc + (item.amount?.receivedByVendor || 0);
                    }, 0)
                )}
              </p>
              <p className="text-lg text-rose-900 font-semibold">
                {
                  orders
                    ?.filter((item) => {
                      const date =
                        item.source === "Personal-Package"
                          ? new Date(item?.vendorPersonalPackageBooking?.date)
                          : new Date(item?.wedsyPackageBooking?.date);

                      // Format date to "Month Year"
                      const monthYear = `${date.toLocaleString("default", {
                        month: "long",
                      })} ${date.getFullYear()}`;

                      return monthYear === month; // Match the given month-year string
                    })
                    ?.filter(
                      (item) =>
                        item.amount?.payableToVendor -
                          item?.amount?.receivedByVendor ===
                        0
                    ).length
                }
              </p>
            </div>
          </div>
        )}
        <Link
          href={"/settings/settlements/transactions"}
          className="px-6 rounded-full py-2 text-white text-center mt-6"
          style={{ backgroundColor: '#2B3F6C' }}
        >
          View Transaction Details
        </Link>
      </div>
    </>
  );
}
