"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import IconButton from "./IconButton";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
// Tailwind's `sm` breakpoint: the drawer only exists below it.
const DESKTOP = "(min-width: 640px)";

// Side drawer for the mobile header links. Open state belongs to the caller.
// While open it keeps focus inside, locks page scroll, closes on Escape, a
// backdrop click or a widening viewport, and hands focus back to the element
// that opened it.
function MobileDrawer({ id, open, onClose, title, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const panel = panelRef.current;
    panel.querySelector(FOCUSABLE)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const desktop = window.matchMedia(DESKTOP);
    const handleWiden = (e) => e.matches && onCloseRef.current();
    desktop.addEventListener("change", handleWiden);

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleWiden);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const titleId = `${id}-title`;

  return createPortal(
    <div className="fixed inset-0 z-50 sm:hidden">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-surface text-ink shadow-xl"
      >
        <div className="flex h-16 items-center justify-between border-b border-line/10 px-4">
          <span id={titleId} className="text-small font-bold">
            {title}
          </span>
          <IconButton onClick={onClose} label="بستن منو">
            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
        <nav aria-label={title} className="flex-1 overflow-y-auto p-4">
          {children}
        </nav>
      </div>
    </div>,
    document.body
  );
}
export default MobileDrawer;
