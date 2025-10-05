import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import {
  MdClose,
  MdPhone,
  MdContacts,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function Home({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState("Stage-1");
  const [lead, setLead] = useState({
    name: "",
    phone: "",
    eventInfo: [{ date: "", time: "" }],
    notes: "",
    tasks: [{ task: "", date: "", time: "" }],
    payment: {
      total: "",
      received: "",
      transactions: [],
    },
  });
  const handleSubmit = () => {
    setLoading(true);
    let date = new Date();
    let formattedDate = date.toISOString().split("T")[0];
    let hours = String(date.getHours()).padStart(2, "0");
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let formattedTime = `${hours}:${minutes}`;
    let total = parseInt(lead.payment.total) || 0;
    let transactions = lead.payment.transactions
      .filter((e) => e.amount && e.method)
      .map((e) => {
        return {
          ...e,
          amount: parseInt(e.amount) || 0,
          date: formattedDate,
          time: formattedTime,
        };
      });
    let received = transactions.reduce((sum, item) => sum + item.amount, 0);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...lead,
        eventInfo: lead.eventInfo.filter((e) => e.date && e.time),
        tasks: lead.tasks.filter((e) => e.date && e.time),
        payment: {
          total,
          received,
          transactions,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error");
        } else {
          router.push(`/personal-leads/${response.id}`);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center justify-center px-6 py-4 bg-white z-10 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Create Leads</h1>
      </div>
      
      <div className="px-6 py-4 bg-white min-h-screen">
        {display === "Stage-1" && (
          <>
            {/* Lead Information */}
            <div className="space-y-6">
              {/* Lead Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Lead Name"
                    disabled={loading}
                    value={lead?.name}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        name: e.target.value,
                      });
                    }}
                  />
                  <MdContacts className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone no.
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    disabled={loading}
                    value={lead?.phone}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/\D/g, "");
                      if (phoneNumber.length <= 10) {
                        setLead({ ...lead, phone: phoneNumber });
                      }
                    }}
                  />
                  <MdPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter only numbers (10 digits)</p>
              </div>

              {/* Event Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Event Details</h3>
                
                {/* Event Date and Time in a grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event date
                    </label>
                    <input
                      type="date"
                      disabled={loading}
                      value={lead?.eventInfo[0]?.date}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                      onChange={(e) => {
                        setLead({
                          ...lead,
                          eventInfo: lead.eventInfo.map((rec, recIndex) => {
                            if (recIndex === 0) {
                              return { ...rec, date: e.target.value };
                            } else {
                              return rec;
                            }
                          }),
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event time
                    </label>
                    <input
                      type="time"
                      disabled={loading}
                      value={lead?.eventInfo[0]?.time}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032] cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onChange={(e) => {
                        setLead({
                          ...lead,
                          eventInfo: lead.eventInfo.map((rec, recIndex) => {
                            if (recIndex === 0) {
                              return { ...rec, time: e.target.value };
                            } else {
                              return rec;
                            }
                          }),
                        });
                      }}
                      onClick={(e) => {
                        e.target.showPicker && e.target.showPicker();
                      }}
                    />
                  </div>
                </div>

                {/* Add Additional Events */}
                <div
                  className="flex items-center gap-2 text-sm text-[#840032] cursor-pointer hover:text-[#6d0028] transition-colors"
                  onClick={() => {
                    setLead({
                      ...lead,
                      eventInfo: [...lead?.eventInfo, { date: "", time: "" }],
                    });
                  }}
                >
                  <span>Add more</span>
                  <div className="w-4 h-4 bg-[#840032] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
              </div>

              {/* Add Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add notes
                </label>
                <textarea
                  rows={3}
                  disabled={loading}
                  value={lead?.notes}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032] resize-none"
                  onChange={(e) => {
                    setLead({
                      ...lead,
                      notes: e.target.value,
                    });
                  }}
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-8 flex justify-center">
              <button
                className="px-8 py-3 text-white font-medium transition-colors"
                style={{
                  backgroundColor: '#2B3F6C',
                  borderRadius: '25px',
                  ':hover': {
                    backgroundColor: '#1e2a4a'
                  }
                }}
                disabled={loading}
                onClick={() => {
                  setDisplay("Stage-2");
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
        {display === "Stage-2" && (
          <>
            {/* Header for Stage-2 */}
            <div className="sticky top-0 w-full flex flex-row items-center justify-center px-6 py-4 bg-white z-10 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Create Leads</h1>
            </div>
            
            {/* Tasks Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Task</h3>
              
              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Description"
                  disabled={loading}
                  value={lead?.tasks[0]?.task}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                  onChange={(e) => {
                    setLead({
                      ...lead,
                      tasks: [{ ...lead?.tasks[0], task: e.target.value }],
                    });
                  }}
                />
              </div>

              {/* Task Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Task date
                  </label>
                  <input
                    type="date"
                    disabled={loading}
                    value={lead?.tasks[0]?.date}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        tasks: [{ ...lead?.tasks[0], date: e.target.value }],
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Task time
                  </label>
                  <input
                    type="time"
                    disabled={loading}
                    value={lead?.tasks[0]?.time}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032] cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        tasks: [{ ...lead?.tasks[0], time: e.target.value }],
                      });
                    }}
                    onClick={(e) => {
                      e.target.showPicker && e.target.showPicker();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 my-6"></div>

            {/* Payment Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              
              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#840032] font-semibold">₹</span>
                  <input
                    type="number"
                    disabled={loading}
                    value={lead?.payment?.total}
                    placeholder="Enter total amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setLead({
                        ...lead,
                        payment: { ...lead.payment, total: value },
                      });
                    }}
                  />
                </div>
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Amount Received
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#840032] font-semibold">₹</span>
                  <input
                    type="text"
                    disabled={loading}
                    value={lead?.payment?.received}
                    placeholder="Enter received amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032]"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setLead({
                        ...lead,
                        payment: { ...lead.payment, received: value },
                      });
                    }}
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Payment Method
                </label>
                <select
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#840032] focus:border-[#840032] bg-white"
                  onChange={(e) => {
                    setLead({
                      ...lead,
                      payment: { ...lead.payment, method: e.target.value },
                    });
                  }}
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Add Transaction Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <span>Add more</span>
                  <div className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <button
                  className="text-white font-medium transition-colors"
                  style={{
                    backgroundColor: '#2B3F6C',
                    width: '144px',
                    height: '31px',
                    top: '599px',
                    left: '228px',
                    borderRadius: '4px',
                    opacity: 1
                  }}
                  disabled={loading}
                  onClick={() => {
                    if (lead.payment.received && lead.payment.method) {
                      const newTransaction = {
                        amount: lead.payment.received,
                        method: lead.payment.method,
                        date: new Date().toISOString().split("T")[0],
                        time: new Date().toLocaleTimeString("en-GB", { 
                          hour12: false, 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })
                      };
                      
                      setLead({
                        ...lead,
                        payment: {
                          ...lead.payment,
                          transactions: [...lead.payment.transactions, newTransaction],
                          received: "",
                          method: ""
                        }
                      });
                    }
                  }}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-8 flex justify-center">
              <button
                className="px-8 py-3 text-white font-medium transition-colors"
                style={{
                  backgroundColor: '#2B3F6C',
                  borderRadius: '25px'
                }}
                disabled={loading}
                onClick={handleSubmit}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
