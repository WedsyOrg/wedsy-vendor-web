import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import {
  MdEdit,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
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
  const [editDetails, setEditDetails] = useState(false);
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
          alert("Error");
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
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-4 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-black uppercase">
          {lead?.name}
        </p>
        <MdEdit
          className="cursor-pointer text-black"
          size={20}
          onClick={() => {
            setName(lead?.name);
            setPhone(lead?.phone);
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
          <div className="flex flex-col gap-2">
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
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => handleSubmit({ name, phone })}
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
                <TextInput
                  type="time"
                  disabled={loading}
                  value={task?.time}
                  onChange={(e) => {
                    setTask({
                      ...task,
                      time: e.target.value,
                    });
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
          <Button color="gray" onClick={() => setEditDetails(false)}>
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
          <Button color="gray" onClick={() => setEditDetails(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Tab Navigation */}
      <div className="flex flex-row items-center mb-0 border-b">
        <div
          className={`cursor-pointer font-semibold text-lg py-3 text-center flex-grow transition-colors ${
            display === "Details" 
              ? "text-white bg-[#840032]" 
              : "text-black bg-white"
          }`}
          onClick={() => {
            setDisplay("Details");
          }}
        >
          Lead details
        </div>
        <div
          className={`cursor-pointer font-semibold text-lg py-3 text-center flex-grow transition-colors ${
            display === "Payment" 
              ? "text-white bg-[#840032]" 
              : "text-black bg-white"
          }`}
          onClick={() => {
            setDisplay("Payment");
          }}
        >
          Payment
        </div>
      </div>
      {display === "Details" && (
        <div className="px-6 py-4 space-y-6">
          {/* Event Date & Time Section */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm font-medium text-black mb-6">Event date</p>
              {lead?.eventInfo?.map((item, index) => (
                <p key={index} className="text-black mb-1">
                  {item.date ? new Date(item.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : "19 May 2023"}
                </p>
              ))}
              {(!lead?.eventInfo || lead.eventInfo.length === 0) && (
                <>
                  <p className="text-black mb-1">19 May 2023</p>
                  <p className="text-black mb-1">20 May 2023</p>
                </>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-6">Event time</p>
              {lead?.eventInfo?.map((item, index) => (
                <p key={index} className="text-black mb-1">
                  {item.time || "09:30 pm"}
                </p>
              ))}
              {(!lead?.eventInfo || lead.eventInfo.length === 0) && (
                <>
                  <p className="text-black mb-1">09:30 pm</p>
                  <p className="text-black mb-1">06:00 pm</p>
                </>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <p className="text-sm font-medium text-black mb-2">Notes</p>
            <div className="bg-pink-100 rounded-lg p-4">
              <p className="text-black text-sm leading-relaxed">
                {lead?.notes || "This is the notes section. All notes to be shown here as shown"}
              </p>
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <p className="text-sm font-medium text-black mb-2">Tasks</p>
            {lead?.tasks?.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-3 mb-3 flex justify-between items-center"
              >
                <p className="text-black flex-1">{item.task}</p>
                <p className="text-black text-sm">
                  {item.time || "09:00 pm"}
                </p>
              </div>
            ))}
            {(!lead?.tasks || lead.tasks.length === 0) && (
              <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3 flex justify-between items-center">
                <p className="text-black flex-1">To call customer back tomorrow</p>
                <p className="text-black text-sm">09:00 pm</p>
              </div>
            )}
            <div
              className="flex items-center gap-2 text-sm text-black cursor-pointer mt-4"
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
        <div className="px-6 py-4 space-y-6">
          {/* Payment Details */}
          <div>
            <p className="text-lg font-semibold text-black mb-4">Payment Details</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-black mb-2">Total Amount</p>
                <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                  {toPriceString(lead?.payment?.total) || "₹0"}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-black mb-2">Amount Received</p>
                <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                  {toPriceString(lead?.payment?.received) || "₹0"}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <p className="text-lg font-semibold text-black mb-4">Payment History</p>
            
            <div className="space-y-3">
              {lead?.payment?.transactions?.map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                      {toPriceString(item?.amount) || "₹0"}
                    </div>
                  </div>
                  <div>
                    <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                      {item.method || "Cash"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">
                      {item.date} {item.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!lead?.payment?.transactions || lead.payment.transactions.length === 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                      ₹500
                    </div>
                  </div>
                  <div>
                    <div className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black bg-gray-50">
                      Cash
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">
                      19 May 2023 09:30
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div
              className="flex items-center gap-2 text-sm text-black cursor-pointer mt-4"
              onClick={() => {
                setAddTransaction(true);
                setTransaction({ amount: "", method: "", date: "", time: "" });
              }}
            >
              <span>Add more</span>
              <BsPlusCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
