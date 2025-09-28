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
        setLoading(false);
        if (response.message !== "success") {
          alert("Error");
        } else {
          setDisplay("Success");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
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
      <div className="flex flex-col gap-4 py-4 px-6">
        {display === "Create" && (
          <>
            <div className="flex flex-col gap-2">
              <div>
                <Label value="1. Start with a descriptive title" />
                <TextInput
                  placeholder="title"
                  disabled={loading}
                  value={community?.title}
                  onChange={(e) => {
                    setCommunity({
                      ...community,
                      title: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label value="2. Provide more details" />
                <Textarea
                  placeholder="..."
                  disabled={loading}
                  value={community?.body}
                  onChange={(e) => {
                    setCommunity({
                      ...community,
                      body: e.target.value,
                    });
                  }}
                  rows={4}
                />
              </div>
            </div>
            <div>
              <Button
                className="mt-4 px-6 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max mx-auto"
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
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold">Post as</p>
              <div className="flex items-center gap-2">
                <Radio
                  id="author"
                  name="post"
                  value="author"
                  checked={community.anonymous === false}
                  onChange={() => {
                    setCommunity({ ...community, anonymous: false });
                  }}
                />
                <Label htmlFor="author">{user?.name}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="anonymous"
                  name="post"
                  value="anonymous"
                  checked={community.anonymous === true}
                  onChange={() => {
                    setCommunity({ ...community, anonymous: true });
                  }}
                />
                <Label
                  htmlFor="anonymous"
                  className="flex font-light items-center"
                >
                  Anonymous &nbsp;
                  <p className="text-xs">(Computer Generated ID)</p>
                </Label>
              </div>
            </div>
            <div>
              <Button
                className="mt-4 px-6 rounded-full text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max mx-auto"
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
