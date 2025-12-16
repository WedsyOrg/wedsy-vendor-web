import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdClose,
  MdFilterAlt,
  MdOutlineLocationOn,
  MdSearch,
} from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Label,
  Radio,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import Link from "next/link";

export default function Home({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState("Create");
  // Create, Post, Success
  const [community, setCommunity] = useState({
    title: "",
    category: "",
    body: "",
    anonymous: false,
  });
  const handleSubmit = () => {
    if (loading) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/community`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ...community, category: user?.category }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.message !== "success") {
          toast.error("Error");
        } else {
          // Set flag for new post animation
          const postData = { id: response.community?._id };
          console.log('Setting new post data:', postData);
          localStorage.setItem('newCommunityPost', JSON.stringify(postData));
          setDisplay("Success");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        toast.error("There was a problem posting to the community.");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Community
        </p>
      </div>
      <div className="flex flex-col gap-6 py-4 px-6 max-w-sm mx-auto">
        {display === "Create" && (
          <>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#2B3F6C] text-white rounded-full flex items-center justify-center text-sm font-bold">①</div>
                  <Label value="Start with a descriptive title" className="text-base font-semibold text-black" />
                </div>
                <div className="relative">
                  <TextInput
                    placeholder="how to"
                    disabled={loading}
                    value={community?.title}
                    onChange={(e) => {
                      setCommunity({
                        ...community,
                        title: e.target.value,
                      });
                    }}
                    className="w-full"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {community?.title?.length || 0}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#2B3F6C] text-white rounded-full flex items-center justify-center text-sm font-bold">②</div>
                  <Label value="Provide more details" className="text-base font-semibold text-black" />
                </div>
                <Textarea
                  placeholder="Providing details like steps to reproduce the issue, affected devices, and software will help Community members answer your question. Please do not include personal information."
                  disabled={loading}
                  value={community?.body}
                  onChange={(e) => {
                    setCommunity({
                      ...community,
                      body: e.target.value,
                    });
                  }}
                  rows={6}
                  className="w-full"
                />
                
                {/* Formatting toolbar */}
                <div className="flex items-center gap-2 mt-2 p-2 border-t border-gray-200">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="font-bold text-sm">B</span>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="italic text-sm">I</span>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="underline text-sm">U</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="text-sm">¶</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="text-sm">⋯</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-black space-y-1 text-center mt-4">
              <p>Be respectful. Do not use foul language or anything offensive.</p>
              <p>Thank you for keeping the community clean. Enjoy!</p>
            </div>
            <div className="flex justify-center mt-4">
              <Button
                className="px-6 py-2 rounded-full text-white bg-[#2B3F6C] hover:bg-[#1e2d4a] font-semibold"
                disabled={!community.title || !community.body}
                onClick={() => {
                  setDisplay("Post");
                }}
              >
                Next
              </Button>
            </div>
          </>
        )}
        {display === "Post" && (
          <>
            <div className="flex flex-col gap-4">
              <p className="text-xl font-semibold text-black text-center">Post as</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Radio
                    id="author"
                    name="post"
                    value="author"
                    checked={community.anonymous === false}
                    onChange={() => {
                      setCommunity({ ...community, anonymous: false });
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="author" className="text-base text-black">{user?.name}</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Radio
                    id="anonymous"
                    name="post"
                    value="anonymous"
                    checked={community.anonymous === true}
                    onChange={() => {
                      setCommunity({ ...community, anonymous: true });
                    }}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor="anonymous"
                    className="text-base text-[#2B3F6C]"
                  >
                    Anonymous (Computer generated ID)
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                className="px-6 py-2 rounded-full text-white bg-[#2B3F6C] hover:bg-[#1e2d4a] font-semibold"
                disabled={loading}
                onClick={handleSubmit}
              >
                Post
              </Button>
            </div>
          </>
        )}
        {display === "Success" && (
          <>
            <p className="text-center text-lg font-medium">Post Successful!</p>
            <Link href={"/community"}>
              <Button
                className="mt-4 px-6 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max mx-auto"
                disabled={loading}
              >
                Back to Community
              </Button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
