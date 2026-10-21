"use client";

// PROTOTYPE: restyled sort control. Same options and same navigation as
// SortProducts (router.push with ?sort=), only the look differs.

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "latest", label: "جدید ترین" },
  { value: "earliest", label: "قدیمی ترین" },
  { value: "popular", label: "محبوب ترین" },
];

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--p-ink))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--p-bg))]";

function SortChips({ layout = "chips" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "";

  const sortHandler = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  if (layout === "segmented") {
    return (
      <div
        role="group"
        aria-label="مرتب سازی"
        className="inline-flex rounded-full border border-[rgb(var(--p-line)/0.15)] p-1"
      >
        {sortOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={sort === item.value}
            onClick={() => sortHandler(item.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${focus} ${
              sort === item.value
                ? "bg-[rgb(var(--p-cta))] text-[rgb(var(--p-on-cta))] font-bold"
                : "text-[rgb(var(--p-muted))] hover:text-[rgb(var(--p-ink))]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  if (layout === "list") {
    return (
      <ul className="space-y-1">
        {sortOptions.map((item) => (
          <li key={item.value}>
            <button
              type="button"
              aria-pressed={sort === item.value}
              onClick={() => sortHandler(item.value)}
              className={`w-full text-start rounded-lg px-3 py-2 text-sm ${focus} ${
                sort === item.value
                  ? "bg-[rgb(var(--p-sage)/0.35)] font-bold"
                  : "text-[rgb(var(--p-muted))] hover:bg-[rgb(var(--p-sage)/0.15)]"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span className="text-sm text-[rgb(var(--p-muted))] whitespace-nowrap">
        مرتب سازی:
      </span>
      {sortOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={sort === item.value}
          onClick={() => sortHandler(item.value)}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${focus} ${
            sort === item.value
              ? "border-[rgb(var(--p-ink))] bg-[rgb(var(--p-ink))] text-[rgb(var(--p-bg))] font-bold"
              : "border-[rgb(var(--p-line)/0.2)] hover:border-[rgb(var(--p-ink))]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export default SortChips;
