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
  const [newPostId, setNewPostId] = useState(null);

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
          console.log("Community API Response:", response);
          setLoading(false);
          setCommunity(response);
        }
      })
      .catch((error) => {
        setLoading(false);
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

  // Check for new posts from create page
  useEffect(() => {
    const checkForNewPost = () => {
      const newPost = localStorage.getItem('newCommunityPost');
      if (newPost) {
        setNewPostId(JSON.parse(newPost).id);
        localStorage.removeItem('newCommunityPost');
        // Remove animation after 3 seconds
        setTimeout(() => setNewPostId(null), 3000);
      }
    };
    
    checkForNewPost();
    // Check every 2 seconds for new posts
    const interval = setInterval(checkForNewPost, 2000);
    return () => clearInterval(interval);
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
      <div className="px-4 py-3">
        <TextInput
          type="search"
          icon={MdSearch}
          placeholder="Search"
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-4 pb-4 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#840032]"></div>
            <p className="text-gray-500 mt-2">Loading community posts...</p>
          </div>
        ) : community?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Community Posts Yet</h3>
            <p className="text-gray-500 text-center mb-6">
              Be the first to share your experiences, ask questions, or help other vendors in the community.
            </p>
            <Link href="/community/create">
              <Button className="bg-[#840032] hover:bg-[#6d0028] text-white px-6 py-2 rounded-lg">
                Create First Post
              </Button>
            </Link>
          </div>
        ) : (
          community
            ?.filter((i) =>
              search
                ? i.title.toLowerCase().includes(search.toLowerCase()) ||
                  i.body.toLowerCase().includes(search.toLowerCase())
                : true
            )
            .map((item, index) => (
            <div 
              key={index} 
              className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-500 ${
                newPostId === item._id 
                  ? 'animate-pulse border-[#840032] shadow-lg' 
                  : ''
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-2 items-center">
                  <Avatar rounded size="md" />
                  <div className="flex-1">
                    {item?.author?.anonymous ? (
                      <p className="text-base font-medium text-black">Anonymous</p>
                    ) : (
                      <p className="text-base font-semibold text-black">
                        {item?.author?.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Level 1 • 13 points
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    href={`/community/${item._id}`}
                    className="text-lg font-semibold text-black hover:text-[#840032] transition-colors block"
                  >
                    {item.title}
                  </Link>
                  <div className="text-sm text-black">
                    <ExpandText text={item.body} limit={150} />
                  </div>
                </div>
                
                <div className="flex flex-row gap-4 items-center pt-2">
                  <Button
                    onClick={() =>
                      router.push(`/community/${item._id}?replyCommunity=true`)
                    }
                    className="px-4 py-1 rounded-full text-white bg-[#840032] hover:bg-[#6d0028] transition-colors text-sm"
                  >
                    Reply
                  </Button>
                  
                  <div className="flex flex-row gap-6 items-center">
                    {item.liked ? (
                      <div className="flex flex-col items-center cursor-pointer">
                        <BiSolidLike
                          size={20}
                          className="text-[#840032]"
                          onClick={() => {
                            removeCommunityLike(item._id);
                          }}
                        />
                        <span className="text-xs text-black mt-1">{item.likes || 0}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center cursor-pointer">
                        <BiLike
                          size={20}
                          className="text-[#840032]"
                          onClick={() => {
                            addCommunityLike(item._id);
                          }}
                        />
                        <span className="text-xs text-black mt-1">{item.likes || 0}</span>
                      </div>
                    )}
                    
                    {item.disliked ? (
                      <div className="flex flex-col items-center cursor-pointer">
                        <BiSolidDislike
                          size={20}
                          className="text-[#840032]"
                          onClick={() => {
                            removeCommunityDisLike(item._id);
                          }}
                        />
                        <span className="text-xs text-black mt-1">{item.dislikes || 0}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center cursor-pointer">
                        <BiDislike
                          size={20}
                          className="text-[#840032]"
                          onClick={() => {
                            addCommunityDisLike(item._id);
                          }}
                        />
                        <span className="text-xs text-black mt-1">{item.dislikes || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
