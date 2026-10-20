"use client";

import Drawer from "@/common/Drawer";
import HeaderPanel from "@/common/HeaderPanel";
import { useState } from "react";
import AdminSideBar from "./AdminSideBar";

function FixedLayout({ children }) {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  return (
    <div>
      <HeaderPanel
        isOpenDrawer={isOpenDrawer}
        setIsOpenDrawer={setIsOpenDrawer}
      >
        پنل ادمین
      </HeaderPanel>
      <div className="flex h-screen">
        <Drawer open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)}>
          <AdminSideBar
            isOpenDrawer={isOpenDrawer}
            onClose={() => setIsOpenDrawer(false)}
          />
        </Drawer>
        <div className="hidden lg:block">
          <AdminSideBar />
        </div>
        <div className="flex-1 overflow-y-auto p-4 ">{children}</div>
      </div>
    </div>
  );
}
export default FixedLayout;
