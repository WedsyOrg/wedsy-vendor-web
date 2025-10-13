import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdArrowForwardIos,
  MdCancel,
  MdClose,
  MdFilterAlt,
  MdOutlineLocationOn,
  MdSearch,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Label,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Home({}) {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(true);
  const [newPackage, setPackage] = useState({
    name: "",
    services: [""],
    price: 0,
    amountToWedsy: 0,
    amountToVendor: 0,
  });
  const [bookingAmount, setBookingAmount] = useState({});

  // Function to convert number to words
  const numberToWords = (num) => {
    if (num === 0) return "Zero";
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    
    return 'Number too large';
  };

  const handleSubmit = (redirect) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-package`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newPackage),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message !== "success") {
          toast.error("Error");
        } else if (redirect) {
          router.push(`/personal-packages`);
        } else {
          setPackage({
            name: "",
            services: [""],
            price: 0,
            amountToWedsy: 0,
            amountToVendor: 0,
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchBookingAmount = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/config?code=MUA-BookingAmount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setBookingAmount(response.data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchBookingAmount();
  }, []);
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon backToSettings={true} />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          {showTerms ? "Terms & Conditions" : "Create Your Packages/Offers"}
        </p>
      </div>
      
      {showTerms ? (
        // Terms and Conditions Full Page
        <div className="flex flex-col gap-4 py-4 px-6 min-h-[80vh]">
          <div className="space-y-6 text-sm text-gray-700">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
              <p className="text-gray-600">Package Creation Agreement</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800">Important Notice:</p>
              <p className="text-blue-700">Please read these terms carefully before creating your package. By proceeding, you agree to be bound by these terms and conditions.</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">1. Package Accuracy</h3>
                <p>You must provide accurate and detailed information about your services, pricing, and availability. Any misleading information may result in package removal and account penalties.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2. Pricing Transparency</h3>
                <p>All prices must be clearly stated and include any additional charges. Hidden fees are strictly prohibited. Any price changes must be communicated clearly to clients.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">3. Service Quality Standards</h3>
                <p>You are responsible for delivering services exactly as described in your package. Failure to meet expectations may affect your vendor rating and platform standing.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">4. Availability Management</h3>
                <p>Keep your availability updated in real-time. Cancelling confirmed bookings without valid reasons may result in penalties and account restrictions.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">5. Client Communication</h3>
                <p>Maintain professional communication with clients at all times. Respond to inquiries promptly and handle all interactions with courtesy and respect.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">6. Platform Compliance</h3>
                <p>Follow all platform guidelines and policies. Violations may result in warnings, package removal, or account suspension depending on severity.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">7. Payment Terms</h3>
                <p>Payment will be processed according to platform terms. You agree to the payment schedule, commission structure, and any applicable fees.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">8. Cancellation & Refund Policy</h3>
                <p>Define clear cancellation and refund policies for your packages. These policies will be binding for all bookings and must be fair to clients.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">9. Data Protection</h3>
                <p>Protect client information and maintain confidentiality. Do not share client details with third parties without explicit consent.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">10. Dispute Resolution</h3>
                <p>Any disputes will be resolved through the platform&apos;s dispute resolution process. You agree to cooperate fully with any investigations.</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <p className="font-medium text-yellow-800">Agreement:</p>
              <p className="text-yellow-700">By clicking &quot;Accept &amp; Continue&quot;, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-auto">
            <button
              onClick={() => router.push("/personal-packages")}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Decline
            </button>
            <button
              onClick={() => setShowTerms(false)}
              className="flex-1 py-3 px-4 bg-[#2B3F6C] text-white rounded-lg hover:bg-[#1e2d4a] transition-colors font-medium"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      ) : (
        // Package Creation Form
        <div className="flex flex-col gap-4 py-4 px-6 divide-y-2">
          <div className="flex flex-col gap-2">
          <div>
            <Label value="Package Name" />
            <TextInput
              placeholder="Package Name"
              value={newPackage?.name}
              onChange={(e) => {
                setPackage({
                  ...newPackage,
                  name: e.target.value,
                });
              }}
            />
          </div>
          <div>
            <Label value="Services that will be provided" />
            <p className="text-xs text-gray-500 mb-2">Add one service at a time</p>
            {newPackage?.services?.map((item, index) => (
              <div
                className="flex flex-row gap-2 items-center mb-2"
                key={index}
              >
                <TextInput
                  key={index}
                  placeholder="Enter service name"
                  value={item}
                  onChange={(e) => {
                    // Restrict special characters and commas
                    const value = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '');
                    let temp = newPackage?.services;
                    temp[index] = value;
                    setPackage({
                      ...newPackage,
                      services: temp,
                    });
                  }}
                  className="grow"
                />
                <MdCancel
                  size={20}
                  onClick={() => {
                    setPackage({
                      ...newPackage,
                      services: newPackage?.services?.filter(
                        (_, i) => i !== index
                      ),
                    });
                  }}
                />
              </div>
            ))}
            <div
              className="flex items-center gap-1 text-sm cursor-pointer text-[#2B3F6C] hover:text-[#1e2d4a]"
              onClick={() => {
                setPackage({
                  ...newPackage,
                  services: [...newPackage?.services, ""],
                });
              }}
            >
              Add more <BsPlusCircle />
            </div>
          </div>
          <div>
            <Label value="Package Price" />
            <TextInput
              placeholder="Enter amount (max 5 digits)"
              type="number"
              max="99999"
              value={newPackage?.price}
              onChange={(e) => {
                // Limit to 5 digits and only allow numbers
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                let p = parseInt(value) || 0;
                setPackage({
                  ...newPackage,
                  price: value,
                  amountToWedsy:
                    p * (bookingAmount?.personalPackage?.percentage / 100),
                  amountToVendor:
                    p * (1 - bookingAmount?.personalPackage?.percentage / 100),
                });
              }}
            />
            {newPackage?.price && parseInt(newPackage.price) > 0 && (
              <p className="text-sm text-gray-600 mt-1 italic">
                Amount in words: {numberToWords(parseInt(newPackage.price))} Rupees
              </p>
            )}
          </div>
          <div>
            <p className="text-xl font-semibold mt-4">Payment Breakdown</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex flex-row justify-between">
                <p className="font-medium">Total Amount</p>
                <p className="font-medium">{toPriceString(newPackage?.price || 0)}</p>
              </div>
              <div className="flex flex-row justify-between">
                <p>Wedsy Commission (Commission + GST)</p>
                <p>{toPriceString(newPackage?.amountToWedsy || 0)}</p>
              </div>
              <div className="flex flex-row justify-between border-t pt-2">
                <p className="font-medium">Payable to Vendor</p>
                <p className="font-medium text-green-600">{toPriceString(newPackage?.amountToVendor || 0)}</p>
              </div>
            </div>
          </div>
          <Button
            className="mt-4 px-6 text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max mx-auto"
            onClick={() => {
              handleSubmit(true);
            }}
          >
            Create Package
          </Button>
        </div>
      </div>
      )}
    </>
  );
}
