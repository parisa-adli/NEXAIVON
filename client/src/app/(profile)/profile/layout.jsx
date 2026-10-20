import "../../globals.css";
import vazirFont from "@/constants/localFonts";
import Providers from "@/pages/Providers";
import { Toaster } from "react-hot-toast";
import SideBar from "./SideBar";
import HeaderPanel from "@/common/HeaderPanel";
import FixedLayout from "./FixedLayout";

export const metadata = {
  title: "پروفایل کاربر",
  description: "پروفایل کاربر",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirFont.variable} font-sans bg-secondary-0 text-secondary-700`}
      >
        <Providers>
          <Toaster />
          <FixedLayout>{children}</FixedLayout>
        </Providers>
      </body>
    </html>
  );
}
