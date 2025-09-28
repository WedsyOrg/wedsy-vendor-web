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
import { BsPencilSquare, BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, Button, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import ExpandText from "@/components/text/ExpandText";

export default function Community({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCommunity = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community`, {
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
          setCommunity(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addCommunityLike = (_id) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${_id}/like`, {
      method: "POST",
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
        setLoading(false);
        if (response.message === "success") {
          setCommunity(
            community?.map((i) => (i._id === _id ? response.community : i))
          );
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addCommunityDisLike = (_id) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${_id}/dis-like`, {
      method: "POST",
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
        setLoading(false);
        if (response.message === "success") {
          setCommunity(
            community?.map((i) => (i._id === _id ? response.community : i))
          );
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const removeCommunityLike = (_id) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${_id}/like`, {
      method: "DELETE",
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
        setLoading(false);
        if (response.message === "success") {
          setCommunity(
            community?.map((i) => (i._id === _id ? response.community : i))
          );
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const removeCommunityDisLike = (_id) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${_id}/dis-like`, {
      method: "DELETE",
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
        setLoading(false);
        if (response.message === "success") {
          setCommunity(
            community?.map((i) => (i._id === _id ? response.community : i))
          );
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchCommunity();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Community
        </p>
        <Link
          href="/community/create"
          className="flex items-center gap-1 text-sm"
        >
          <BsPencilSquare size={20} />
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
      </div>
      <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2">
        {community
          ?.filter((i) =>
            search
              ? i.title.toLowerCase().includes(search.toLowerCase()) ||
                i.body.toLowerCase().includes(search.toLowerCase())
              : true
          )
          .map((item, index) => (
            <>
              <div className="flex flex-col gap-4 py-4" key={index}>
                <div className="flex flex-row gap-2 items-center">
                  <Avatar rounded size="md" />
                  <div>
                    {item?.author?.anonymous ? (
                      <p className="text-lg font-regule">Anonymous</p>
                    ) : (
                      <p className="text-lg font-semibold">
                        {item?.author?.name}
                      </p>
                    )}
                    <p className="text-sm">
                      {item.category} |{" "}
                      {new Date(item?.createdAt)?.toLocaleString()}{" "}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/community/${item._id}`}
                  className="text-xl font-semibold"
                >
                  {item.title}
                </Link>
                <p className="-mt-4">
                  <ExpandText text={item.body} limit={150} />
                </p>
                <div className="flex flex-row gap-4 items-center">
                  <Button
                    onClick={() =>
                      router.push(`/community/${item._id}?replyCommunity=true`)
                    }
                    className="px-4 py-0 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max"
                  >
                    Reply
                  </Button>
                  {item.liked ? (
                    <div className="flex flex-row gap-1 items-center">
                      <BiSolidLike
                        size={24}
                        className="text-custom-dark-blue"
                        cursor={"pointer"}
                        onClick={() => {
                          removeCommunityLike(item._id);
                        }}
                      />
                      {item.likes}
                    </div>
                  ) : (
                    <div className="flex flex-row gap-1 items-center">
                      <BiLike
                        size={24}
                        className="text-custom-dark-blue"
                        cursor={"pointer"}
                        onClick={() => {
                          addCommunityLike(item._id);
                        }}
                      />
                      {item.likes}
                    </div>
                  )}
                  {item.disliked ? (
                    <div className="flex flex-row gap-1 items-center">
                      <BiSolidDislike
                        size={24}
                        className="text-custom-dark-blue"
                        cursor={"pointer"}
                        onClick={() => {
                          removeCommunityDisLike(item._id);
                        }}
                      />
                      {item.dislikes}
                    </div>
                  ) : (
                    <div className="flex flex-row gap-1 items-center">
                      <BiDislike
                        size={24}
                        className="text-custom-dark-blue"
                        cursor={"pointer"}
                        onClick={() => {
                          addCommunityDisLike(item._id);
                        }}
                      />
                      {item.dislikes}
                    </div>
                  )}
                </div>
              </div>
            </>
          ))}
      </div>
    </>
  );
}
