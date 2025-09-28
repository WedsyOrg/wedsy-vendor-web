import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdFilterAlt,
  MdOutlineLocationOn,
  MdSearch,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Leads({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");

  const fetchLeads = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-lead`, {
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
          setLoading(false);
          setLeads(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Leads
        </p>
        <Link
          href="/personal-leads/create"
          className="flex items-center gap-1 text-sm"
        >
          Create Lead <BsPlusCircle />
        </Link>
      </div>
      <div className="flex items-center gap-3 px-4  ">
        <TextInput
          type="search"
          icon={MdSearch}
          placeholder="Search"
          className="my-4 grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <MdFilterAlt size={24} />
      </div>
      <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2">
        {leads
          ?.filter((i) => (search ? i.name.toLowerCase().includes(search.toLowerCase()) : true))
          .sort((a, b) => {
            const dateA = new Date(a?.createdAt || a?.updatedAt || 0);
            const dateB = new Date(b?.createdAt || b?.updatedAt || 0);
            return dateB - dateA; // Newest first
          })
          .map((item, index) => (
            <>
              <div
                onClick={() => {
                  router.push(`/personal-leads/${item._id}`);
                }}
                className="flex flex-col gap-4 p-4 rounded-lg bg-[#FFEDF4] cursor-pointer"
                key={index}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-medium grow">{item.name}</div>
                  <div>{item?.eventInfo[0]?.date}</div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-2xl font-semibold grow">
                    {toPriceString(item?.payment?.total || 0)}
                  </div>
                  <div className="text-sm flex items-center gap-1">
                    <MdOutlineLocationOn /> North Banglore
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
    </>
  );
}
