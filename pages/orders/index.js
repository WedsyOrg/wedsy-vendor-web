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
import { Avatar, Button, Select, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Packages({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [display, setDisplay] = useState("");
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order`, {
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
          setOrders(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 py-4 bg-white z-10 border-b border-gray-200">
        <BackIcon />
        <p className="grow text-xl font-bold text-black">
          Orders
        </p>
        <div className="relative">
          <select
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-black bg-white appearance-none pr-8 focus:outline-none focus:ring-0 focus:border-gray-400"
          >
            <option value={"Bidding"}>Bidding</option>
            <option value={"Wedsy-Package"}>Packages</option>
            <option value={"Personal-Package"}>Personal</option>
            <option value={""}>All</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <MdKeyboardArrowDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col divide-y divide-gray-200">
        {orders
          ?.filter(
            (item) =>
              (display ? item.source === display : true) &&
              (search
                ? item?.user?.name
                    ?.toLowerCase()
                    ?.includes(search.toLowerCase())
                : true)
          )
          ?.map((order, index) => (
            <div
              key={index}
              className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                router.push(`/orders/${order?._id}`);
              }}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Name and Amount */}
                <div className="flex-1">
                  <div className="text-lg font-semibold text-black mb-1">
                    {order?.user?.name || "Deepika Padukone"}
                  </div>
                  <div className="text-lg font-medium text-black">
                    {toPriceString(order?.amount?.total || 14000)}
                  </div>
                </div>

                {/* Right side - Date and Status */}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-medium text-black">
                    {order?.source === "Bidding" && (
                      <>
                        {new Date(
                          order?.biddingBooking?.events[0]?.date
                        )?.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) || "18 May 2023"}
                      </>
                    )}
                    {order?.source === "Personal-Package" && (
                      <>
                        {new Date(
                          order?.vendorPersonalPackageBooking?.date
                        )?.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) || "18 May 2023"}
                      </>
                    )}
                    {order?.source === "Wedsy-Package" && (
                      <>
                        {new Date(
                          order?.wedsyPackageBooking?.date
                        )?.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) || "18 May 2023"}
                      </>
                    )}
                    {!order?.source && "18 May 2023"}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-semibold uppercase ${
                        order?.source === "Wedsy-Package"
                          ? "text-[#840032]"
                          : order?.source === "Personal-Package"
                          ? "text-[#00AC4F]"
                          : "text-[#2B3F6C]"
                      }`}
                    >
                      {order?.source === "Wedsy-Package"
                        ? "W PACKAGE"
                        : order?.source === "Personal-Package"
                        ? "P PACKAGE"
                        : "BIDDING"}
                    </span>
                    <MdChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
