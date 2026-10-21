import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import IconButton from "./IconButton";

// Storefront equivalent of the shared dark-mode toggle: same icon swap, the
// handler comes from the caller.
function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <IconButton
      onClick={onToggle}
      label={isDarkMode ? "حالت روشن" : "حالت تاریک"}
    >
      {isDarkMode ? (
        <HiOutlineSun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <HiOutlineMoon className="h-5 w-5" aria-hidden="true" />
      )}
    </IconButton>
  );
}
export default ThemeToggle;
