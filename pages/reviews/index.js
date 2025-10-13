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
import { Avatar, Button, Rating } from "flowbite-react";
import SearchBox from "@/components/SearchBox";
import Link from "next/link";
import { toPriceString } from "@/utils/text";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";

export default function Reviews({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

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
        <Button color="dark">Ask for Review</Button>
        <div className="border-r py-3 flex flex-col items-center">
          <p className="text-gray-500 font-semibold">Very Good</p>
          <Rating size="md">
            <Rating.Star className="text-gray-500" />
            <Rating.Star className="text-gray-500" />
            <Rating.Star className="text-gray-500" />
            <Rating.Star className="text-gray-500" />
            <Rating.Star filled={false} />
          </Rating>
          <p className="text-gray-500 font-medium text-center mt-2">
            16,464 ratings and 1620 reviews
          </p>
        </div>
        <div className="py-3 flex flex-col">
          <Rating.Advanced
            percentFilled={70}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              5 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={17}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              4 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={8}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              3 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={4}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              2 <MdOutlineStar />
            </span>
          </Rating.Advanced>
          <Rating.Advanced
            percentFilled={1}
            className="mb-2 [&>div]:[&>div]:bg-gray-500 [&>span]:text-gray-500 [&>div]:[&>div]:h-2 [&>div]:h-2"
          >
            <span className="flex items-center text-gray-500">
              1 <MdOutlineStar />
            </span>
          </Rating.Advanced>
        </div>
      </div>
      <div className="flex flex-col gap-4 pb-4 px-6 divide-y-2">
        {[
          {
            title: "Perfect Product!",
            review: "Excellent product from flipkart. Use this example to show the number of reviews a product received next to the average stars and scores.",
            product: "Colour Gold, Black",
            rating: 5
          },
          {
            title: "Great Service",
            review: "Amazing wedding planning service. The team was professional and delivered everything on time. Highly recommended for your special day.",
            product: "Wedding Package, Silver",
            rating: 4
          },
          {
            title: "Outstanding Quality",
            review: "The decorations were beautiful and the photography was exceptional. Our guests were impressed with the attention to detail.",
            product: "Decor Package, Rose Gold",
            rating: 5
          }
        ]
          .filter((item, index) => {
            // Filter based on search term
            if (!search) return true;
            const searchLower = search.toLowerCase();
            return (
              item.title.toLowerCase().includes(searchLower) ||
              item.review.toLowerCase().includes(searchLower) ||
              item.product.toLowerCase().includes(searchLower)
            );
          })
          .map((item, index) => (
            <>
              <div className="flex flex-col gap-4 py-4" key={index}>
                <div className="flex flex-row gap-2 items-center">
                  <Rating>
                    {[...Array(5)].map((_, starIndex) => (
                      <Rating.Star 
                        key={starIndex}
                        className="text-gray-500" 
                        filled={starIndex < item.rating}
                      />
                    ))}
                    <p className="ml-2 font-semibold text-gray-500 dark:text-gray-400">
                      {item.rating}
                    </p>
                  </Rating>
                  <div className="h-1 w-1 rounded-full bg-gray-500" />
                  <p>{item.title}</p>
                </div>
                <div className="text-gray-400 text-sm -mt-4">
                  Review for: {item.product}
                </div>
                <p className="">
                  {item.review}
                </p>
                <div className="flex flex-row gap-4 items-center">
                  <Button
                    // onClick={() =>
                      // router.push(`/reviews/${item._id}?replyreviews=true`)
                    // }
                    className="px-4 py-0 text-white bg-custom-dark-blue enabled:hover:bg-custom-dark-blue max-w-max"
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
                          removereviewsLike(item._id);
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
                          addreviewsLike(item._id);
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
                          removereviewsDisLike(item._id);
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
                          addreviewsDisLike(item._id);
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
