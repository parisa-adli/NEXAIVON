"use client";
import DarkModeToggle from "@/common/DarkModeToggle";
import { useGetUser } from "@/hooks/useAuth";
import Wordmark from "@/components/ui/Wordmark";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";
import { useState } from "react";
import DropDown from "@/common/DropDown";
import { MdLogout } from "react-icons/md";

function Header() {
  const { data, error, isLoading } = useGetUser();
  const { user, cart } = data || {};
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`shadow-md mb-10 px-4 sticky top-0 transition-all duration-200 bg-surface z-10
        ${
          isLoading
            ? "blur-sm opacity-70 pointer-events-none"
            : "blur-0 opacity-100"
        }
        `}
    >
      <nav>
        <ul className="flex items-center justify-between py-2 container xl:max-w-screen-xl">
          <div className="flex items-center gap-x-4 sm:gap-x-8">
            <li>
              <Link className="focus-ring py-2 flex items-center rounded-card" href="/">
                <Wordmark className="text-lg" />
              </Link>
            </li>
            <li>
              <Link className="hidden sm:block py-2" href="/products">
                محصولات
              </Link>
            </li>
          </div>
          <div className="flex items-center gap-x-4">
            <DarkModeToggle />
            {user ? (
              <div className="relative flex items-center gap-x-6  border-l pl-4 border-secondary-700">
                <div
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="cursor-pointer"
                >
                  <FaUserAlt className="w-5 h-5 text-secondary-600" />
                  {isOpen && (
                    <DropDown user={user} onClose={() => setIsOpen(false)} />
                  )}
                  {/* {user.name} */}
                </div>
              </div>
            ) : (
              <li>
                <Link
                  className="flex items-center gap-x-1 py-0.5 text-white bg-primary-900 px-2 rounded-lg ml-2"
                  href="/auth"
                >
                  <span>ورود</span>
                  <MdLogout className="transform scale-x-[-1]" />
                </Link>
              </li>
            )}
            <li>
              <Link className="flex items-center gap-x-3" href="/cart">
                <span className="relative">
                  <FaCartShopping className="w-5 h-5 " />
                  <span className="absolute -bottom-1.5 -right-2 bg-rose-500 px-[3px] py-[1px] rounded-xl text-white text-sm">
                    {cart ? cart.payDetail.productIds.length : 0}
                  </span>
                </span>
              </Link>
            </li>
          </div>
        </ul>
      </nav>
    </header>
  );
}
export default Header;
