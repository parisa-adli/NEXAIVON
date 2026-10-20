import { FaUserAlt, FaUserLock } from "react-icons/fa";
import { LuPanelRightClose } from "react-icons/lu";
import { MdLogout } from "react-icons/md";
import { logout } from "@/services/authServices";
import Link from "next/link";
import useOutsideClick from "@/hooks/useOutsideClick";

function DropDown({ user, onClose }) {
  const ref = useOutsideClick(onClose);
  const logoutHandler = async () => {
    await logout();
    document.location.href = "/";
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 mt-2 w-48 bg-secondary-50 border border-secondary-100 rounded-lg shadow-lg z-10"
    >
      <div className="flex flex-col gap-y-4 p-4">
        <div className="flex items-center gap-x-5">
          <FaUserAlt />
          <span>{user.name}</span>
        </div>
        <Link className="py-2 flex items-center gap-x-5" href="/profile">
          <LuPanelRightClose />
          <span>حساب کاربری</span>
        </Link>
        {user && user.role === "ADMIN" ? (
          <Link className="py-2 flex items-center gap-x-5" href="/admin">
            <FaUserLock />
            <span>پنل ادمین</span>
          </Link>
        ) : (
          ""
        )}
        <button onClick={logoutHandler} className="flex items-center gap-x-5">
          <MdLogout />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
}
export default DropDown;
