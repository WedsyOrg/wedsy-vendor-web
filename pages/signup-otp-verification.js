import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { usePageTransition } from "@/hooks/usePageTransition";

export default function SignupOtpVerification({}) {
  let router = useRouter();
  const { isTransitioning, navigateWithTransition } = usePageTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [canEditMobile, setCanEditMobile] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [lastOtpTime, setLastOtpTime] = useState(0);
  
  const otpInputs = useRef([]);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get mobile number from localStorage
    const step1Data = JSON.parse(localStorage.getItem("signup-step1") || "{}");
    if (step1Data.mobileNo) {
      setMobileNumber(step1Data.mobileNo);
      // Don't automatically send OTP - it was already sent from Business Address page
      // Just start the resend timer
      setResendTimer(60);
    } else {
      // If no mobile number, redirect to signup with transition
      navigateWithTransition("/signup", 'right');
    }
  }, []);

  // Separate useEffect for timer management
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [resendTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any remaining timers
      setResendTimer(0);
    };
  }, []);

  const sendOtpToMobile = async (mobileNo) => {
    // DoS Protection: Check rate limiting
    const now = Date.now();
    const timeSinceLastOtp = now - lastOtpTime;
    
    // Prevent more than 3 OTP requests in 5 minutes
    if (otpAttempts >= 3 && timeSinceLastOtp < 300000) { // 5 minutes
      setError('Too many OTP requests. Please wait 5 minutes before trying again.');
      return;
    }
    
    // Prevent OTP requests within 60 seconds (rate limiting)
    if (timeSinceLastOtp < 60000) { // 60 seconds
      setError('Please wait 60 seconds before requesting another OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the same API structure as the working login page
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: mobileNo
        }),
      });

      const result = await response.json();

      if (result.ReferenceId) {
        // Success - store ReferenceId and reset timer
        setResendTimer(60);
        setOtpSent(true);
        setOtpAttempts(prev => prev + 1);
        setLastOtpTime(now);
        
        // Store ReferenceId for verification
        localStorage.setItem("otpReferenceId", result.ReferenceId);
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index < 6);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    otpInputs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get ReferenceId from localStorage
      const referenceId = localStorage.getItem("otpReferenceId");
      
      if (!referenceId) {
        setError("Session expired. Please request OTP again.");
        return;
      }

      // Get all signup data
      const step1Data = JSON.parse(localStorage.getItem("signup-step1") || "{}");
      const step2Data = JSON.parse(localStorage.getItem("signup-step2") || "{}");
      
      const requestBody = {
        name: step1Data.contactName,
        phone: mobileNumber,
        email: step1Data.emailId,
        gender: step1Data.gender,
        servicesOffered: step1Data.serviceOffered,
        category: step1Data.category,
        Otp: otpString,
        ReferenceId: referenceId,
        // Include address data from step2
        state: step2Data.state,
        city: step2Data.city,
        area: step2Data.area,
        address: step2Data.address,
        googleMaps: step2Data.googleMaps,
        pincode: step2Data.pincode
      };
      
      
      // Use the vendor signup endpoint (not login endpoint)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.message === "success" && result.token) {
        setSuccess(true);
        localStorage.setItem("token", result.token);
        localStorage.setItem("vendor-just-signed-up", "true");
        
        // Show success toast
        toast.success("Registration completed successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Clear signup data
        localStorage.removeItem("signup-step1");
        localStorage.removeItem("signup-step2");
        localStorage.removeItem("otpReferenceId");
        
        // Redirect to dashboard with transition
        setTimeout(() => {
          navigateWithTransition("/", 'left');
        }, 2000);
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      // Handle error silently
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    // Additional DoS protection
    const now = Date.now();
    if (lastOtpTime && (now - lastOtpTime) < 60000) {
      setError('Please wait 60 seconds before requesting another OTP.');
      return;
    }
    
    await sendOtpToMobile(mobileNumber);
  };

  const handleEditMobile = () => {
    setCanEditMobile(true);
  };

  const handleMobileChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleMobileSubmit = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    await sendOtpToMobile(mobileNumber);
    setCanEditMobile(false);
    setOtp(['', '', '', '', '']);
  };

  return (
    <>
      <Head>
        <title>Verify OTP - Wedsy Vendor</title>
        <meta name="description" content="Verify your mobile number with OTP" />
      </Head>

      <div 
        className="min-h-screen bg-white flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          transform: isTransitioning 
            ? 'translateX(-100%)' 
            : isVisible 
              ? 'translateX(0)' 
              : 'translateX(100%)'
        }}
      >
        {/* Purple Line */}
        <div className="w-full h-1 bg-purple-600"></div>

        {/* Top Bar with Title and Back Button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWithTransition('/signup-business-address', 'right')}
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
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">

            {/* OTP Verification Section */}
            <div className="space-y-8">
            {/* Verify with OTP */}
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Verify with otp</h2>
              
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpInputs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-[#840032] focus:ring-2 focus:ring-[#840032]/20"
                  />
                ))}
              </div>

              {/* OTP Sent Message */}
              <p className="text-sm text-gray-600 mb-2">OTP has been sent to your mobile number</p>
              
              {/* Mobile Number Display/Edit */}
              {!canEditMobile ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {mobileNumber.startsWith('+91') ? mobileNumber : 
                     mobileNumber.startsWith('91') ? `+${mobileNumber}` : 
                     `+91 ${mobileNumber}`}
                  </p>
                  <button
                    onClick={handleEditMobile}
                    className="text-sm text-[#840032] underline hover:no-underline"
                  >
                    Edit mobile no? ✏️
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder="Enter mobile number"
                    className="w-full max-w-xs mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#840032]"
                  />
                  <button
                    onClick={handleMobileSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6B0025] disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              )}

              {/* Resend OTP */}
              <div className="mt-4">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in {resendTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-[#840032] underline hover:no-underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Success Message - Removed green box, using toast instead */}

            {/* Verify Button */}
            <div className="flex justify-center">
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.some(digit => !digit)}
                style={{
                  width: '140px',
                  height: '50px',
                  borderRadius: '25px',
                  background: '#840032',
                  opacity: 1
                }}
                className="text-white font-medium hover:bg-[#6B0025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </>
  );
}
