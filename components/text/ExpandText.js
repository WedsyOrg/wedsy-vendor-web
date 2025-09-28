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
              className="text-blue-500 underline cursor-pointer"
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              show less
            </span>
          </>
        ) : (
          <>
            {text?.slice(0, limit)}...
            <span
              className="text-blue-500 underline cursor-pointer"
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              show more
            </span>
          </>
        )
      ) : (
        text
      )}
    </>
  );
}
