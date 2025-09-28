import BackIcon from "@/components/icons/BackIcon";
import { Select, ToggleSwitch } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdArrowBackIos } from "react-icons/md";

export default function Settings({}) {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col gap-4 py-4 px-8 pt-8">
        <div className="flex flex-row gap-3 items-center mb-4">
          <BackIcon />
          <p className="text-lg font-medium">Analytics</p>
        </div>
        <div className="grid grid-cols-2">
          <Select className="col-start-2">
            <option>Jan 2024</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Calls</p>
            <p className="text-5xl font-semibold text-center">11</p>
          </div>
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4">
            <p>Chats</p>
            <p className="text-5xl font-semibold text-center">11</p>
          </div>
        </div>
      </div>
    </>
  );
}
