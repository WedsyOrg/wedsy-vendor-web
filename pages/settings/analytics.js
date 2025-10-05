import BackIcon from "@/components/icons/BackIcon";
import { Select, ToggleSwitch } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdArrowBackIos, MdPhone, MdPerson } from "react-icons/md";
import { useState, useEffect } from "react";

export default function Settings({}) {
  const router = useRouter();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("Jan 2024");

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=calls-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
    } finally {
      setLoading(false);
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
          <Select className="col-start-2" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option>Jan 2024</option>
            <option>Feb 2024</option>
            <option>Mar 2024</option>
            <option>Apr 2024</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Calls</p>
            <p className="text-5xl font-semibold text-center">{calls.length}</p>
          </div>
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Chats</p>
            <p className="text-5xl font-semibold text-center">11</p>
          </div>
        </div>
        
        {/* Calls List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls</h3>
          {loading ? (
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
          ) : calls.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <MdPhone className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No calls found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
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
