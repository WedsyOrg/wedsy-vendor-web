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
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const router = useRouter();
  const { packageId } = router.query;
  const fetchWedsyPackageBooking = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=Wedsy-Package`, {
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
          setList(response);
          response.map((item) => {
            if (item?.wedsyPackageBooking?._id === packageId) {
              setDisplay(item.status.accepted ? "Accepted" : "Pending");
            }
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
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
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          fetchWedsyPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
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
          setLoading(false);
          fetchWedsyPackageBooking();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    fetchWedsyPackageBooking();
  }, []);
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
      <div className="flex flex-col gap-4">
        {list
          .filter((item) => item?.wedsyPackageBooking?._id === packageId)
          .map((item, index) => (
            <>
              <div className="flex flex-col gap-1 px-4 pb-4 relative">
                <div className="grid grid-cols-5 gap-2">
                  <div className=" col-span-3">
                    <div className="text-lg font-semibold">
                      {item?.order?.user?.name}
                    </div>
                    <p className="text-sm my-0 py-0 flex flex-row items-center gap-1 font-semibold">
                      {item?.wedsyPackageBooking?.wedsyPackages
                        ?.map((i) => i?.package?.name)
                        .join(", ")}
                    </p>
                  </div>
                  <div className=" col-span-2 row-span-2 text-right">
                    <div className="text-sm font-semibold">
                      {new Date(
                        item?.wedsyPackageBooking?.date
                      )?.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {`${item?.wedsyPackageBooking?.time} ${
                        +item?.wedsyPackageBooking?.time.split(":")[0] < 12
                          ? "AM"
                          : "PM"
                      }`}
                    </div>
                    <p className="text-right text-xl font-semibold">
                      {toPriceString(item?.order?.amount?.total)}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="my-0 py-0 flex flex-row items-center gap-1">
                      <MdOutlineLocationOn className="flex-shrink-0" />{" "}
                      <span className="text-xs">
                        {item?.wedsyPackageBooking?.address?.formatted_address}
                      </span>
                    </p>
                    <p className="my-0 py-0 flex flex-row items-center gap-1">
                      <MdPersonOutline />{" "}
                      {item?.wedsyPackageBooking?.wedsyPackages?.reduce(
                        (acc, rec) => acc + rec.quantity,
                        0
                      )}
                    </p>
                  </div>
                  <div className="col-span-5 grid grid-cols-2 mt-4 mb-6">
                    <p className="font-medium">Total Price</p>
                    <p className="font-medium text-right">
                      {toPriceString(item?.order?.amount?.total)}
                    </p>
                    <p className="font-medium">Wedsy Comission</p>
                    <p className="font-medium text-right">
                      {toPriceString(item?.order?.amount?.payableToWedsy)}
                    </p>
                    <div className="h-[2px] bg-black w-full col-span-2 mb-2 mt-1" />
                    <p className="font-medium text-lg">Payable to you</p>
                    <p className="font-semibold text-lg text-right">
                      {toPriceString(item?.order?.amount?.payableToVendor)}
                    </p>
                    <div className="h-[2px] bg-black w-full col-span-2 mt-2" />
                  </div>
                  {display === "Pending" && (
                    <div className="uppercase flex flex-row w-full justify-center items-center text-xs col-span-5">
                      <span
                        onClick={() => {
                          if (!loading) {
                            RejectWedsyPackageBooking(
                              item?.wedsyPackageBooking?._id
                            );
                          }
                        }}
                        className="border border-custom-dark-blue text-custom-dark-blue py-2 px-6"
                        size={24}
                      >
                        Cancel
                      </span>
                      <span
                        onClick={() => {
                          if (!loading) {
                            AcceptWedsyPackageBooking(
                              item?.wedsyPackageBooking?._id
                            );
                          }
                        }}
                        className="border border-custom-dark-blue bg-custom-dark-blue text-white py-2 px-6"
                        size={24}
                      >
                        Accept
                      </span>
                    </div>
                  )}
                  {display === "Accepted" && (
                    <div className="uppercase flex flex-row w-full justify-center items-center col-span-5">
                      <span className="border border-[#00A74D] bg-[#00A74D] text-white py-2 px-6 grow text-center">
                        Booking confirmed
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
