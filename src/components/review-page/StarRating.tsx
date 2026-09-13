"use client";

import { useState } from "react";

export default function StarRating({
  onRate,
}: {
  onRate: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-5xl transition-transform hover:scale-110 active:scale-95 focus:outline-none"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => {
            setSelected(star);
            onRate(star);
          }}
        >
          <span
            className={
              star <= (hover || selected)
                ? "text-yellow-400"
                : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
