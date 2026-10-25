"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { useDarkMode } from "@/context/DarkModeContext";

const iconClass =
  "absolute inset-0 w-6 h-6 motion-safe:transition-all motion-safe:duration-500";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "حالت روشن" : "حالت تاریک"}
      className="relative w-6 h-6"
    >
      {/* both icons stay mounted so the swap can cross-fade and rotate */}
      <LuSun
        aria-hidden
        className={`${iconClass} ${
          isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`}
      />
      <LuMoon
        aria-hidden
        className={`${iconClass} ${
          isDarkMode ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
    </button>
  );
}
export default DarkModeToggle;
