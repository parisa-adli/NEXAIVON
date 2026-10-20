"use client";

import DarkModeToggle from "./DarkModeToggle";
import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

function HeaderPanel({ children, isOpenDrawer, setIsOpenDrawer }) {
  return (
    <div className="shadow-md sticky top-0 py-1 bg-secondary-50">
      <div className="flex items-center justify-between py-2 container xl:max-w-screen-xl px-8 transition-all duration-200 ease-out">
        <button
          className="lg:hidden"
          onClick={() => setIsOpenDrawer((prev) => !prev)}
        >
          {isOpenDrawer ? (
            <IoClose className="w-6 h-6" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>
        <p className="font-bold">{children}</p>
        <DarkModeToggle />
      </div>
    </div>
  );
}
export default HeaderPanel;
