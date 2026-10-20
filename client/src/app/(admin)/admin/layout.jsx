import "../../globals.css";
import vazirFont from "@/constants/localFonts";
import Providers from "@/pages/Providers";
import { Toaster } from "react-hot-toast";
import FixedLayout from "./FixedLayout";

export const metadata = {
  title: "پروفایل ادمین",
  description: "پروفایل ادمین",
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
