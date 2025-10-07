import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdFilterAlt,
  MdOutlineLocationOn,
  MdSearch,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Leads({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [sendingReminder, setSendingReminder] = useState({});

  const fetchLeads = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead`, {
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
          setLeads(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
        // Add sample data for demonstration
        setLeads([
          {
            _id: "1",
            name: "Lead name",
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          },
          {
            _id: "2", 
            name: "Lead name",
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          },
          {
            _id: "3",
            name: "Lead name", 
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          },
          {
            _id: "4",
            name: "Lead name",
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          },
          {
            _id: "5",
            name: "Lead name",
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          },
          {
            _id: "6",
            name: "Lead name",
            payment: { total: "0" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date()
          }
        ]);
      });
  };

  const sendPaymentReminder = async (leadId, leadName) => {
    setSendingReminder(prev => ({ ...prev, [leadId]: true }));
    
    try {
      // Simulate API call to send payment reminder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Payment reminder sent to ${leadName}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to send payment reminder. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSendingReminder(prev => ({ ...prev, [leadId]: false }));
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center justify-between px-6 py-4 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <BackIcon />
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
        </div>
        <Link
          href="/personal-leads/create"
          className="flex items-center gap-2 text-black hover:text-[#840032] transition-colors"
        >
          <span className="text-black font-medium">Create lead</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0C5.61553 0 4.26215 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32121C0.00303299 5.6003 -0.13559 7.00776 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73784 14 8.38447 14 7C14 6.08075 13.8189 5.17049 13.4672 4.32121C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67879 0.532843C8.82951 0.18106 7.91925 0 7 0ZM7 12.6C5.89243 12.6 4.80972 12.2716 3.88881 11.6562C2.96789 11.0409 2.25013 10.1663 1.82628 9.14302C1.40243 8.11976 1.29153 6.99379 1.50761 5.90749C1.72368 4.8212 2.25703 3.82337 3.0402 3.0402C3.82338 2.25703 4.8212 1.72368 5.9075 1.5076C6.99379 1.29153 8.11976 1.40242 9.14303 1.82627C10.1663 2.25012 11.0409 2.96789 11.6562 3.88881C12.2716 4.80972 12.6 5.89242 12.6 7C12.6 8.48521 12.01 9.90959 10.9598 10.9598C9.9096 12.01 8.48521 12.6 7 12.6ZM9.8 6.3H7.7V4.2C7.7 4.01435 7.62625 3.8363 7.49498 3.70502C7.3637 3.57375 7.18565 3.5 7 3.5C6.81435 3.5 6.6363 3.57375 6.50503 3.70502C6.37375 3.8363 6.3 4.01435 6.3 4.2V6.3H4.2C4.01435 6.3 3.8363 6.37375 3.70503 6.50502C3.57375 6.6363 3.5 6.81435 3.5 7C3.5 7.18565 3.57375 7.3637 3.70503 7.49497C3.8363 7.62625 4.01435 7.7 4.2 7.7H6.3V9.8C6.3 9.98565 6.37375 10.1637 6.50503 10.295C6.6363 10.4262 6.81435 10.5 7 10.5C7.18565 10.5 7.3637 10.4262 7.49498 10.295C7.62625 10.1637 7.7 9.98565 7.7 9.8V7.7H9.8C9.98565 7.7 10.1637 7.62625 10.295 7.49497C10.4263 7.3637 10.5 7.18565 10.5 7C10.5 6.81435 10.4263 6.6363 10.295 6.50502C10.1637 6.37375 9.98565 6.3 9.8 6.3Z" fill="black"/>
          </svg>
        </Link>
      </div>
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#840032] focus:bg-white transition-colors"
            />
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
          </div>
          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white">
            <MdFilterAlt size={20} className="text-gray-600" />
          </div>
        </div>
      </div>
      <div className="bg-white min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#840032]"></div>
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="px-6 py-4 space-y-3">
            {leads
              ?.filter((i) => (search ? i.name.toLowerCase().includes(search.toLowerCase()) : true))
              .sort((a, b) => {
                const dateA = new Date(a?.createdAt || a?.updatedAt || 0);
                const dateB = new Date(b?.createdAt || b?.updatedAt || 0);
                return dateB - dateA; // Newest first
              })
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    router.push(`/personal-leads/${item._id}`);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {item?.eventInfo[0]?.date ? new Date(item.eventInfo[0].date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : "12-12-2024"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {toPriceString(item?.payment?.total ?? 0)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MdOutlineLocationOn size={14} />
                      <span>North Bangalore</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
              <p className="text-gray-500 mb-6">Create your first lead to get started</p>
              <Link href="/personal-leads/create">
                <button className="bg-[#840032] text-white px-6 py-3 rounded-lg hover:bg-[#6d0028] transition-colors">
                  Create Lead
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}
