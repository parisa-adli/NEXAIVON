"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiOutlineXMark } from "react-icons/hi2";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Side drawer for the mobile header links. Open state belongs to the caller.
// While open it keeps focus inside, closes on Escape or a backdrop click and
// hands focus back to the element that opened it.
function MobileDrawer({ id, open, onClose, title, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const panel = panelRef.current;
    panel.querySelector(FOCUSABLE)?.focus();

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
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

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
        aria-label={title}
        className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-surface text-ink shadow-xl"
      >
        <div className="flex h-16 items-center justify-between border-b border-line/10 px-4">
          <span className="text-small font-bold">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-pill transition-colors duration-200 hover:bg-ink/5"
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">{children}</nav>
      </div>
    </div>,
    document.body
  );
}
export default MobileDrawer;
