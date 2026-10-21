"use client";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { FaUserAlt, FaUserLock } from "react-icons/fa";
import { LuPanelRightClose } from "react-icons/lu";
import { MdLogout } from "react-icons/md";
import useOutsideClick from "@/hooks/useOutsideClick";

// Storefront equivalent of the shared account dropdown: same entries, the
// logout handler comes from the caller. Opens locally; closes on outside
// click, on Escape and when an entry is chosen.
function AccountMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useOutsideClick(close);

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isOpen) {
      close();
      buttonRef.current?.focus();
    }
  };

  const itemClass =
    "focus-ring flex w-full items-center gap-x-3 rounded-card px-3 py-2.5 text-small text-ink transition-colors duration-200 hover:bg-ink/5";

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label="حساب کاربری"
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-pill bg-sage/30 text-sage-ink transition-colors duration-200 hover:bg-sage/50"
      >
        <FaUserAlt className="h-4 w-4" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          id="account-menu"
          className="absolute end-0 top-full z-40 mt-2 w-56 rounded-card border border-line/10 bg-surface p-2 shadow-lg"
        >
          <div className="mb-1 flex items-center gap-x-3 border-b border-line/10 px-3 pb-3 pt-2">
            <FaUserAlt className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="truncate text-small font-bold text-ink">
              {user.name}
            </span>
          </div>
          <Link className={itemClass} href="/profile" onClick={close}>
            <LuPanelRightClose className="h-4 w-4" aria-hidden="true" />
            <span>حساب کاربری</span>
          </Link>
          {user.role === "ADMIN" && (
            <Link className={itemClass} href="/admin" onClick={close}>
              <FaUserLock className="h-4 w-4" aria-hidden="true" />
              <span>پنل ادمین</span>
            </Link>
          )}
          <button type="button" className={itemClass} onClick={onLogout}>
            <MdLogout className="h-4 w-4" aria-hidden="true" />
            <span>خروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
export default AccountMenu;
