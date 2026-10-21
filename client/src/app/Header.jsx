"use client";
import { useGetUser } from "@/hooks/useAuth";
import { useDarkMode } from "@/context/DarkModeContext";
import { logout } from "@/services/authServices";
import Wordmark from "@/components/ui/Wordmark";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccountMenu from "@/components/ui/AccountMenu";
import CartLink from "@/components/ui/CartLink";
import MobileDrawer from "@/components/ui/MobileDrawer";
import Link from "next/link";
import { useCallback, useState } from "react";
import { HiOutlineBars3 } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";

function Header() {
  const { data, isLoading } = useGetUser();
  const { user, cart } = data || {};
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const logoutHandler = async () => {
    await logout();
    document.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-30 mb-10 border-b border-line/10 bg-surface/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <nav
        aria-label="ناوبری اصلی"
        className="container flex h-16 items-center justify-between gap-x-2 xl:max-w-screen-xl"
      >
        <div className="flex items-center gap-x-1 sm:gap-x-8">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="header-drawer"
            aria-label="باز کردن منو"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-pill text-ink transition-colors duration-200 hover:bg-ink/5 sm:hidden"
          >
            <HiOutlineBars3 className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link
            className="focus-ring flex items-center rounded-card px-1 py-2"
            href="/"
          >
            <Wordmark className="text-base sm:text-lg" />
          </Link>
          <Link
            className="focus-ring hidden rounded-pill px-3 py-2 text-small font-bold text-muted transition-colors duration-200 hover:text-ink sm:block"
            href="/products"
          >
            محصولات
          </Link>
        </div>
        <div className="flex items-center gap-x-1 sm:gap-x-2">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          {isLoading ? (
            <span
              aria-hidden="true"
              className="h-10 w-10 rounded-pill bg-ink/10 motion-safe:animate-pulse"
            />
          ) : user ? (
            <AccountMenu user={user} onLogout={logoutHandler} />
          ) : (
            <Link
              className="focus-ring flex h-10 items-center gap-x-1.5 rounded-pill bg-cta px-4 text-small font-bold text-on-cta transition-colors duration-200 hover:bg-cta/90"
              href="/auth"
            >
              <span>ورود</span>
              <MdLogout className="h-4 w-4 scale-x-[-1]" aria-hidden="true" />
            </Link>
          )}
          <CartLink
            count={
              isLoading ? null : cart ? cart.payDetail.productIds.length : 0
            }
          />
        </div>
      </nav>
      <MobileDrawer
        id="header-drawer"
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="منو"
      >
        <ul className="flex flex-col gap-y-1">
          <li>
            <Link
              className="focus-ring block rounded-card px-3 py-3 text-body font-bold text-ink transition-colors duration-200 hover:bg-ink/5"
              href="/products"
              onClick={closeDrawer}
            >
              محصولات
            </Link>
          </li>
        </ul>
      </MobileDrawer>
    </header>
  );
}
export default Header;
