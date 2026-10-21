import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";

// Cart link with its badge. `count` is passed in as computed today; `null`
// hides the badge (account still loading).
function CartLink({ count }) {
  return (
    <Link
      href="/cart"
      aria-label={count === null ? "سبد خرید" : `سبد خرید، ${count} محصول`}
      className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-pill text-ink transition-colors duration-200 hover:bg-ink/5"
    >
      <FaCartShopping className="h-5 w-5" aria-hidden="true" />
      {count !== null && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 end-0 flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-ink px-1 text-caption font-bold text-page"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
export default CartLink;
