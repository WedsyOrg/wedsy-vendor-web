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
import { Avatar, Button, TextInput } from "flowbite-react";
import { toPriceString } from "@/utils/text";

export default function Home({}) {
  const [display, setDisplay] = useState("Pending");
  const [list, setList] = useState([]);
  const [selectedSource, setSelectedSource] = useState("Wedsy");
  const router = useRouter();
  const fetchPersonalPackageBooking = () => {
    const source = selectedSource === "Wedsy" ? "Wedsy-Package" : "Personal-Package";
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=${source}`, {
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
          setList(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const AcceptPersonalPackageBooking = (_id) => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/accept-personal-package-booking`,
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
          fetchPersonalPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const RejectPersonalPackageBooking = (_id) => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/order/${_id}/reject-personal-package-booking`,
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
          fetchPersonalPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    fetchPersonalPackageBooking();
  }, [selectedSource]);

  useEffect(() => {
    fetchPersonalPackageBooking();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Personal Packages
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
      
      {/* Pending and Accepted Tabs - Rectangular Full Width */}
      <div className="flex flex-row items-center mb-4 border-b">
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Pending" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setDisplay("Pending");
          }}
        >
          Pending
        </div>
        <div
          className={`font-semibold text-lg py-2 text-center flex-grow ${
            display === "Accepted" 
              ? "text-white bg-black" 
              : "text-gray-600 bg-white"
          }`}
          onClick={() => {
            setDisplay("Accepted");
          }}
        >
          Accepted
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {list
          .filter((item) =>
            display === "Pending"
              ? item?.status?.accepted === false &&
                item?.status?.rejected === false
              : display === "Accepted"
              ? item?.status?.accepted === true
              : false
          )
          .map((item, index) => (
            <>
              <div className="flex flex-col gap-1 px-4 pb-4 border-b-2 relative">
                <div className="grid grid-cols-5 gap-2">
                  <div className=" col-span-3">
                    <div className="text-lg font-semibold">
                      {item?.order?.user?.name}
                    </div>
                    <p className="text-sm my-0 py-0 flex flex-row items-center gap-1 font-semibold">
                      {item?.personalPackages
                        ?.map((i) => i?.package?.name)
                        .join(", ")}
                    </p>
                  </div>
                  <div className=" col-span-2 row-span-2 text-right">
                    <div className="text-sm font-semibold">
                      {new Date(item?.date)?.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {`${item.time} ${
                        +item.time.split(":")[0] < 12 ? "AM" : "PM"
                      }`}
                    </div>
                    <p className="text-right text-xl font-semibold">
                      {toPriceString(item?.order?.amount?.total)}
                    </p>
                    <p className="text-right text-gray-500 text-sm underline">
                      view details
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="my-0 py-0 flex flex-row items-center gap-1">
                      <MdOutlineLocationOn className="flex-shrink-0" />{" "}
                      <span className="text-xs">
                        {item?.address?.formatted_address}
                      </span>
                    </p>
                    <p className="my-0 py-0 flex flex-row items-center gap-1">
                      <MdPersonOutline />{" "}
                      {item?.personalPackages?.reduce(
                        (acc, rec) => acc + rec.quantity,
                        0
                      )}
                    </p>
                  </div>
                  {display === "Pending" && (
                    <div className="uppercase flex flex-row w-full justify-end items-center text-xs absolute bottom-0 right-0">
                      <span
                        onClick={() => {
                          {
                            RejectPersonalPackageBooking(item._id);
                          }
                        }}
                        className="border border-custom-dark-blue text-custom-dark-blue py-2 px-6"
                        size={24}
                      >
                        Cancel
                      </span>
                      <span
                        onClick={() => {
                          {
                            AcceptPersonalPackageBooking(item._id);
                          }
                        }}
                        className="border border-custom-dark-blue bg-custom-dark-blue text-white py-2 px-6"
                        size={24}
                      >
                        Accept
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ))}
      </div>
    </>
  );
}
