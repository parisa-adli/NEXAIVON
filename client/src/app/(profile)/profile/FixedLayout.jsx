"use client";

import Drawer from "@/common/Drawer";
import HeaderPanel from "@/common/HeaderPanel";
import PanelBreadCrumbs from "@/common/PanelBreadCrumbs";
import { useState } from "react";
import SideBar from "./SideBar";
import BottomNav from "@/pages/BottomNav";

function FixedLayout({ children }) {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  return (
    <div>
      {/* before the Drawer so the open drawer (same z-20) paints over it */}
      <BottomNav />
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
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          <PanelBreadCrumbs />
          {children}
        </div>
      </div>
    </div>
  );
}
export default FixedLayout;
