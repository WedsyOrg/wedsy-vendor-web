import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import {
  MdClose,
  MdPhone,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";

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
          alert("Error");
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
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Create Lead
        </p>
      </div>
      
      <div className="px-6 py-4">
        {display === "Stage-1" && (
          <>
            {/* Lead Information */}
            <div className="space-y-6">
              {/* Lead Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Lead name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Lead Name"
                    disabled={loading}
                    value={lead?.name}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        name: e.target.value,
                      });
                    }}
                  />
                  <MdPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#840032] w-5 h-5" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone no.
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  disabled={loading}
                  value={lead?.phone}
                  maxLength={10}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                  onChange={(e) => {
                    const phoneNumber = e.target.value.replace(/\D/g, "");
                    if (phoneNumber.length <= 10) {
                      setLead({ ...lead, phone: phoneNumber });
                    }
                  }}
                />
              </div>

              {/* Event Details */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Event Details</h3>
                
                {/* Event Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Event date
                  </label>
                  <input
                    type="date"
                    disabled={loading}
                    value={lead?.eventInfo[0]?.date}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
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

                {/* Event Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Event time
                  </label>
                  <input
                    type="time"
                    disabled={loading}
                    value={lead?.eventInfo[0]?.time}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
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
                  />
                </div>

                {/* Add More Events */}
                <div
                  className="flex items-center gap-2 text-sm text-black cursor-pointer"
                  onClick={() => {
                    setLead({
                      ...lead,
                      eventInfo: [...lead?.eventInfo, { date: "", time: "" }],
                    });
                  }}
                >
                  <span>Add more</span>
                  <BsPlusCircle className="w-4 h-4" />
                </div>
              </div>

              {/* Add Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Add notes
                </label>
                <textarea
                  rows={3}
                  disabled={loading}
                  value={lead?.notes}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] resize-none"
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
                className="w-full max-w-xs px-8 py-3 bg-[#840032] text-white font-medium rounded-lg hover:bg-[#6d0028] transition-colors"
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
            {/* Tasks Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Create Task</h3>
              
              {/* Task Description */}
              <div>
                <input
                  type="text"
                  placeholder="Description"
                  disabled={loading}
                  value={lead?.tasks[0]?.task}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
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
                  <label className="block text-sm font-medium text-black mb-2">
                    Task date
                  </label>
                  <input
                    type="date"
                    disabled={loading}
                    value={lead?.tasks[0]?.date}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        tasks: [{ ...lead?.tasks[0], date: e.target.value }],
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Task time
                  </label>
                  <input
                    type="time"
                    disabled={loading}
                    value={lead?.tasks[0]?.time}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
                    onChange={(e) => {
                      setLead({
                        ...lead,
                        tasks: [{ ...lead?.tasks[0], time: e.target.value }],
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 my-6"></div>

            {/* Payment Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Payment Details</h3>
              
              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Total amount
                </label>
                <input
                  type="number"
                  disabled={loading}
                  value={lead?.payment?.total}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                  onChange={(e) => {
                    setLead({
                      ...lead,
                      payment: { ...lead.payment, total: e.target.value },
                    });
                  }}
                />
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Amount received
                </label>
                <input
                  type="number"
                  disabled={loading}
                  value={lead?.payment?.received}
                  placeholder="Amount"
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                  onChange={(e) => {
                    setLead({
                      ...lead,
                      payment: { ...lead.payment, received: e.target.value },
                    });
                  }}
                />
              </div>

              {/* Add More and Submit Button Row */}
              <div className="flex items-center justify-between gap-4">
                <div
                  className="flex items-center gap-2 text-sm text-black cursor-pointer"
                  onClick={() => {
                    setLead({
                      ...lead,
                      payment: {
                        ...lead.payment,
                        transactions: [
                          ...lead.payment.transactions,
                          { amount: "", method: "", date: "", time: "" },
                        ],
                      },
                    });
                  }}
                >
                  <span>Add more</span>
                  <BsPlusCircle className="w-4 h-4" />
                </div>
                
                <button
                  className="px-6 py-3 bg-[#840032] text-white font-medium hover:bg-[#6d0028] transition-colors"
                  disabled={loading}
                  onClick={() => {
                    // Handle submit logic for adding transaction
                    const newTransaction = {
                      amount: lead.payment.received,
                      method: "Cash", // Default method
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
                        received: ""
                      }
                    });
                  }}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-8 flex justify-center">
              <button
                className="w-full max-w-xs px-8 py-3 bg-[#840032] text-white font-medium rounded-lg hover:bg-[#6d0028] transition-colors"
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
