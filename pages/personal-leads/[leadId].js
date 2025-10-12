import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import {
  MdEdit,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Label,
  Modal,
  Select,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Lead({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState([]);
  const [display, setDisplay] = useState("Details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [editDetails, setEditDetails] = useState(false);
  const [editEventDates, setEditEventDates] = useState(false);
  const [editPayment, setEditPayment] = useState(false);
  const [eventInfo, setEventInfo] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [task, setTask] = useState({ task: "", date: "", time: "" });
  const [addTask, setAddTask] = useState(false);
  const [transaction, setTransaction] = useState({
    amount: "",
    method: "",
    date: "",
    time: "",
  });
  const [addTransaction, setAddTransaction] = useState(false);
  const { leadId } = router.query;

  const fetchLead = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead/${leadId}`, {
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
          setLead(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleSubmit = (body) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead/${leadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...body,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error");
        } else {
          setLoading(false);
          setEditDetails(false);
          setAddTask(false);
          setAddTransaction(false);
          fetchLead();
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchLead();
  }, []);

  return (
    <>
      {/* Header with Profile Picture and Name */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 py-4 bg-white z-10 border-b border-gray-200">
        <BackIcon />
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/icons/default-avatar.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center" style={{display: 'none'}}>
              <span className="text-lg font-medium text-gray-600">
                {lead?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          <h1 className="text-lg font-bold text-gray-900 uppercase">
            {lead?.name || "DEEPIKA PADUKONE"}
          </h1>
        </div>
        <MdEdit
          className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
          size={20}
          onClick={() => {
            setName(lead?.name);
            setPhone(lead?.phone);
            setNotes(lead?.notes || "");
            setEditDetails(true);
          }}
        />
      </div>
      <Modal
        show={editDetails}
        size={"sm"}
        onClose={() => setEditDetails(false)}
      >
        <Modal.Header>Edit Lead</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div>
              <Label value="Lead Name" />
              <TextInput
                placeholder="Lead Name"
                disabled={loading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div>
              <Label value="Phone Number" />
              <TextInput
                placeholder="Phone Number"
                disabled={loading}
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  const phoneNumber = e.target.value.replace(/\D/g, "");
                  if (phoneNumber.length <= 10) {
                    setPhone(phoneNumber);
                  }
                }}
              />
            </div>
            <div>
              <Label value="Notes" />
              <textarea
                rows={3}
                placeholder="Add notes about this lead"
                disabled={loading}
                value={notes}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#2B3F6C] resize-none"
                onChange={(e) => {
                  setNotes(e.target.value);
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => handleSubmit({ name, phone, notes })}
            disabled={!name || !phone}
            color="dark"
          >
            Update
          </Button>
          <Button color="gray" onClick={() => setEditDetails(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={addTask} size={"sm"} onClose={() => setAddTask(false)}>
        <Modal.Header>Add Task</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-2">
            <div>
              <Label value="Create Task" />
              <TextInput
                disabled={loading}
                value={task?.task}
                onChange={(e) => {
                  setTask({
                    ...task,
                    task: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex flex-row gap-2">
              <div className="grow">
                <Label value="Task Date" />
                <TextInput
                  type="date"
                  disabled={loading}
                  value={task?.date}
                  onChange={(e) => {
                    setTask({
                      ...task,
                      date: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="grow">
                <Label value="Task Time" />
                <input
                  type="time"
                  disabled={loading}
                  value={task?.time}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C] cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onChange={(e) => {
                    setTask({
                      ...task,
                      time: e.target.value,
                    });
                  }}
                  onClick={(e) => {
                    e.target.showPicker && e.target.showPicker();
                  }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => handleSubmit({ tasks: [...lead?.tasks, task] })}
            color="dark"
            disabled={!task.task || !task.date || !task.time}
          >
            Add
          </Button>
          <Button color="gray" onClick={() => setAddTask(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={addTransaction}
        size={"sm"}
        onClose={() => setAddTransaction(false)}
      >
        <Modal.Header>Add Transaction</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-2">
            <div>
              <TextInput
                type="number"
                disabled={loading}
                value={transaction.amount}
                onChange={(e) => {
                  setTransaction({ ...transaction, amount: e.target.value });
                }}
              />
            </div>
            <div>
              <Select
                type="time"
                disabled={loading}
                value={transaction.method}
                onChange={(e) => {
                  setTransaction({ ...transaction, method: e.target.value });
                }}
              >
                <option value="">Select</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              let date = new Date();
              let formattedDate = date.toISOString().split("T")[0];
              let hours = String(date.getHours()).padStart(2, "0");
              let minutes = String(date.getMinutes()).padStart(2, "0");
              let formattedTime = `${hours}:${minutes}`;
              let total = lead.payment.total;
              let transactions = [
                ...lead.payment.transactions,
                {
                  ...transaction,
                  amount: parseInt(transaction.amount) || 0,
                  date: formattedDate,
                  time: formattedTime,
                },
              ];
              let received = transactions.reduce(
                (sum, item) => sum + item.amount,
                0
              );
              handleSubmit({
                payment: {
                  total,
                  received,
                  transactions,
                },
              });
            }}
            color="dark"
            disabled={!transaction.amount || !transaction.method}
          >
            Add
          </Button>
          <Button color="gray" onClick={() => setAddTransaction(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Event Dates Modal */}
      <Modal
        show={editEventDates}
        size={"md"}
        onClose={() => setEditEventDates(false)}
      >
        <Modal.Header>Edit Event Dates</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {eventInfo.map((event, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <Label value="Event Date" />
                  <input
                    type="date"
                    value={event.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C]"
                    onChange={(e) => {
                      const updatedEventInfo = [...eventInfo];
                      updatedEventInfo[index] = { ...event, date: e.target.value };
                      setEventInfo(updatedEventInfo);
                    }}
                  />
                </div>
                <div>
                  <Label value="Event Time" />
                  <input
                    type="time"
                    value={event.time}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C] cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onChange={(e) => {
                      const updatedEventInfo = [...eventInfo];
                      updatedEventInfo[index] = { ...event, time: e.target.value };
                      setEventInfo(updatedEventInfo);
                    }}
                    onClick={(e) => {
                      e.target.showPicker && e.target.showPicker();
                    }}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    className="text-red-600 text-sm hover:text-red-800"
                    onClick={() => {
                      const updatedEventInfo = eventInfo.filter((_, i) => i !== index);
                      setEventInfo(updatedEventInfo);
                    }}
                  >
                    Remove Event
                  </button>
                </div>
              </div>
            ))}
            <button
              className="flex items-center gap-2 text-[#2B3F6C] text-sm hover:text-[#1e2d4a] transition-colors"
              onClick={() => {
                setEventInfo([...eventInfo, { date: "", time: "" }]);
              }}
            >
              <BsPlusCircle className="w-4 h-4" />
              <span>Add Another Event</span>
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => handleSubmit({ eventInfo })}
            color="dark"
          >
            Update
          </Button>
          <Button color="gray" onClick={() => setEditEventDates(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        show={editPayment}
        size={"sm"}
        onClose={() => setEditPayment(false)}
      >
        <Modal.Header>Edit Payment Details</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label value="Total Amount" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2B3F6C] font-semibold">₹</span>
                <input
                  type="number"
                  value={totalAmount}
                  placeholder="Enter total amount"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C]"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setTotalAmount(value);
                  }}
                />
              </div>
            </div>
            <div>
              <Label value="Amount Received" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2B3F6C] font-semibold">₹</span>
                <input
                  type="number"
                  value={amountReceived}
                  placeholder="Enter received amount"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#2B3F6C]"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setAmountReceived(value);
                  }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => handleSubmit({ 
              payment: { 
                ...lead.payment, 
                total: parseInt(totalAmount) || 0, 
                received: parseInt(amountReceived) || 0 
              } 
            })}
            color="dark"
          >
            Update
          </Button>
          <Button color="gray" onClick={() => setEditPayment(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Tab Navigation */}
      <div className="flex flex-row items-center border-b border-gray-200">
        <div
          className={`cursor-pointer font-semibold text-lg py-3 text-center flex-grow transition-colors relative ${
            display === "Details" 
              ? "text-white bg-[#2B3F6C]" 
              : "text-gray-700 bg-white hover:bg-gray-50"
          }`}
          onClick={() => {
            setDisplay("Details");
          }}
        >
          Lead details
          {display === "Details" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2B3F6C]"></div>
          )}
        </div>
        <div
          className={`cursor-pointer font-semibold text-lg py-3 text-center flex-grow transition-colors relative ${
            display === "Payment" 
              ? "text-white bg-[#2B3F6C]" 
              : "text-gray-700 bg-white hover:bg-gray-50"
          }`}
          onClick={() => {
            setDisplay("Payment");
          }}
        >
          Payment
          {display === "Payment" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2B3F6C]"></div>
          )}
        </div>
      </div>
      {display === "Details" && (
        <div className="px-6 py-4 space-y-6 bg-white min-h-screen">
          {/* Event Date & Time Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              <button
                className="flex items-center gap-1 text-[#2B3F6C] text-sm hover:text-[#1e2d4a] transition-colors"
                onClick={() => {
                  setEventInfo(lead?.eventInfo || []);
                  setEditEventDates(true);
                }}
              >
                <MdEdit size={16} />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Event date</p>
                {lead?.eventInfo?.map((item, index) => (
                  <p key={index} className="text-gray-700 mb-1">
                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : "19 May 2023"}
                  </p>
                ))}
                {(!lead?.eventInfo || lead.eventInfo.length === 0) && (
                  <>
                    <p className="text-gray-700 mb-1">19 May 2023</p>
                    <p className="text-gray-700 mb-1">20 May 2023</p>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Event time</p>
                {lead?.eventInfo?.map((item, index) => (
                  <p key={index} className="text-gray-700 mb-1">
                    {item.time || "09:30 pm"}
                  </p>
                ))}
                {(!lead?.eventInfo || lead.eventInfo.length === 0) && (
                  <>
                    <p className="text-gray-700 mb-1">09:30 pm</p>
                    <p className="text-gray-700 mb-1">06:00 pm</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
            <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-gray-700 text-sm leading-relaxed">
                {lead?.notes || "This is the notes section. All notes to be shown here as shown"}
              </p>
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Tasks</p>
            {lead?.tasks?.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 mb-3 flex justify-between items-center hover:shadow-sm transition-shadow"
                style={{ border: '1px solid #000000' }}
              >
                <p className="text-gray-900 flex-1 font-medium">{item.task}</p>
                <p className="text-gray-600 text-sm">
                  {item.time || "09:00 pm"}
                </p>
              </div>
            ))}
            {(!lead?.tasks || lead.tasks.length === 0) && (
              <div 
                className="bg-white rounded-lg p-4 mb-3 flex justify-between items-center hover:shadow-sm transition-shadow"
                style={{ border: '1px solid #000000' }}
              >
                <p className="text-gray-900 flex-1 font-medium">To call customer back tomorrow</p>
                <p className="text-gray-600 text-sm">09:00 pm</p>
              </div>
            )}
            <div
              className="flex items-center gap-2 text-sm text-black cursor-pointer mt-4 hover:text-gray-700 transition-colors"
              onClick={() => {
                setAddTask(true);
                setTask({ task: "", date: "", time: "" });
              }}
            >
              <span>Add tasks</span>
              <BsPlusCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
      {display === "Payment" && (
        <div className="px-6 py-4 space-y-6 bg-white min-h-screen">
          {/* Payment Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold text-gray-900">Payment Details</p>
              <button
                className="flex items-center gap-1 text-[#2B3F6C] text-sm hover:text-[#1e2d4a] transition-colors"
                onClick={() => {
                  setTotalAmount(lead?.payment?.total || "");
                  setAmountReceived(lead?.payment?.received || "");
                  setEditPayment(true);
                }}
              >
                <MdEdit size={16} />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Total amount</p>
                <input
                  type="text"
                  value={lead?.payment?.total || "12,000"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B3F6C] focus:border-[#2B3F6C]"
                  readOnly
                />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Amount received</p>
                <input
                  type="text"
                  value={lead?.payment?.received || "5,000"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B3F6C] focus:border-[#2B3F6C]"
                  readOnly
                />
              </div>
            </div>

            {/* Add More and Submit */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-sm text-black cursor-pointer">
                <span>Add more</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0C5.61553 0 4.26215 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32121C0.00303299 5.6003 -0.13559 7.00776 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73784 14 8.38447 14 7C14 6.08075 13.8189 5.17049 13.4672 4.32121C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67879 0.532843C8.82951 0.18106 7.91925 0 7 0ZM7 12.6C5.89243 12.6 4.80972 12.2716 3.88881 11.6562C2.96789 11.0409 2.25013 10.1663 1.82628 9.14302C1.40243 8.11976 1.29153 6.99379 1.50761 5.90749C1.72368 4.8212 2.25703 3.82337 3.0402 3.0402C3.82338 2.25703 4.8212 1.72368 5.9075 1.5076C6.99379 1.29153 8.11976 1.40242 9.14303 1.82627C10.1663 2.25012 11.0409 2.96789 11.6562 3.88881C12.2716 4.80972 12.6 5.89242 12.6 7C12.6 8.48521 12.01 9.90959 10.9598 10.9598C9.9096 12.01 8.48521 12.6 7 12.6ZM9.8 6.3H7.7V4.2C7.7 4.01435 7.62625 3.8363 7.49498 3.70502C7.3637 3.57375 7.18565 3.5 7 3.5C6.81435 3.5 6.6363 3.57375 6.50503 3.70502C6.37375 3.8363 6.3 4.01435 6.3 4.2V6.3H4.2C4.01435 6.3 3.8363 6.37375 3.70503 6.50502C3.57375 6.6363 3.5 6.81435 3.5 7C3.5 7.18565 3.57375 7.3637 3.70503 7.49497C3.8363 7.62625 4.01435 7.7 4.2 7.7H6.3V9.8C6.3 9.98565 6.37375 10.1637 6.50503 10.295C6.6363 10.4262 6.81435 10.5 7 10.5C7.18565 10.5 7.3637 10.4262 7.49498 10.295C7.62625 10.1637 7.7 9.98565 7.7 9.8V7.7H9.8C9.98565 7.7 10.1637 7.62625 10.295 7.49497C10.4263 7.3637 10.5 7.18565 10.5 7C10.5 6.81435 10.4263 6.6363 10.295 6.50502C10.1637 6.37375 9.98565 6.3 9.8 6.3Z" fill="black"/>
                </svg>
              </div>
              <button
                className="text-white font-medium transition-colors"
                style={{
                  backgroundColor: '#2B3F6C',
                  width: '144px',
                  height: '31px',
                  top: '425px',
                  left: '227px',
                  borderRadius: '4px',
                  opacity: 1
                }}
                onClick={() => {
                  setAddTransaction(true);
                  setTransaction({ amount: "", method: "", date: "", time: "" });
                }}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-4">Payment History</p>
            
            <div className="space-y-4">
              {lead?.payment?.transactions?.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                      {toPriceString(item?.amount) || "1,000"}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.date} {item.time || "18 May 2023 09:00 pm"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white text-sm">
                      {item.method || "UPI/Cash"}
                    </button>
                    <MdEdit className="text-gray-600 cursor-pointer" size={16} />
                  </div>
                </div>
              ))}
              
              {(!lead?.payment?.transactions || lead.payment.transactions.length === 0) && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                        1,000
                      </div>
                      <p className="text-sm text-gray-600 mt-1">18 May 2023 09:00 pm</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white text-sm">
                        UPI/Cash
                      </button>
                      <MdEdit className="text-gray-600 cursor-pointer" size={16} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                        2,000
                      </div>
                      <p className="text-sm text-gray-600 mt-1">19 May 2023 10:00 pm</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white text-sm">
                        UPI/Cash
                      </button>
                      <MdEdit className="text-gray-600 cursor-pointer" size={16} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                        1,500
                      </div>
                      <p className="text-sm text-gray-600 mt-1">20 May 2023 11:00 pm</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white text-sm">
                        UPI/Cash
                      </button>
                      <MdEdit className="text-gray-600 cursor-pointer" size={16} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
