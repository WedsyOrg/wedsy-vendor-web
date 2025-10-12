import { processMobileNumber } from "@/utils/phoneNumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";

export default function Signup({}) {
  let router = useRouter();
  const { isTransitioning, navigateWithTransition } = usePageTransition();
  const [data, setData] = useState({
    contactName: "",
    mobileNo: "",
    emailId: "",
    gender: "",
    category: "",
    serviceOffered: "",
    loading: false,
    success: false,
    message: "",
  });

  const [dropdowns, setDropdowns] = useState({
    gender: false,
    category: false
  });

  const serviceOptions = [
    { id: "makeup", label: "Make Up", icon: "✓" },
    { id: "hair", label: "Hair Styling", icon: "✓" },
    { id: "both", label: "Both", icon: "✓" }
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  const categoryOptions = [
    { value: "makeup-hair", label: "Makeup and Hair styling" },
    { value: "catering", label: "Catering" },
    { value: "photography-videography", label: "Photography & Videography" },
    { value: "choreographers", label: "Choreographers" },
    { value: "venue-owner", label: "Venue Owner/Manager" }
  ];

  const handleServiceSelect = (serviceId) => {
        setData(prev => ({
          ...prev,
      serviceOffered: prev.serviceOffered === serviceId ? "" : serviceId
    }));
  };

  const toggleDropdown = (dropdownName) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const selectOption = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    setDropdowns(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleSignup = () => {
    // Store form data in localStorage for multi-step signup
    const signupData = {
      contactName: data.contactName,
      mobileNo: processMobileNumber(data.mobileNo),
      emailId: data.emailId,
      gender: data.gender,
      category: data.category,
      serviceOffered: data.serviceOffered,
    };
    
    localStorage.setItem("signup-step1", JSON.stringify(signupData));
    
    // Navigate to business address page with transition
    navigateWithTransition("/signup-business-address", 'left');
  };

    return (
    <div 
      className="min-h-screen bg-white flex flex-col transition-transform duration-300 ease-in-out"
      style={{
        transform: isTransitioning ? 'translateX(100%)' : 'translateX(0)'
      }}
    >
      {/* Custom CSS */}
      <style jsx>{`
        .input-field {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 16px 20px;
          width: 100%;
          font-size: 16px;
          color: #374151;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        .input-field::placeholder {
          color: #9CA3AF;
        }
        .input-field:focus {
          outline: none;
          border-color: #2B3F6C;
          box-shadow: none;
        }
        .select-field {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 16px 20px;
          padding-right: 50px;
          width: 100%;
          font-size: 16px;
          color: #374151;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .select-field:focus {
          outline: none !important;
          border-color: #2B3F6C !important;
          box-shadow: none !important;
        }
        .select-field option {
          color: #374151 !important;
          background: white !important;
          padding: 8px 12px;
        }
        .select-field option:first-child {
          color: #9CA3AF !important;
          background: white !important;
        }
        .select-field option:checked {
          background: white !important;
          color: #374151 !important;
        }
        .select-field option:hover {
          background: #F3F4F6 !important;
          color: #374151 !important;
        }
        select:focus option:checked {
          background: white !important;
          color: #374151 !important;
        }
        select option:checked {
          background: white !important;
          color: #374151 !important;
        }
        .service-option {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }
        .service-option:hover {
          border-color: #2B3F6C;
        }
        .service-option.selected {
          border-color: #2B3F6C;
          background-color: #FEF2F2;
        }
        .checkmark {
          width: 20px;
          height: 20px;
          background-color: #10B981;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        /* iPhone 12 Pro and iPhone 14 Pro Max specific spacing */
        @media screen and (max-height: 844px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
        
        /* iPhone 14 Pro Max specific spacing */
        @media screen and (min-height: 932px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
        
        /* Ensure proper spacing for all iPhone models */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }
        
        /* Mobile optimization for smaller screens */
        @media screen and (max-height: 800px) {
          .space-y-6 > * + * {
            margin-top: 20px !important;
          }
          .space-y-3 > * + * {
            margin-top: 12px !important;
          }
        }
        
        @media screen and (max-height: 700px) {
          .flex-1 {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          .space-y-6 > * + * {
            margin-top: 16px !important;
          }
          .space-y-3 > * + * {
            margin-top: 10px !important;
          }
        }
        
        @media screen and (max-height: 600px) {
          .flex-1 {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          .space-y-6 > * + * {
            margin-top: 12px !important;
          }
          .space-y-3 > * + * {
            margin-top: 8px !important;
          }
          .mb-4 {
            margin-bottom: 8px !important;
          }
          .mb-3 {
            margin-bottom: 6px !important;
          }
          .mb-2 {
            margin-bottom: 4px !important;
          }
        }
      `}</style>

      <div className="flex-1 flex flex-col px-4 py-4 pb-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWithTransition('/login', 'right')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Sign up</h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Form Container */}
        <div className="space-y-6 flex-grow">
          {/* Contact Name */}
          <div>
            <input
              type="text"
              placeholder="Contact Name"
              value={data.contactName}
              onChange={(e) => setData(prev => ({ ...prev, contactName: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Mobile No */}
          <div>
            <input
              type="text"
              placeholder="Mobile No"
              value={data.mobileNo}
              onChange={(e) => setData(prev => ({ ...prev, mobileNo: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Email ID */}
          <div>
            <input
              type="email"
              placeholder="Email Id"
              value={data.emailId}
              onChange={(e) => setData(prev => ({ ...prev, emailId: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Gender Dropdown */}
          <div className="relative">
            <div
              className="select-field"
              onClick={() => toggleDropdown('gender')}
            >
              {data.gender ? genderOptions.find(opt => opt.value === data.gender)?.label : 'Gender'}
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
              </svg>
            </div>
            {dropdowns.gender && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {genderOptions.map(option => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                    onClick={() => selectOption('gender', option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <div
              className="select-field"
              onClick={() => toggleDropdown('category')}
            >
              {data.category ? categoryOptions.find(opt => opt.value === data.category)?.label : 'Category'}
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
              </svg>
            </div>
            {dropdowns.category && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {categoryOptions.map(option => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                    onClick={() => selectOption('category', option.value)}
                  >
                    {option.label}
                  </div>
          ))}
        </div>
            )}
          </div>

          {/* Services You Offer */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Services you offer</h3>
            <div className="space-y-3">
              {serviceOptions.map(service => (
                <div
                  key={service.id}
                  className={`service-option ${data.serviceOffered === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <span className="text-sm text-gray-700">{service.label}</span>
                  {data.serviceOffered === service.id && (
                    <div className="checkmark">
                      {service.icon}
                    </div>
        )}
      </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {data.message && (
            <div className="text-red-500 text-sm text-center">
              {data.message}
            </div>
          )}

          {/* Sign Up Button */}
          <div className="flex justify-center mt-auto pt-6">
            <button
              onClick={handleSignup}
              disabled={data.loading}
              style={{
                width: '140px',
                height: '50px',
                borderRadius: '25px',
                background: '#2B3F6C',
                opacity: 1
              }}
              className="text-white font-medium hover:bg-[#6B0025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
            >
              {data.loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "NEXT"
              )}
            </button>
          </div>
        </div>

        {/* Already a member link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already a member?{" "}
            <button 
              onClick={() => navigateWithTransition('/login', 'right')}
              className="text-[#8B0000] underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}