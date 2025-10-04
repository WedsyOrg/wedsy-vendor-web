import { processMobileNumber } from "@/utils/phoneNumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

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
  });
  const SendOTP = () => {
    setData({
      ...data,
      loading: true,
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
        });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
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
            name: "",
            phone: "",
            loading: false,
            success: true,
            otpSent: false,
            Otp: "",
            ReferenceId: "",
            message: "",
          });
          localStorage.setItem("token", response.token);
          router.push("/");
        } else {
          setData({
            ...data,
            loading: false,
            Otp: "",
            message: response.message,
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
          className="bg-gray-100 p-6"
          style={{
            width: '334px',
            height: '324px',
            borderRadius: '5px',
            border: '1px solid #9B9B9B',
            opacity: 1
          }}
        >
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1 uppercase">
              NAME
            </label>
            <input
              type="text"
              placeholder="Makeup Artist"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-gray-400 focus:border-[#8B0000] focus:outline-none py-2 text-gray-700"
            />
          </div>

          {/* Phone Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1 uppercase">
              PHONE NO.
            </label>
            <input
              type="text"
              placeholder="1234"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-gray-400 focus:border-[#8B0000] focus:outline-none py-2 text-gray-700"
            />
          </div>

          {/* OTP Field - Only show when OTP is sent */}
          {data.otpSent && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1 uppercase">
                OTP
              </label>
              <input
                type="text"
                placeholder="1234"
                value={data.Otp}
                onChange={(e) => setData({ ...data, Otp: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-gray-400 focus:border-[#8B0000] focus:outline-none py-2 text-gray-700"
              />
            </div>
          )}

          {/* Error Message */}
          {data.message && (
            <p className="text-red-500 text-sm mb-4">{data.message}</p>
          )}

          {/* Register Button */}
          <button
            onClick={() => {
              if (data.otpSent) {
                handleLogin();
              } else {
                SendOTP();
              }
            }}
            disabled={
              !data.name ||
              !data.phone ||
              !processMobileNumber(data.phone) ||
              data.loading ||
              (data.otpSent ? !data.Otp : false)
            }
            className="w-full bg-[#8B0000] text-white font-medium py-3 px-6 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
          >
            {data.loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              "Register"
            )}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Already a member?{" "}
            <Link href="/signup" className="text-[#8B0000] underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
