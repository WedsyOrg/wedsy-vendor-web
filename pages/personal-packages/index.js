import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdArrowForwardIos,
  MdChevronRight,
  MdEdit,
  MdFilterAlt,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdOutlineLocationOn,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, Button, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";

export default function Packages({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [show, setShow] = useState([]);

  const fetchPackages = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-personal-package`, {
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
          setPackages(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);


  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon backToSettings={true}/>
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Packages
        </p>
        <Link
          href="/personal-packages/create"
          className="flex items-center gap-1 text-sm"
        >
          Add Packages <BsPlusCircle />
        </Link>
      </div>
      <div className="flex flex-col gap-4 py-4 px-6 divide-y-2">
        <p className="text-xl text-gray-500">Create your Package/Offers</p>
        <Link href="/personal-packages/create" className="text-sm">
          <Button className="bg-custom-dark-blue enabled:hover:bg-custom-dark-blue w-full flex flex-row items-center gap-1">
            Add Packages &nbsp;
            <MdAdd size={20} />
          </Button>
        </Link>
        {packages?.map((item, index) => (
          <div key={index}>
            <div className="flex flex-row gap-2 items-center pt-4">
              <Link href={`/personal-packages/${item._id}`}>
                <MdEdit size={20} />
              </Link>
              <p className="grow text-center">{item.name}</p>
              {show.includes(item._id) ? (
                <MdKeyboardArrowDown
                  size={20}
                  cursor={"pointer"}
                  onClick={() => {
                    setShow(show.filter((_, i) => i !== index));
                  }}
                />
              ) : (
                <MdKeyboardArrowRight
                  size={20}
                  cursor={"pointer"}
                  onClick={() => {
                    setShow([...show, item._id]);
                  }}
                />
              )}
            </div>
            {show.includes(item._id) && (
              <div className="text-center">
                <p className="text-xs font-light mb-2">
                  Serivces that will be provided
                </p>
                {item.services.map((rec, i) => (
                  <p className="font-medium" key={i}>
                    {rec}
                  </p>
                ))}
                <p className="text-custom-dark-blue font-semibold text-lg mt-2">
                  {toPriceString(item.price)}/person
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

    </>
  );
}
