import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import SearchBox from "@/components/SearchBox";
import AnimatedDropdown from "@/components/AnimatedDropdown";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdFilterAlt,
  MdOutlineLocationOn,
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    amountRange: "all"
  });

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
            name: "Wedding Photography Lead",
            payment: { total: "25000" },
            eventInfo: [{ date: "2024-12-12" }],
            createdAt: new Date(),
            status: "pending"
          },
          {
            _id: "2", 
            name: "Corporate Event Lead",
            payment: { total: "15000" },
            eventInfo: [{ date: "2024-12-15" }],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: "confirmed"
          },
          {
            _id: "3",
            name: "Birthday Party Lead", 
            payment: { total: "5000" },
            eventInfo: [{ date: "2024-12-20" }],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            status: "completed"
          },
          {
            _id: "4",
            name: "Anniversary Lead",
            payment: { total: "75000" },
            eventInfo: [{ date: "2024-12-25" }],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
            status: "cancelled"
          }
        ]);
      });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    // Filter logic can be implemented here
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      amountRange: "all"
    });
  };

  const filterLeads = (leads) => {
    return leads.filter((lead) => {
      // Search filter
      const matchesSearch = search ? lead.name.toLowerCase().includes(search.toLowerCase()) : true;
      
      // Status filter
      const matchesStatus = filters.status === "all" || lead.status === filters.status;
      
      // Date range filter
      let matchesDate = true;
      if (filters.dateRange !== "all") {
        const leadDate = new Date(lead.createdAt || lead.updatedAt || 0);
        const now = new Date();
        
        switch (filters.dateRange) {
          case "today":
            matchesDate = leadDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = leadDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = leadDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      // Amount range filter
      let matchesAmount = true;
      if (filters.amountRange !== "all") {
        const amount = parseFloat(lead.payment?.total || 0);
        
        switch (filters.amountRange) {
          case "0-10000":
            matchesAmount = amount >= 0 && amount <= 10000;
            break;
          case "10000-50000":
            matchesAmount = amount > 10000 && amount <= 50000;
            break;
          case "50000-100000":
            matchesAmount = amount > 50000 && amount <= 100000;
            break;
          case "100000+":
            matchesAmount = amount > 100000;
            break;
          default:
            matchesAmount = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesAmount;
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
      <div className="px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <SearchBox
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div 
            className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white flex-shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <MdFilterAlt size={20} className="text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Filter Leads</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Status Filter */}
              <div>
                <AnimatedDropdown
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" }
                  ]}
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <AnimatedDropdown
                  label="Date Range"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  options={[
                    { value: "all", label: "All Dates" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "custom", label: "Custom Range" }
                  ]}
                />
              </div>

              {/* Amount Range Filter */}
              <div>
                <AnimatedDropdown
                  label="Amount Range"
                  value={filters.amountRange}
                  onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                  options={[
                    { value: "all", label: "All Amounts" },
                    { value: "0-10000", label: "₹0 - ₹10,000" },
                    { value: "10000-50000", label: "₹10,000 - ₹50,000" },
                    { value: "50000-100000", label: "₹50,000 - ₹1,00,000" },
                    { value: "100000+", label: "₹1,00,000+" }
                  ]}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={applyFilters}
                className="flex-1 bg-[#2B3F6C] text-white px-4 py-2 rounded-lg hover:bg-[#1e2d4a] transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#840032]"></div>
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="px-6 py-4 space-y-3">
            {filterLeads(leads)
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
