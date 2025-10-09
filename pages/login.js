import { processMobileNumber } from "@/utils/phoneNumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import AnimatedInput from "@/components/AnimatedInput";
import { usePageTransition } from "@/hooks/usePageTransition";

export default function Login({}) {
  let router = useRouter();
  const { isTransitioning, navigateWithTransition } = usePageTransition();
  const [data, setData] = useState({
    name: "",
    phone: "",
    loading: false,
    success: false,
    otpSent: false,
    Otp: "",
    ReferenceId: "",
    message: "",
    otpMessage: "",
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [lastOtpTime, setLastOtpTime] = useState(0);

  // Timer management for resend OTP
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
      setResendTimer(0);
    };
  }, []);

  const SendOTP = () => {
    // Prevent multiple OTP sends
    if (data.loading || data.otpSent) {
      return;
    }

    // Rate limiting - prevent more than 3 OTP requests in 5 minutes
    const now = Date.now();
    const timeSinceLastOtp = now - lastOtpTime;
    
    if (otpAttempts >= 3 && timeSinceLastOtp < 300000) { // 5 minutes
      setData({
        ...data,
        message: "Too many OTP requests. Please wait 5 minutes before trying again.",
      });
      return;
    }
    
    // Prevent OTP requests within 60 seconds (rate limiting)
    if (timeSinceLastOtp < 60000) {
      setData({
        ...data,
        message: "Please wait 60 seconds before requesting another OTP.",
      });
      return;
    }
    
    setData({
      ...data,
      loading: true,
      message: "",
      otpMessage: "",
    });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setData({
          ...data,
          loading: false,
          otpSent: true,
          ReferenceId: response.ReferenceId,
          otpMessage: "OTP sent successfully!",
        });
        // Start resend timer and update attempts
        setResendTimer(60);
        setOtpAttempts(prev => prev + 1);
        setLastOtpTime(now);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setData({
          ...data,
          loading: false,
          message: "Failed to send OTP. Please try again.",
        });
      });
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    
    // Additional rate limiting check
    const now = Date.now();
    const timeSinceLastOtp = now - lastOtpTime;
    
    if (timeSinceLastOtp < 60000) {
      setData({
        ...data,
        message: "Please wait 60 seconds before requesting another OTP.",
      });
      return;
    }
    
    // Reset OTP field and resend
    setData({
      ...data,
      Otp: "",
      message: "",
      otpMessage: "",
      loading: true,
    });
    
    // Send OTP directly without calling SendOTP (to bypass otpSent check)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setData({
          ...data,
          loading: false,
          otpSent: true,
          ReferenceId: response.ReferenceId,
          otpMessage: "OTP resent successfully!",
          Otp: "",
          message: "",
        });
        // Start resend timer and update attempts
        setResendTimer(60);
        setOtpAttempts(prev => prev + 1);
        setLastOtpTime(now);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setData({
          ...data,
          loading: false,
          message: "Failed to resend OTP. Please try again.",
        });
      });
  };
  
  const handleLogin = () => {
    setIsSigningIn(true);
    setData({
      ...data,
      loading: true,
    });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: processMobileNumber(data.phone),
        Otp: data.Otp,
        ReferenceId: data.ReferenceId,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message === "Login Successful" && response.token) {
          setData({
            ...data,
            phone: "",
            loading: false,
            success: true,
            otpSent: false,
            Otp: "",
            ReferenceId: "",
            message: "",
            otpMessage: "",
          });
          localStorage.setItem("token", response.token);
          
          // Add a small delay to show the skeleton before navigation
          setTimeout(() => {
            setIsSigningIn(false);
            router.push("/");
          }, 1000);
        } else {
          setData({
            ...data,
            loading: false,
            Otp: "",
            message: response.message,
            otpMessage: "",
          });
          setIsSigningIn(false);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setIsSigningIn(false);
        setData({
          ...data,
          loading: false,
          message: "An error occurred. Please try again.",
        });
      });
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-in-out"
      style={{ 
        backgroundImage: "url('/assets/background/login.png')",
        transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: '#000000BF' }}></div>
      
      {/* Loading Overlay */}
      {isSigningIn && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#000000BF' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Signing you in...</p>
          </div>
        </div>
      )}
      
      {/* Custom CSS to override focus styles */}
      <style jsx>{`
        input:focus {
          border-bottom: 1px solid #9CA3AF !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <img 
            src="/logo-white.png" 
            alt="WEDSY Logo" 
            style={{
              width: '198px',
              height: '74px',
              opacity: 1
            }}
            className="mx-auto mb-2"
          />
          <p className="text-white text-base font-sans tracking-wide uppercase" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
            MAKEUP & BEAUTY
          </p>
        </div>

        {/* Form Container */}
        <div 
          className="p-4 pt-5"
          style={{
            width: '100%',
            maxWidth: '320px',
            borderRadius: '8px',
            border: '1px solid #9B9B9B',
            opacity: 1,
            backgroundColor: '#FFFFFFBF'
          }}
        >

          {/* Phone Field */}
          <div className="mb-3">
            <AnimatedInput
              label="Phone Number"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </div>

          {/* OTP Field - Always visible */}
          <div className="mb-4">
            <div className="flex items-center justify-end mb-1">
              {data.otpSent && (
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || data.loading}
                  className="text-xs text-[#8B0000] underline hover:text-[#6B0000] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              )}
            </div>
            <AnimatedInput
              label="OTP"
              value={data.Otp}
              onChange={(e) => setData({ ...data, Otp: e.target.value })}
            />
          </div>

          {/* Success Message for OTP */}
          {data.otpMessage && (
            <p className="text-gray-700 text-xs py-2">
              {data.otpMessage}
            </p>
          )}

          {/* Error Message */}
          {data.message && (
            <p className="text-gray-700 text-xs py-2">
              {data.message}
            </p>
          )}

          {/* Sign In Button */}
          <button
            onClick={() => {
              if (data.otpSent && data.Otp) {
                handleLogin();
              } else if (data.phone && !data.otpSent) {
                SendOTP();
              }
            }}
            disabled={!data.phone || (data.otpSent && !data.Otp) || data.loading}
            className="w-full bg-[#840032] text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : data.otpSent ? (
              "Sign In"
            ) : (
              "Send OTP"
            )}
          </button>

          {/* Switch to Sign Up */}
          <p className="text-center text-gray-700 text-sm mt-4 font-medium">
            Not a member yet?{" "}
            <button 
              onClick={() => navigateWithTransition('/signup', 'left')}
              className="text-[#840032] underline hover:text-[#840032]/80 transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
