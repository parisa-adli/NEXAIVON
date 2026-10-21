// Storefront call to action: charcoal pill with warm-white text, inverted in
// dark mode through the cta tokens. Presentational only.
function PillButton({
  children,
  type = "button",
  disabled = false,
  isLoading = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`focus-ring inline-flex items-center justify-center gap-x-2 rounded-pill bg-cta px-6 py-3 text-small font-bold text-on-cta transition-colors duration-200 hover:bg-cta/90 active:bg-cta/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cta ${className}`}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border-2 border-on-cta/40 border-t-on-cta motion-safe:animate-spin"
        />
      )}
      {children}
    </button>
  );
}
export default PillButton;
