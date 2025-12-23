import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState } from "react";
import {
  MdArrowForwardIos,
  MdFilterAlt,
  MdOutlineLocationOn,
  MdOutlineStar,
  MdSearch,
} from "react-icons/md";
import { BsPencilSquare, BsPlusCircle } from "react-icons/bs";
import { useRouter } from "next/router";
import { Avatar, Button, Rating, Modal, Textarea, Spinner } from "flowbite-react";
import SearchBox from "@/components/SearchBox";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Reviews({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [search, setSearch] = useState("");

  const [askingLink, setAskingLink] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const getActor = () => {
    const token = localStorage.getItem("token");
    if (!token) return { id: "", role: "vendor" };
    const payload = parseJwt(token) || {};
    return { id: payload?._id || "", role: payload?.isAdmin ? "admin" : "vendor" };
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const headers = {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      };

      const [listRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-review`, {
          method: "GET",
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-review/stats`, {
          method: "GET",
          headers,
        }),
      ]);

      // Only redirect to login on actual auth failures.
      const authFailCodes = [401, 403];
      if (authFailCodes.includes(listRes.status) || authFailCodes.includes(statsRes.status)) {
        router.push("/login");
        return;
      }

      if (!listRes.ok) {
        // e.g. 404 if server not updated yet
        toast.error(`Reviews API error (${listRes.status}). Please restart/update server.`);
        setReviews([]);
        setStats({
          total: 0,
          avgRating: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        return;
      }

      const listJson = await listRes.json();
      const statsJson = statsRes.ok ? await statsRes.json() : { stats: null };

      setReviews(Array.isArray(listJson?.list) ? listJson.list : []);
      setStats(
        statsJson?.stats || {
          total: 0,
          avgRating: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      );
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const askForReview = async () => {
    setAskingLink(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-review/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "" }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        throw new Error("Failed to create share link");
      }

      const json = await res.json();
      const link = json?.shareLink || "";
      if (!link) throw new Error("No share link returned");

      await navigator.clipboard.writeText(link);
      toast.success("Review link copied");
    } catch (error) {
      console.error(error);
      toast.error("Could not copy review link");
    } finally {
      setAskingLink(false);
    }
  };

  const openReply = (review) => {
    setReplyTarget(review);
    setReplyText("");
    setReplyOpen(true);
  };

  const sendReply = async () => {
    if (!replyTarget?._id || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor-review/${replyTarget._id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyText.trim() }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.message !== "success") {
        throw new Error(json?.error || "Failed to reply");
      }

      toast.success("Reply sent");
      setReplyOpen(false);
      await fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const reactToReview = async (review, nextReaction) => {
    if (!review?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor-review/${review._id}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reaction: nextReaction }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.message !== "success") throw new Error("reaction failed");

      // Re-fetch to keep counts accurate
      await fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update reaction");
    }
  };

  const getPercent = (star) => {
    const total = stats?.total || 0;
    if (!total) return 0;
    const count = stats?.distribution?.[star] || 0;
    return Math.round((count / total) * 100);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          REVIEWS
        </p>
      </div>
      <div className="flex items-center gap-3 px-4">
        <div className="my-4 grow flex justify-center">
          <SearchBox
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '100%', width: '100%' }}
          />
        </div>
      </div>
      <div className="px-6 grid grid-cols-2 gap-4 items-center">
        <p className="font-medium text-xl">Ratings & Reviews</p>
        <Button color="dark" onClick={askForReview} disabled={askingLink}>
          {askingLink ? "Copying..." : "Ask for Review"}
        </Button>
        <div className="border-r py-3 flex flex-col items-center">
          <p className="text-gray-500 font-semibold">
            {stats?.avgRating >= 4.5
              ? "Excellent"
              : stats?.avgRating >= 3.5
              ? "Very Good"
              : stats?.avgRating >= 2.5
              ? "Good"
              : stats?.avgRating > 0
              ? "Average"
              : "No Ratings"}
          </p>
          <Rating size="md">
            {[1, 2, 3, 4, 5].map((s) => (
              <Rating.Star
                key={s}
                className="text-gray-500"
                filled={stats?.avgRating >= s}
              />
            ))}
          </Rating>
          <p className="text-gray-500 font-medium text-center mt-2">
            {stats?.total || 0} reviews
          </p>
        </div>
        <div className="py-3 flex flex-col">
          <Rating.Advanced
            percentFilled={getPercent(5)}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              5 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={getPercent(4)}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              4 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={getPercent(3)}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              3 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={getPercent(2)}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              2 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={getPercent(1)}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              1 <MdOutlineStar />
            </span>
          </Rating.Advanced>
        </div>
      </div>
      <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {reviews
              .filter((item) => {
                if (!search) return true;
                const s = search.toLowerCase();
                return (
                  String(item?.review || "").toLowerCase().includes(s) ||
                  String(item?.category || "").toLowerCase().includes(s) ||
                  String(item?.customer?.name || "").toLowerCase().includes(s) ||
                  String(item?.customer?.phone || "").toLowerCase().includes(s)
                );
              })
              .map((item) => {
                const actor = getActor();
                const likeCount = Array.isArray(item?.likes) ? item.likes.length : 0;
                const dislikeCount = Array.isArray(item?.dislikes) ? item.dislikes.length : 0;
                const liked = (item?.likes || []).some(
                  (x) => String(x?.id) === String(actor.id) && x?.role === actor.role
                );
                const disliked = (item?.dislikes || []).some(
                  (x) => String(x?.id) === String(actor.id) && x?.role === actor.role
                );

                const customerLabel =
                  item?.customer?.name ||
                  item?.user?.name ||
                  (item?.customer?.phone ? item.customer.phone : "Customer");

                const lastReply =
                  Array.isArray(item?.replies) && item.replies.length > 0
                    ? item.replies[item.replies.length - 1]
                    : null;

                return (
                  <div className="flex flex-col gap-4 py-4" key={item._id}>
                    <div className="flex flex-row gap-2 items-center">
                      <Rating>
                        {[...Array(5)].map((_, starIndex) => (
                          <Rating.Star
                            key={starIndex}
                            className="text-gray-500"
                            filled={starIndex < Number(item?.rating || 0)}
                          />
                        ))}
                        <p className="ml-2 font-semibold text-gray-500 dark:text-gray-400">
                          {Number(item?.rating || 0)}
                        </p>
                      </Rating>
                      <div className="h-1 w-1 rounded-full bg-gray-500" />
                      <p className="font-medium">{customerLabel}</p>
                    </div>

                    <div className="text-gray-400 text-sm -mt-4">
                      Category: {item?.category || "-"}
                    </div>

                    <p>{item?.review}</p>

                    {lastReply && (
                      <div className="bg-gray-50 border rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Reply:</span>{" "}
                          {lastReply?.message}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-row gap-4 items-center flex-wrap">
                      <Button
                        onClick={() => openReply(item)}
                        className="px-4 py-0 text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max"
                      >
                        Reply to Review
                      </Button>

                      <div className="flex flex-row gap-6 items-center">
                        <div className="flex flex-row gap-1 items-center">
                          {liked ? (
                            <BiSolidLike
                              size={24}
                              className="text-custom-dark-blue"
                              cursor={"pointer"}
                              onClick={() => reactToReview(item, "none")}
                            />
                          ) : (
                            <BiLike
                              size={24}
                              className="text-custom-dark-blue"
                              cursor={"pointer"}
                              onClick={() => reactToReview(item, "like")}
                            />
                          )}
                          {likeCount}
                        </div>

                        <div className="flex flex-row gap-1 items-center">
                          {disliked ? (
                            <BiSolidDislike
                              size={24}
                              className="text-custom-dark-blue"
                              cursor={"pointer"}
                              onClick={() => reactToReview(item, "none")}
                            />
                          ) : (
                            <BiDislike
                              size={24}
                              className="text-custom-dark-blue"
                              cursor={"pointer"}
                              onClick={() => reactToReview(item, "dislike")}
                            />
                          )}
                          {dislikeCount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {(!reviews || reviews.length === 0) && (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg font-medium text-gray-700">No reviews yet</p>
                <p className="text-sm">Tap “Ask for Review” to copy a share link</p>
              </div>
            )}
          </>
        )}
      </div>

      <Modal show={replyOpen} size="md" onClose={() => setReplyOpen(false)}>
        <Modal.Header>Reply to Review</Modal.Header>
        <Modal.Body>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {replyTarget?.customer?.name || replyTarget?.user?.name || "Customer"}
            </p>
            <Textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="dark" onClick={sendReply} disabled={sendingReply || !replyText.trim()}>
            {sendingReply ? "Sending..." : "Send Reply"}
          </Button>
          <Button color="gray" onClick={() => setReplyOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
}
