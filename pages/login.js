import { processMobileNumber } from "@/utils/phoneNumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AnimatedInput from "@/components/AnimatedInput";

export default function Login({}) {
  let router = useRouter();
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
  const SendOTP = () => {
    // Prevent multiple OTP sends
    if (data.loading || data.otpSent) {
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
  
  const handleLogin = () => {
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
          router.push("/");
        } else {
          setData({
            ...data,
            loading: false,
            Otp: "",
            message: response.message,
            otpMessage: "",
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="min-h-screen relative bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: "url('/assets/background/login.png')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: '#000000BF' }}></div>
      
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
          className="p-4"
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
            <div className="flex items-center justify-end mb-1">
              {data.phone && data.phone.length > 0 && (
                <button
                  onClick={SendOTP}
                  className="text-xs text-[#8B0000] underline hover:text-[#6B0000] transition-colors"
                  disabled={data.loading}
                >
                  Send OTP
                </button>
              )}
            </div>
            <AnimatedInput
              label="Phone Number"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </div>

          {/* OTP Field - Always visible */}
          <div className="mb-4">
            <AnimatedInput
              label="OTP"
              value={data.Otp}
              onChange={(e) => setData({ ...data, Otp: e.target.value })}
            />
          </div>

          {/* Success Message for OTP */}
          {data.otpMessage && (
            <p className="text-green-600 text-sm mb-3 bg-green-50 px-3 py-2 rounded border border-green-200">
              {data.otpMessage}
            </p>
          )}

          {/* Error Message */}
          {data.message && (
            <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded border border-red-200">
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
            className="w-full bg-[#840032] text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors text-base"
          >
            {data.loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Switch to Sign Up */}
          <p className="text-center text-gray-700 text-sm mt-4 font-medium">
            Not a member yet?{" "}
            <Link href="/signup" className="text-[#840032] underline hover:text-[#840032]/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
