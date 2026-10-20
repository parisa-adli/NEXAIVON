"use client";

import Link from "next/link";
import { IoHome } from "react-icons/io5";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { HiUser } from "react-icons/hi2";
import { MdPayment, MdLogout } from "react-icons/md";
import { logout } from "@/services/authServices";
import { IoClose } from "react-icons/io5";

function SideBar({ onClose, isOpenDrawer }) {
  const logoutHandler = async () => {
    await logout();
    // localStorage.removeItem("userInfo");
    // localStorage.removeItem("cartItem");
    // localStorage.removeItem("token");
    document.location.href = "/";
  };

  return (
    <div className="w-[200px] overflow-y-auto p-4 h-screen bg-secondary-50">
      <ul className="flex flex-col space-y-8 pt-4">
        <li className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span>
              <IoHome className="btnIcon" />
            </span>
            <Link href="/">صفحه اصلی</Link>
          </div>
          {isOpenDrawer && (
            <button
              onClick={onClose}
              className={"text-rose-500 w-6 h-6 lg:hidden"}
            >
              <IoClose />
            </button>
          )}
        </li>
        <li className="flex items-center gap-x-2">
          <span>
            <HiMiniSquares2X2 className="btnIcon" />
          </span>
          <Link href="/profile">داشبورد</Link>
        </li>
        <li className="flex items-center gap-x-2">
          <span>
            <HiUser className="btnIcon" />
          </span>
          <Link href="/profile/me">اطلاعات کاربری</Link>
        </li>
        <li className="flex items-center gap-x-2">
          <span>
            <MdPayment className="btnIcon" />
          </span>
          <Link href="/profile/payments">سفارشات</Link>
        </li>
        <li>
          <button onClick={logoutHandler} className="flex items-center gap-x-2">
            <span>
              <MdLogout className="btnIcon" />
            </span>
            <span>خروج</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
export default SideBar;
