"use client";

import { useRef } from "react";

// mouse click-and-drag horizontal scroll; touch already scrolls natively
function DragScroll({ className = "", children }) {
  const drag = useRef(null);
  const moved = useRef(false);

  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    moved.current = false;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 5) moved.current = true;
    // relative delta, so it works with RTL's negative scrollLeft too
    e.currentTarget.scrollLeft = drag.current.left - dx;
  };

  const endDrag = () => (drag.current = null);

  // a drag that ends over a link/button must not trigger it
  const onClickCapture = (e) => {
    if (!moved.current) return;
    e.preventDefault();
    e.stopPropagation();
    moved.current = false;
  };

  return (
    <div
      className={`${className} cursor-grab active:cursor-grabbing`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
export default DragScroll;
