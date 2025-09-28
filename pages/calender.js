import "react-calendar/dist/Calendar.css";
import BackIcon from "@/components/icons/BackIcon";
import Calendar from "react-calendar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home({}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [activeDates, setActiveDates] = useState([]);
  const [events, setEvents] = useState({});

  const fetchOrders = () => {
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
          setOrders(response);
          let tempList = [];
          let tempData = {};
          response.forEach((order) => {
            let tempDate = null;
            let tempTime = null;
            let tempLocation = null;
            if (order.source === "Personal-Package") {
              tempDate = new Date(order?.vendorPersonalPackageBooking?.date);
              tempTime = order?.vendorPersonalPackageBooking?.time;
              tempLocation =
                order?.vendorPersonalPackageBooking?.address?.formatted_address;
            } else if (order.source === "Wedsy-Package") {
              tempDate = new Date(order?.wedsyPackageBooking?.date);
              tempTime = order?.wedsyPackageBooking?.time;
              tempLocation =
                order?.wedsyPackageBooking?.address?.formatted_address;
            }
            if (order.source === "Bidding") {
              order?.biddingBooking?.events?.forEach((event) => {
                let tDate = new Date(event?.date);
                let tTime = event?.time;
                let tLocation = event?.location;
                let t = tDate.toLocaleDateString();
                if (!tempList.includes(t)) {
                  tempList.push(t);
                }
                if (t in tempData) {
                  tempData[t].push({
                    order: order,
                    name: order?.user?.name,
                    location: tLocation,
                    time: tTime,
                    source: order?.source,
                  });
                } else {
                  tempData[t] = [
                    {
                      order: order,
                      name: order?.user?.name,
                      location: tLocation,
                      time: tTime,
                      source: order?.source,
                    },
                  ];
                }
              });
            } else {
              let temp = tempDate.toLocaleDateString();
              if (!tempList.includes(temp)) {
                tempList.push(temp);
              }
              if (temp in tempData) {
                tempData[temp].push({
                  order: order,
                  name: order?.user?.name,
                  location: tempLocation,
                  time: tempTime,
                  source:
                    order.source === "Personal-Package"
                      ? "Personal"
                      : order.source === "Wedsy-Package"
                      ? "Package"
                      : order?.source,
                });
              } else {
                tempData[temp] = [
                  {
                    order: order,
                    name: order?.user?.name,
                    location: tempLocation,
                    time: tempTime,
                    source:
                      order.source === "Personal-Package"
                        ? "Personal"
                        : order.source === "Wedsy-Package"
                        ? "Package"
                        : order?.source,
                  },
                ];
              }
            }
          });
          setActiveDates(tempList);
          setEvents(tempData);
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
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-medium">Calender</p>
      </div>
      <div className="flex flex-col gap-4 py-4 px-6 ">
        <div className="mx-auto">
          <Calendar
            onChange={(value, event) => {
              setSelectedDate(value);
              console.log(value, typeof value, value.toLocaleDateString());
            }}
            formatDay={(locale, date) => (
              <div className="flex flex-col gap-1">
                <span>{date?.getDate()}</span>
                <div className="flex flex-col items-center">
                  {activeDates.includes(date?.toLocaleDateString()) ? (
                    <div className="bg-[#006edc] h-2 w-2 rounded-full" />
                  ) : (
                    <div className="bg-transparent h-2 w-2 rounded-full" />
                  )}
                </div>
              </div>
            )}
            value={selectedDate}
          />
        </div>
        <p className="font-semibold mt-6 text-lg">
          {selectedDate &&
            selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </p>
        {selectedDate &&
          activeDates.includes(selectedDate.toLocaleDateString()) && (
            <div className="divide-y-2 divide-black bg-[#D9D9D9] text-base font-medium">
              {events[selectedDate.toLocaleDateString()]?.map((item, index) => (
                <div className="grid grid-cols-4 gap-2 gap-y-1 p-4" key={index}>
                  <div className="col-span-3">{item?.name}</div>
                  <div className="text-right">{item?.source}</div>
                  <div className="col-span-3">{item?.location}</div>
                  <div className="text-right">{`${item?.time} ${
                    +item?.time.split(":")[0] < 12 ? "AM" : "PM"
                  }`}</div>
                </div>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
