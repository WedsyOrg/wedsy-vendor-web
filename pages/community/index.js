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
import { Avatar, Button } from "flowbite-react";
import SearchBox from "@/components/SearchBox";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import ExpandText from "@/components/text/ExpandText";

export default function Community({}) {
  const router = useRouter();
  const [community, setCommunity] = useState([]);
  const [search, setSearch] = useState("");
  const [newPostId, setNewPostId] = useState(null);

  const fetchCommunity = () => {
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
          setCommunity(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const addCommunityLike = (_id) => {
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
        try {
          const postData = JSON.parse(newPost);
          console.log('New post detected:', postData);
          setNewPostId(postData.id);
          localStorage.removeItem('newCommunityPost');
          // Refresh the community list to show the new post
          fetchCommunity();
          // Remove animation after 4 seconds
          setTimeout(() => {
            console.log('Removing animation for post:', postData.id);
            setNewPostId(null);
          }, 4000);
        } catch (error) {
          console.error('Error parsing new post data:', error);
          localStorage.removeItem('newCommunityPost');
        }
      }
    };
    
    checkForNewPost();
    // Check every 1 second for new posts
    const interval = setInterval(checkForNewPost, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          COMMUNITY
        </p>
        <Link
          href="/community/create"
          className="flex items-center gap-1 text-sm"
        >
          <BsPencilSquare size={20} />
        </Link>
      </div>
      <div className="px-4 py-3 flex justify-center">
        <SearchBox
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '100%', width: '100%' }}
        />
      </div>
      <div className="flex flex-col gap-4 pb-4 px-4">
        {false ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3F6C]"></div>
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
              <Button className="bg-[#2B3F6C] hover:bg-[#1e2d4a] text-white px-6 py-2 rounded-lg">
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
              className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-700 transform ${
                newPostId === item._id 
                  ? 'animate-pulse border-[#2B3F6C] shadow-lg scale-105 animate-bounce' 
                  : 'hover:scale-[1.02]'
              }`}
              style={{
                animation: newPostId === item._id ? 'slideInFromTop 0.8s ease-out' : undefined
              }}
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
                    className="text-lg font-semibold text-black hover:text-[#2B3F6C] transition-colors block"
                  >
                    {item.title}
                  </Link>
                  <div className="text-sm text-black">
                    <ExpandText text={item.body || "This is a test post with a very long text that should definitely exceed 150 characters to test the show more/show less functionality. This text is intentionally long to demonstrate the expand/collapse feature that should work properly when the text length exceeds the specified limit of 150 characters."} limit={150} />
                  </div>
                </div>
                
                <div className="flex flex-row gap-4 items-center pt-2">
                  <Button
                    onClick={() =>
                      router.push(`/community/${item._id}?replyCommunity=true`)
                    }
                    className="px-4 py-1 rounded-full text-white bg-[#2B3F6C] hover:bg-[#1e2d4a] transition-colors text-sm"
                  >
                    Reply
                  </Button>
                  
                  <div className="flex flex-row gap-6 items-center">
                    {item.liked ? (
                      <div className="flex flex-col items-center cursor-pointer">
                        <BiSolidLike
                          size={20}
                          className="text-[#2B3F6C]"
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
                          className="text-[#2B3F6C]"
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
                          className="text-[#2B3F6C]"
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
                          className="text-[#2B3F6C]"
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
