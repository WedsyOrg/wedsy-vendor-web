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
import { Avatar, Button, Textarea, TextInput } from "flowbite-react";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import ExpandText from "@/components/text/ExpandText";

export default function Community({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState({});
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [displayReply, setDisplayReply] = useState("");
  const { communityId, replyCommunity } = router.query;

  const fetchCommunity = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
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

  const addCommunityReply = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ reply }),
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setLoading(false);
        if (response.message === "success") {
          setReply("");
          setDisplayReply(false);
          fetchCommunity();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addCommunityLike = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setLoading(false);
        if (response.message === "success") {
          setCommunity(response.community);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addCommunityDisLike = () => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/dis-like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setLoading(false);
        if (response.message === "success") {
          setCommunity(response.community);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const removeCommunityLike = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/like`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setLoading(false);
        if (response.message === "success") {
          setCommunity(response.community);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const removeCommunityDisLike = () => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/dis-like`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          router.push("/community");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        setLoading(false);
        if (response.message === "success") {
          setCommunity(response.community);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    if (communityId) fetchCommunity();
    if (replyCommunity && replyCommunity === "true") setDisplayReply(true);
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
      <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-row gap-2 items-center">
            <Avatar rounded size="md" />
            <div>
              {community?.author?.anonymous ? (
                <p className="text-lg font-regule">Anonymous</p>
              ) : (
                <p className="text-lg font-semibold">
                  {community?.author?.name}
                </p>
              )}
              <p className="text-sm">
                {new Date(community?.createdAt)?.toLocaleString()}{" "}
              </p>
            </div>
          </div>
          <p className="text-xl font-semibold">{community.title}</p>
          <p className="-mt-4">
            <ExpandText text={community.body} limit={150} />
          </p>
          <div className="flex flex-row gap-4 items-center">
            {!displayReply && (
              <Button
                onClick={() => setDisplayReply(true)}
                className="px-4 py-0 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max"
              >
                Reply
              </Button>
            )}
            {community.liked ? (
              <div className="flex flex-row gap-1 items-center">
                <BiSolidLike
                  size={24}
                  className="text-custom-dark-blue"
                  cursor={"pointer"}
                  onClick={() => {
                    removeCommunityLike(community._id);
                  }}
                />
                {community.likes}
              </div>
            ) : (
              <div className="flex flex-row gap-1 items-center">
                <BiLike
                  size={24}
                  className="text-custom-dark-blue"
                  cursor={"pointer"}
                  onClick={() => {
                    addCommunityLike(community._id);
                  }}
                />
                {community.likes}
              </div>
            )}
            {community.disliked ? (
              <div className="flex flex-row gap-1 items-center">
                <BiSolidDislike
                  size={24}
                  className="text-custom-dark-blue"
                  cursor={"pointer"}
                  onClick={() => {
                    removeCommunityDisLike(community._id);
                  }}
                />
                {community.dislikes}
              </div>
            ) : (
              <div className="flex flex-row gap-1 items-center">
                <BiDislike
                  size={24}
                  className="text-custom-dark-blue"
                  cursor={"pointer"}
                  onClick={() => {
                    addCommunityDisLike(community._id);
                  }}
                />
                {community.dislikes}
              </div>
            )}
          </div>
          {displayReply && (
            <>
              <Textarea
                placeholder="Reply Community"
                disabled={loading}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                }}
                rows={4}
              />
              <div className="flex flex-row gap-4 items-center">
                <Button
                  onClick={() => addCommunityReply()}
                  className="px-4 py-0 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max"
                >
                  Reply
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2 pl-6">
          {community?.replies?.map((item, index) => (
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
                      {new Date(item?.createdAt)?.toLocaleString()}{" "}
                    </p>
                  </div>
                </div>
                <p className="-mt-2">
                  <ExpandText text={item?.reply} limit={150} />
                </p>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
