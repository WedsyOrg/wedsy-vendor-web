import { processMobileNumber } from "@/utils/phoneNumber";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login({}) {
  let router = useRouter();
  const [data, setData] = useState({
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
          CheckLogin();
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
    <>
      <div className="bg-login flex flex-col justify-center gap-6 items-center">
        <h1 className="text-2xl font-medium uppercase">Vendor</h1>
        <div className="bg-white rounded-3xl px-6 py-8 w-80 flex flex-col items-center gap-4">
          <img src="logo.png" className="my-4" />
          <div className="w-full">
            <Label value="Phone no." />
            <TextInput
              type="text"
              placeholder="Phone no."
              value={data.phone}
              onChange={(e) =>
                setData({
                  ...data,
                  phone: e.target.value,
                })
              }
              name="phone"
            />
          </div>
          {data.otpSent && (
            <div className="w-full">
              <Label value="OTP" />
              <TextInput
                type="text"
                placeholder="OTP"
                value={data.Otp}
                onChange={(e) =>
                  setData({
                    ...data,
                    Otp: e.target.value,
                  })
                }
                name="otp"
              />
            </div>
          )}
          {data.message && <p className="text-red-500">{data.message}</p>}
          <Button
            className="text-white bg-rose-900 enabled:hover:bg-900 w-full"
            disabled={
              !data.phone ||
              // !/^\d{10}$/.test(data.phone) ||
              !processMobileNumber(data.phone) ||
              data.loading ||
              (data.otpSent ? !data.Otp : false)
            }
            onClick={() => {
              data.otpSent ? handleLogin() : SendOTP();
            }}
          >
            {data.loading ? (
              <>
                <Spinner size="sm" />
                <span className="pl-3">Loading...</span>
              </>
            ) : (
              <>Sign In</>
            )}
          </Button>
          <p className="font-semibold text-black">
            {" "}
            Not a member yet?{" "}
            <Link href={"/signup"} className="text-rose-900 underline">
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
