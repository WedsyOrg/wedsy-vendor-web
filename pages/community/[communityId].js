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
                <p className="text-base font-semibold text-black">Anonymous</p>
              ) : (
                <p className="text-base font-semibold text-black">
                  {community?.author?.name}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Level 1 • 13 points
              </p>
            </div>
          </div>
          <p className="text-lg font-semibold text-black">{community.title}</p>
          <p className="text-sm text-black">
            <ExpandText text={community.body} limit={150} />
          </p>
          <div className="flex flex-row gap-4 items-center">
            {!displayReply && (
              <Button
                onClick={() => setDisplayReply(true)}
                className="px-4 py-1 rounded-full text-white bg-[#840032] hover:bg-[#6d0028] text-sm"
              >
                Reply
              </Button>
            )}
            <div className="flex flex-row gap-6 items-center">
              {community.liked ? (
                <div className="flex flex-col items-center cursor-pointer">
                  <BiSolidLike
                    size={20}
                    className="text-[#840032]"
                    onClick={() => {
                      removeCommunityLike(community._id);
                    }}
                  />
                  <span className="text-xs text-black mt-1">{community.likes || 0}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center cursor-pointer">
                  <BiLike
                    size={20}
                    className="text-[#840032]"
                    onClick={() => {
                      addCommunityLike(community._id);
                    }}
                  />
                  <span className="text-xs text-black mt-1">{community.likes || 0}</span>
                </div>
              )}
              
              {community.disliked ? (
                <div className="flex flex-col items-center cursor-pointer">
                  <BiSolidDislike
                    size={20}
                    className="text-[#840032]"
                    onClick={() => {
                      removeCommunityDisLike(community._id);
                    }}
                  />
                  <span className="text-xs text-black mt-1">{community.dislikes || 0}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center cursor-pointer">
                  <BiDislike
                    size={20}
                    className="text-[#840032]"
                    onClick={() => {
                      addCommunityDisLike(community._id);
                    }}
                  />
                  <span className="text-xs text-black mt-1">{community.dislikes || 0}</span>
                </div>
              )}
            </div>
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
        <div className="flex flex-col gap-4 pb-4 px-6">
          {community?.replies?.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 text-gray-500">★</div>
                <span className="text-sm text-gray-600">Best reply</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-2 items-center">
                  <Avatar rounded size="md" />
                  <div>
                    {item?.author?.anonymous ? (
                      <p className="text-base font-semibold text-black">Anonymous</p>
                    ) : (
                      <p className="text-base font-semibold text-black">
                        {item?.author?.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Level 1 • 8 points
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Posted on {new Date(item?.createdAt)?.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-sm text-black">
                  <ExpandText text={item?.reply} limit={150} />
                </p>
                <div className="flex items-center gap-1 text-blue-500 text-sm">
                  <span>View in context</span>
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center">
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
