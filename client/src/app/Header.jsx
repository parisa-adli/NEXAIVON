"use client";
import DarkModeToggle from "@/common/DarkModeToggle";
import { useGetUser } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import DropDown from "@/common/DropDown";
import Logo from "@/common/Logo";
import { navLinks, searchTags } from "@/constants/home";
import { toPersianNumbers } from "@/utils/toPersianNumber";
import { LuSearch, LuShoppingCart, LuUser, LuX } from "react-icons/lu";
import Icon from "react-multi-date-picker/components/icon";

function Header() {
  const { data, isLoading } = useGetUser();
  const { user, cart } = data || {};
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchTimer = useRef();

  const searchHandler = (e) => {
    const value = e.target.value.trim();
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const onProducts = pathname === "/products";
      if (!onProducts && !value) return;
      // read params at fire time so category/sort filters on /products are kept
      const params = new URLSearchParams(
        onProducts ? window.location.search : "",
      );
      value ? params.set("search", value) : params.delete("search");
      const url = `/products?${params}`;
      onProducts ? router.replace(url) : router.push(url);
    }, 300);
  };

  const mobileSearchHandler = (e) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("search").trim();
    if (!value) return;
    setIsSearchOpen(false);
    router.push(`/products?${new URLSearchParams({ search: value })}`);
  };

  return (
    <>
      <header
        className={`mb-6 px-4 sticky top-0 transition-all duration-200 bg-secondary-0 z-10
        ${
          isLoading
            ? "blur-sm opacity-70 pointer-events-none"
            : "blur-0 opacity-100"
        }
        `}
      >
        <div className="container xl:max-w-screen-xl flex items-center justify-between gap-x-4 py-3">
          <Logo />
          <form
            action="/products"
            className="hidden md:flex flex-1 max-w-md items-center gap-x-2 bg-secondary-100 rounded-full px-4"
          >
            <LuSearch className="w-5 h-5 text-secondary-500" />
            <input
              name="search"
              type="search"
              onChange={searchHandler}
              aria-label="جستجو در محصولات"
              placeholder="جستجو در محصولات..."
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </form>
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              aria-label="جستجو"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden"
            >
              <LuSearch className="w-6 h-6" />
            </button>
            <DarkModeToggle />
            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  aria-label="حساب کاربری"
                  // DropDown closes itself on outside mousedown, so a toggle here would reopen it
                  onClick={() => setIsOpen(true)}
                >
                  <LuUser className="w-6 h-6" />
                </button>
                {isOpen && (
                  <DropDown user={user} onClose={() => setIsOpen(false)} />
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden md:block rounded-full border border-secondary-200 px-4 py-1.5 text-sm font-medium hover:text-brand hover:border-brand"
              >
                ورود
              </Link>
            )}
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative hidden md:block"
            >
              <LuShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-brand text-white text-xs">
                {toPersianNumbers(cart ? cart.payDetail.productIds.length : 0)}
              </span>
            </Link>
          </div>
        </div>
        <nav className="hidden md:block container xl:max-w-screen-xl overflow-x-auto">
          <ul className="flex md:justify-center gap-x-8 text-sm font-medium whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = link.href === pathname;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`block py-3 border-b-2 ${
                      isActive
                        ? "text-brand border-brand"
                        : "border-transparent hover:text-brand"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      {/* outside <header>: its filter would make it the containing block of a fixed child */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="جستجو"
          onKeyDown={(e) => e.key === "Escape" && setIsSearchOpen(false)}
          className="md:hidden fixed inset-0 z-50 overflow-y-auto bg-secondary-0 p-4"
        >
          <div className="flex items-center gap-x-3">
            <form
              onSubmit={mobileSearchHandler}
              className="flex flex-1 items-center gap-x-2 bg-secondary-100 rounded-full px-4"
            >
              <LuSearch className="w-5 h-5 text-secondary-500" />
              <input
                name="search"
                type="search"
                autoFocus
                aria-label="جستجو در محصولات"
                placeholder="جستجو در محصولات..."
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </form>
            <button
              type="button"
              aria-label="بستن جستجو"
              onClick={() => setIsSearchOpen(false)}
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-6 mb-3 text-sm font-bold text-secondary-900">
            جستجوهای پیشنهادی
          </p>
          <ul className="flex flex-wrap gap-2">
            {searchTags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/products?${new URLSearchParams({ search: tag })}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="block rounded-full bg-secondary-100 px-4 py-2 text-sm text-secondary-700"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
export default Header;
