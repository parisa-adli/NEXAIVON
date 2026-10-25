import Link from "next/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { toPersianNumbers } from "@/utils/toPersianNumber";

// First, last and the pages around the current one; gaps become "…".
function pageList(page, totalPages) {
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages.at(-1) !== "…") pages.push("…");
  }
  return pages;
}

function Pagination({ pagination, searchParams }) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const hrefFor = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    return `/products?${params}`;
  };
  const itemClass =
    "w-8 h-8 flex items-center justify-center rounded-md text-sm";

  return (
    <nav aria-label="صفحه‌بندی" className="flex items-center gap-x-2">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          aria-label="صفحه قبل"
          className={`${itemClass} border border-secondary-200`}
        >
          <LuChevronRight className="w-4 h-4" />
        </Link>
      )}
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className={itemClass}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${itemClass} ${
              p === page ? "bg-brand text-white" : "hover:bg-secondary-100"
            }`}
          >
            {toPersianNumbers(p)}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          aria-label="صفحه بعد"
          className={`${itemClass} border border-secondary-200`}
        >
          <LuChevronLeft className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
export default Pagination;
