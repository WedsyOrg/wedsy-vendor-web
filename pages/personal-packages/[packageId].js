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
  const [newPackage, setPackage] = useState({
    name: "",
    services: [""],
    price: 0,
    amountToWedsy: 0,
    amountToVendor: 0,
  });
  const [bookingAmount, setBookingAmount] = useState({});
  const { packageId } = router.query;
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
  const handleSubmit = (redirect) => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-package/${packageId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPackage),
      }
    )
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
  const fetchPackage = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-package/${packageId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
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
          setPackage(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    fetchPackage();
    fetchBookingAmount();
  }, []);
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Create Your Packages/Offers
        </p>
      </div>
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
            {newPackage?.services?.map((item, index) => (
              <div
                className="flex flex-row gap-2 items-center mb-2"
                key={index}
              >
                <TextInput
                  key={index}
                  placeholder="Services"
                  value={item}
                  onChange={(e) => {
                    let temp = newPackage?.services;
                    temp[index] = e.target.value;
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
              className="flex items-center gap-1 text-sm"
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
              placeholder="Package Price"
              type="number"
              value={newPackage?.price}
              onChange={(e) => {
                let p = parseInt(e.target.value) || 0;
                setPackage({
                  ...newPackage,
                  price: e.target.value,
                  amountToWedsy:
                    p * (bookingAmount?.personalPackage?.percentage / 100),
                  amountToVendor:
                    p * (1 - bookingAmount?.personalPackage?.percentage / 100),
                });
              }}
            />
          </div>
          <div>
            <p className="text-xl font-semibold mt-4">Wedsy Settlements</p>
            <div className="flex flex-row justify-between">
              <p>Amount Payable to Wedsy</p>
              <p>{toPriceString(newPackage?.amountToWedsy)}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Amount Payable to You</p>
              <p>{toPriceString(newPackage?.amountToVendor)}</p>
            </div>
          </div>
          <Button
            className="mt-4 px-6 text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max mx-auto"
            onClick={() => {
              handleSubmit(true);
            }}
          >
            Update Package
          </Button>
        </div>
      </div>
    </>
  );
}
