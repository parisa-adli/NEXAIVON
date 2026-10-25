"use client";
import DarkModeToggle from "@/common/DarkModeToggle";
import { useGetUser } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import DropDown from "@/common/DropDown";
import Logo from "@/common/Logo";
import { navLinks } from "@/constants/home";
import { toPersianNumbers } from "@/utils/toPersianNumber";
import { LuSearch, LuShoppingCart, LuUser } from "react-icons/lu";

function Header() {
  const { data, isLoading } = useGetUser();
  const { user, cart } = data || {};
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
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
          className="hidden md:flex items-center gap-x-2 flex-1 max-w-md bg-secondary-100 rounded-full px-4"
        >
          <LuSearch className="w-5 h-5 text-secondary-500" />
          <input
            name="search"
            type="search"
            aria-label="جستجو در محصولات"
            placeholder="جستجو در محصولات..."
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </form>
        <div className="flex items-center gap-x-4">
          <DarkModeToggle />
          {user ? (
            <div className="relative">
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
            <Link href="/auth" aria-label="ورود">
              <LuUser className="w-6 h-6" />
            </Link>
          )}
          <Link href="/cart" aria-label="سبد خرید" className="relative">
            <LuShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-brand text-white text-xs">
              {toPersianNumbers(cart ? cart.payDetail.productIds.length : 0)}
            </span>
          </Link>
        </div>
      </div>
      <nav className="container xl:max-w-screen-xl overflow-x-auto">
        <ul className="flex md:justify-center gap-x-8 text-sm font-medium whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive = link.href === "/" && pathname === "/";
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
  );
}
export default Header;
