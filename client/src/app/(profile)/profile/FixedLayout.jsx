"use client";

import Drawer from "@/common/Drawer";
import HeaderPanel from "@/common/HeaderPanel";
import { useState } from "react";
import SideBar from "./SideBar";

function FixedLayout({ children }) {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  return (
    <div>
      <HeaderPanel
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
      >
        پنل کاربر
      </HeaderPanel>
      <div className="flex h-screen">
        <Drawer open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)}>
          <SideBar
            isOpenDrawer={isOpenDrawer}
            onClose={() => setIsOpenDrawer(false)}
          />
        </Drawer>
        <div className="hidden lg:block">
          <SideBar />
        </div>
        <div className="flex-1 overflow-y-auto p-4 ">{children}</div>
      </div>
    </div>
  );
}
export default FixedLayout;
