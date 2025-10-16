import BackIcon from "@/components/icons/BackIcon";
import { ToggleSwitch } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdArrowBackIos, MdPhone, MdPerson } from "react-icons/md";
import { useState, useEffect } from "react";
import AnimatedDropdown from "@/components/AnimatedDropdown";

export default function Settings({}) {
  const router = useRouter();
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("January");

  useEffect(() => {
    fetchCalls();
    fetchChats();
  }, []);

  // Filter calls based on selected month
  useEffect(() => {
    filterCallsByMonth();
  }, [calls, selectedMonth]);

  const filterCallsByMonth = () => {
    if (!calls.length) {
      setFilteredCalls([]);
      return;
    }

    const monthMap = {
      "January": 0,
      "February": 1,
      "March": 2,
      "April": 3,
      "May": 4,
      "June": 5,
      "July": 6,
      "August": 7,
      "September": 8,
      "October": 9,
      "November": 10,
      "December": 11
    };

    const selectedMonthIndex = monthMap[selectedMonth];
    if (selectedMonthIndex === undefined) {
      setFilteredCalls(calls);
      return;
    }

    const currentYear = new Date().getFullYear();
    const filtered = calls.filter(call => {
      const callDate = new Date(call.date);
      return callDate.getMonth() === selectedMonthIndex && 
             callDate.getFullYear() === currentYear;
    });

    setFilteredCalls(filtered);
  };

  const fetchCalls = async () => {
    try {
      // Try to fetch real calls data from stats API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/list?key=vendor-call`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "success" && data.list && data.list.length > 0) {
          // Transform the data to match our UI structure
          const transformedCalls = data.list.map((call, index) => ({
            id: call._id || index,
            name: call.user?.name || "Unknown User",
            number: call.user?.phone || "+91 XXXXX XXXXX",
            date: call.createdAt || new Date().toISOString(),
            duration: Math.floor(Math.random() * 20) + ":" + String(Math.floor(Math.random() * 60)).padStart(2, '0')
          }));
          setCalls(transformedCalls);
        } else {
          setCalls([]);
        }
      } else {
        throw new Error("Failed to fetch calls data");
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
      setCalls([]);
    } finally {
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data || []);
      } else {
        throw new Error("Failed to fetch chats data");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-4 px-8 pt-8">
        <div className="flex flex-row gap-3 items-center mb-4">
          <BackIcon />
          <p className="text-lg font-medium">Analytics</p>
        </div>
        <div className="grid grid-cols-2">
          <div className="col-start-2">
            <AnimatedDropdown
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={[
                { value: "January", label: "January" },
                { value: "February", label: "February" },
                { value: "March", label: "March" },
                { value: "April", label: "April" },
                { value: "May", label: "May" },
                { value: "June", label: "June" },
                { value: "July", label: "July" },
                { value: "August", label: "August" },
                { value: "September", label: "September" },
                { value: "October", label: "October" },
                { value: "November", label: "November" },
                { value: "December", label: "December" }
              ]}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Calls</p>
            <p className="text-5xl font-semibold text-center">{filteredCalls.length}</p>
          </div>
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Chats</p>
            <p className="text-5xl font-semibold text-center">{chats.length}</p>
          </div>
        </div>
        
        {/* Calls List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls</h3>
          {false ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <MdPhone className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No calls found for {selectedMonth}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCalls.map((call) => (
                <div key={call.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MdPerson className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{call.name}</p>
                        <p className="text-sm text-gray-500">{call.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatDate(call.date)}</p>
                      <p className="text-xs text-gray-500">{formatTime(call.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
