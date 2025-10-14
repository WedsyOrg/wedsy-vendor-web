import BackIcon from "@/components/icons/BackIcon";
import { ToggleSwitch } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";
import { toast } from "react-toastify";

export default function Settings({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    bidding: false,
    packages: false,
    upcomingEvents: false,
    booking: false,
    payment: false,
  });
  const fetchNotifications = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor`, {
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
          setNotifications(response.notifications);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateNotifications = async (tempNotifications) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        notifications: {
          bidding: tempNotifications?.bidding || false,
          packages: tempNotifications?.packages || false,
          upcomingEvents: tempNotifications?.upcomingEvents || false,
          booking: tempNotifications?.booking || false,
          payment: tempNotifications?.payment || false,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchNotifications();
        if (response.message !== "success") {
          toast.error("Error updating notification status.");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  useEffect(() => {
    fetchNotifications();
  }, []);
  return (
    <>
      <div className="flex flex-col gap-4 py-4 px-8 pt-8">
        <div className="flex flex-row gap-3 items-center mb-4">
          <BackIcon />
          <p className="text-lg font-medium">Notification Center</p>
        </div>
        <p className="text-xs text-center">
          {"You’ll be notified for the settings you only choose"}
        </p>
        <div className="border-b-2 pb-4">
          <div className="flex flex-row justify-between item-center">
            <p className="text-xl font-medium">Bidding</p>
            <ToggleSwitch
              sizing="sm"
              onChange={(e) => {
                updateNotifications({
                  ...notifications,
                  bidding: e,
                });
              }}
              checked={notifications?.bidding}
              disabled={loading}
            />
          </div>
          <p className="text-sm">
            Notification for all the bids you recieve and also for bid update by
            other vendors
          </p>
        </div>
        <div className="border-b-2 pb-4">
          <div className="flex flex-row justify-between item-center">
            <p className="text-xl font-medium">Packages</p>
            <ToggleSwitch
              sizing="sm"
              onChange={(e) => {
                updateNotifications({
                  ...notifications,
                  packages: e,
                });
              }}
              checked={notifications?.packages}
              disabled={loading}
            />
          </div>
          <p className="text-sm">
            Notification for Package related orders to be shown
          </p>
        </div>
        <div className="border-b-2 pb-4">
          <div className="flex flex-row justify-between item-center">
            <p className="text-xl font-medium">Upcoming Events</p>
            <ToggleSwitch
              sizing="sm"
              onChange={(e) => {
                updateNotifications({
                  ...notifications,
                  upcomingEvents: e,
                });
              }}
              checked={notifications?.upcomingEvents}
              disabled={loading}
            />
          </div>
          <p className="text-sm">
            Notification for all the upcoming events in the coming week
          </p>
        </div>
        <div className="border-b-2 pb-4">
          <div className="flex flex-row justify-between item-center">
            <p className="text-xl font-medium">Booking</p>
            <ToggleSwitch
              sizing="sm"
              onChange={(e) => {
                updateNotifications({
                  ...notifications,
                  booking: e,
                });
              }}
              checked={notifications?.booking}
              disabled={loading}
            />
          </div>
          <p className="text-sm">
            Notify for when the booking order is confirmed by the customer
          </p>
        </div>
        <div className="border-b-2 pb-4">
          <div className="flex flex-row justify-between item-center">
            <p className="text-xl font-medium">Payment</p>
            <ToggleSwitch
              sizing="sm"
              onChange={(e) => {
                updateNotifications({
                  ...notifications,
                  payment: e,
                });
              }}
              checked={notifications?.payment}
              disabled={loading}
            />
          </div>
          <p className="text-sm">
            Notify when the customer has paid booking/full amount to wedsy
          </p>
        </div>
      </div>
    </>
  );
}
