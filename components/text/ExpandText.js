import { useState } from "react";

export default function ExpandText({ text, limit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {text?.length > limit ? (
        expanded ? (
          <>
            {text}
            <br />
            <span
              className="text-[#2B3F6C] hover:text-[#1e2d4a] cursor-pointer font-medium ml-1"
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              Show less
            </span>
          </>
        ) : (
          <>
            {text?.slice(0, limit)}...
            <span
              className="text-[#2B3F6C] hover:text-[#1e2d4a] cursor-pointer font-medium ml-1"
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              Show more
            </span>
          </>
        )
      ) : (
        text
      )}
    </>
  );
}
