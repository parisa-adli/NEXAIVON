// Round icon-only control with a 44 px touch target (sub-PRD 01 §4.5). The
// class is exported for links that need the same look.
export const iconButtonClass =
  "focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-ink transition-colors duration-200 hover:bg-ink/5 active:bg-ink/10";

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${iconButtonClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export default IconButton;
