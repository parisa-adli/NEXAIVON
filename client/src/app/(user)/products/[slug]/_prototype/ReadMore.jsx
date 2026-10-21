"use client";

// PROTOTYPE: local-only "show more" for long descriptions (visual state only).

import { useState } from "react";

function ReadMore({ text, lines = 5 }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p
        className="whitespace-pre-line leading-8 text-[rgb(var(--p-ink)/0.85)]"
        style={
          open
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mt-2 text-sm font-bold text-[rgb(var(--p-sage-ink))] hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--p-ink))]"
      >
        {open ? "نمایش کمتر" : "نمایش بیشتر"}
      </button>
    </div>
  );
}
export default ReadMore;
