import BackIcon from "@/components/icons/BackIcon";
import Link from "next/link";

export default function Settings({}) {
  return (
    <>
      <div className="flex flex-col gap-4 py-4 px-8 pt-8">
        <div className="flex flex-row gap-3 items-center mb-4">
          <BackIcon />
          <p className="text-xl font-semibold text-black">SETTINGS</p>
        </div>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 mt-5"
          href="/settings/profile"
        >
          <img
            src="/assets/icons/settings-profile.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Profile</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/orders"
        >
          <img
            src="/assets/icons/settings-order.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Orders</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-6 pt-4"
          href="/settings/settlements"
        >
          <img
            src="/assets/icons/settings-settlements.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Settlements</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/settings/account-details"
        >
          <img
            src="/assets/icons/settings-account-details.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Account Details</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/settings/notification-center"
        >
          <img
            src="/assets/icons/settings-notification-center.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Notification Center</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/personal-packages"
        >
          <img
            src="/assets/icons/settings-your-package.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Your Packages</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/community"
        >
          <img
            src="/assets/icons/settings-community.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Community</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/reviews"
        >
          <img
            src="/assets/icons/settings-reviews.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Reviews</span>
        </Link>
        <Link
          className="flex flex-row gap-6 item-center text-xl border-b-2 font-medium pb-5 pt-3"
          href="/settings/analytics"
        >
          <img
            src="/assets/icons/settings-analytics.png"
            className="object-contain h-8 w-8"
          />
          <span className="text-black">Analytics</span>
        </Link>
      </div>
    </>
  );
}
