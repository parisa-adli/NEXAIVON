import { createPortal } from "react-dom";

function Drawer({ open, onClose, children }) {
  return createPortal(
    <>
      <div
        className={`backdrop-blur-sm fixed inset-0 w-full h-screen bg-secondary-800 bg-opacity-30 z-10 ${
          open ? "block" : "pointer-events-none hidden"
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed top-0 right-0 bottom-0 w-[200px] h-full transition-transform transform z-20 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="bg-secondary-0 h-full overflow-y-auto">{children}</div>
      </div>
    </>,
    document.body
  );
}
export default Drawer;
