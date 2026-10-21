import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { iconButtonClass } from "./IconButton";

// Cart link with its badge. `count` is passed in as computed today; the badge
// waits while the account is loading.
function CartLink({ count, isLoading }) {
  return (
    <Link
      href="/cart"
      aria-label={isLoading ? "سبد خرید" : `سبد خرید، ${count} محصول`}
      className={`${iconButtonClass} relative`}
    >
      <FaCartShopping className="h-5 w-5" aria-hidden="true" />
      {!isLoading && (
        <span
          aria-hidden="true"
          className="absolute top-0 end-0 flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-ink px-1 text-caption font-bold text-page"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
export default CartLink;
