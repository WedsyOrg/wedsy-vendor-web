import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home({}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 12)); // October 12, 2025
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [orders, setOrders] = useState([]);
  const [activeDates, setActiveDates] = useState([]);
  const [events, setEvents] = useState({});

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isWeekend: false
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isToday = dateObj.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isWeekend
      });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isWeekend: false
      });
    }
    
    return days;
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };
  
  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
      setSelectedDate(newDate);
    }
  };

  const formatISODate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchCalendarData = async () => {
    // Fetch for the current visible month (inclusive)
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = formatISODate(start);
    const endDate = formatISODate(end);

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    };

    try {
      // Orders are the primary data source for this page. Personal leads are additive.
      const [ordersRes, personalLeadsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order`, { method: "GET", headers }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead/calendar?startDate=${encodeURIComponent(
            startDate
          )}&endDate=${encodeURIComponent(endDate)}`,
          { method: "GET", headers }
        ).catch(() => null),
      ]);

      // Keep existing behavior: if orders API fails auth, redirect to login.
      if (!ordersRes?.ok) {
        router.push("/login");
        return;
      }

      const ordersJson = await ordersRes.json();

      // Personal leads are optional. If the endpoint is missing/failed, proceed with orders only.
      let personalLeadEvents = [];
      if (personalLeadsRes?.ok) {
        const personalLeadsJson = await personalLeadsRes.json();
        personalLeadEvents = personalLeadsJson?.list || [];
      }

      setOrders(ordersJson);

      let tempList = [];
      let tempData = {};

      // Orders -> calendar
      (ordersJson || []).forEach((order) => {
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
          tempLocation = order?.wedsyPackageBooking?.address?.formatted_address;
        }

        if (order.source === "Bidding") {
          order?.biddingBooking?.events?.forEach((event) => {
            const tDate = new Date(event?.date);
            const tTime = event?.time;
            const tLocation = event?.location;
            const t = tDate.toLocaleDateString();
            if (!tempList.includes(t)) tempList.push(t);
            if (t in tempData) {
              tempData[t].push({
                order,
                name: order?.user?.name,
                location: tLocation,
                time: tTime,
                source: order?.source,
              });
            } else {
              tempData[t] = [
                {
                  order,
                  name: order?.user?.name,
                  location: tLocation,
                  time: tTime,
                  source: order?.source,
                },
              ];
            }
          });
        } else if (tempDate) {
          const t = tempDate.toLocaleDateString();
          if (!tempList.includes(t)) tempList.push(t);
          const sourceLabel =
            order.source === "Personal-Package"
              ? "Personal"
              : order.source === "Wedsy-Package"
              ? "Package"
              : order?.source;

          if (t in tempData) {
            tempData[t].push({
              order,
              name: order?.user?.name,
              location: tempLocation,
              time: tempTime,
              source: sourceLabel,
            });
          } else {
            tempData[t] = [
              {
                order,
                name: order?.user?.name,
                location: tempLocation,
                time: tempTime,
                source: sourceLabel,
              },
            ];
          }
        }
      });

      // Personal Leads -> calendar
      (personalLeadEvents || []).forEach((ev) => {
        // Parse as local date to avoid timezone shifts
        const d = ev?.date ? new Date(`${ev.date}T00:00:00`) : null;
        if (!d || Number.isNaN(d.getTime())) return;
        const key = d.toLocaleDateString();
        if (!tempList.includes(key)) tempList.push(key);

        const entry = {
          leadId: ev?.leadId,
          name: ev?.name,
          phone: ev?.phone,
          notes: ev?.notes,
          location: "",
          time: ev?.time || "",
          source: "Personal Lead",
          type: "personal-lead",
        };

        if (key in tempData) tempData[key].push(entry);
        else tempData[key] = [entry];
      });

      setActiveDates(tempList);
      setEvents(tempData);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData();
    // Re-fetch when month changes so personal-lead events stay in sync with the visible month
  }, [currentDate]);

  const days = getDaysInMonth(currentDate);
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-medium">Calender</p>
      </div>
      <div className="flex flex-col gap-4 py-4 px-6">
        {/* Custom Calendar */}
        <div className="bg-blue-50 rounded-2xl border border-gray-200 p-4 mx-auto w-full max-w-sm shadow-sm">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#2B3F6C]">
                {months[currentDate.getMonth()].substring(0, 3).toUpperCase()}
              </h2>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-[#2B3F6C]"
              >
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="currentColor"
                />
              </svg>
              <span className="text-lg font-bold text-[#2B3F6C]">
                {currentDate.getFullYear()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateMonth(-1)}
                className="text-[#2B3F6C] hover:text-gray-600 transition-colors p-1"
              >
                ←
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="text-[#2B3F6C] hover:text-gray-600 transition-colors p-1"
              >
                →
              </button>
            </div>
          </div>
          
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day, index) => (
              <div 
                key={index}
                className={`text-center text-sm font-bold py-2 ${
                  day === 'SAT' || day === 'SUN' ? 'text-[#840032]' : 'text-[#2B3F6C]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isHighlighted = activeDates.includes(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).toLocaleDateString()
              );
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square flex items-center justify-center text-sm font-medium transition-colors
                    ${!day.isCurrentMonth 
                      ? 'text-gray-400 hover:bg-gray-100 rounded-lg' 
                      : day.isSelected
                      ? 'bg-[#2B3F6C] text-white rounded-full'
                      : isHighlighted
                      ? 'text-green-600 hover:bg-green-50 rounded-lg'
                      : day.isWeekend
                      ? 'text-[#840032] hover:bg-red-50 rounded-lg'
                      : 'text-[#2B3F6C] hover:bg-gray-100 rounded-lg'
                    }
                    ${day.isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {day.date}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Date Display */}
        <p className="font-semibold text-lg text-center">
          {selectedDate &&
            selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </p>
        
        {/* Events for selected date */}
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
