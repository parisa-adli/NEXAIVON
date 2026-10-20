import { useEffect, useRef } from "react";

export default function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      e.stopPropagation();
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClick, listenCapturing);

    return () =>
      document.removeEventListener("mousedown", handleClick, listenCapturing);
  }, [handler, listenCapturing]);

  return ref;
}
