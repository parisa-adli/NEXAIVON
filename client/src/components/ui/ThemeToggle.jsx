import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";

// Storefront equivalent of the shared dark-mode toggle: same icon swap, the
// handler comes from the caller.
function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? "حالت روشن" : "حالت تاریک"}
      className="focus-ring flex h-10 w-10 items-center justify-center rounded-pill text-ink transition-colors duration-200 hover:bg-ink/5"
    >
      {isDarkMode ? (
        <HiOutlineSun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <HiOutlineMoon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
export default ThemeToggle;
