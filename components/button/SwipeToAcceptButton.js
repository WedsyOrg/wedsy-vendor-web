"use client";

import { useState, useRef } from "react";
import { BsCheck } from "react-icons/bs";

export default function SwipeToAccept({ onAccept }) {
  const [isAccepted, setIsAccepted] = useState(false);
  const [offset, setOffset] = useState(0);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Start drag (mouse or touch)
  const handleStart = (e) => {
    isDragging.current = true;
    startX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  };

  // During drag
  const handleMove = (e) => {
    if (!isDragging.current || isAccepted) return;

    const currentX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;

    const deltaX = currentX - startX.current;
    const slider = sliderRef.current;
    const sliderWidth = slider.offsetWidth - 64; // 64px button width

    let newOffset = offset + deltaX;
    if (newOffset < 0) newOffset = 0;
    if (newOffset > sliderWidth) newOffset = sliderWidth;

    setOffset(newOffset);

    if (newOffset >= sliderWidth) {
      setIsAccepted(true);
      onAccept();
      isDragging.current = false;
    }

    startX.current = currentX;
  };

  // Stop drag
  const handleEnd = () => {
    isDragging.current = false;
    if (!isAccepted) {
      setOffset(0); // Reset if not fully swiped
    }
  };

  // Reset slider
  const handleReset = () => {
    setOffset(0);
    setIsAccepted(false);
  };

  return (
    <div
      className="w-full max-w-md mx-auto mt-6 select-none"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div
        ref={sliderRef}
        className="relative bg-green-600 text-white rounded-full h-16 flex items-center overflow-hidden"
      >
        <div
          className="absolute bg-white rounded-full h-16 w-16 flex items-center justify-center cursor-pointer border-2 border-green-600"
          style={{ transform: `translateX(${offset}px)` }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          <BsCheck className="text-green-600" size={32} />
        </div>
        {!isAccepted && (
          <span
            className={`absolute left-1/2 transform -translate-x-1/2 text-lg transition-opacity`}
          >
            Swipe to accept
          </span>
        )}
        {isAccepted && (
          <div className="w-full text-center">
            <span>✅ Accepted!</span>
            <button onClick={handleReset} className="ml-4 underline text-white">
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
