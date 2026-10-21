"use client";

// PROTOTYPE: floating variant switcher for throwaway UI prototypes.
// Lives on a prototype/* branch only; never merge into main.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function PrototypeSwitcher({ variants, names = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("variant") ?? variants[0];
  const index = Math.max(variants.indexOf(current), 0);

  const go = (step) => {
    const next = variants[(index + step + variants.length) % variants.length];
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;
      // Physical arrows, regardless of RTL: right = next, left = previous.
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      dir="ltr"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-x-3 rounded-full bg-fuchsia-600 text-white px-4 py-2 shadow-2xl font-mono text-sm"
    >
      <button onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        PROTOTYPE {current}
        {names[current] ? ` (${names[current]})` : ""}
      </span>
      <button onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
export default PrototypeSwitcher;
