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
import {
  Avatar,
  Button,
  Datepicker,
  Label,
  Select,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Packages({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchList = () => {
    setLoading(true);
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
        setOrders(ordersResponse);
        setSettlements(settlementsResponse);
        setLoading(false);
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
          Transactions
        </p>
      </div>
      <div className="flex flex-col gap-4 divide-y-2">
        <div className="grid grid-cols-2 px-6 gap-6 gap-y-2">
          <div>
            <Label value="From" />
            <TextInput
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                console.log(e.target.value);
              }}
            />
          </div>
          <div>
            <Label value="To" />
            <TextInput
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
              }}
            />
          </div>
          <p
            className="text-sm underline font-medium"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear
          </p>
        </div>
        <div className="flex flex-col gap-4 divide-y px-6">
          {settlements
            ?.filter(
              (item) =>
                (startDate
                  ? new Date(item.createdAt) >= new Date(startDate)
                  : true) &&
                (endDate
                  ? new Date(item?.createdAt) <= new Date(endDate)
                  : true)
            )
            ?.map((item, index) => (
              <div
                className="grid grid-cols-2 gap-2 pt-2 items-end"
                key={item?._id}
              >
                <div className="row-span-2 text-xl font-medium">
                  {toPriceString(item?.amount)}
                </div>
                <div className="text-sm text-right font-semibold">
                  {new Date(item.createdAt)?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm text-right underline">
                  {item?.razporPayId}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
