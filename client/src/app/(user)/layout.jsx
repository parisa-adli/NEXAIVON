import vazirFont from "@/constants/localFonts";
import interFont from "@/constants/latinFont";
import "../globals.css";
import Providers from "../Providers";
import { Toaster } from "react-hot-toast";
import Header from "../Header";

export const metadata = {
  title: "NEXAIVON",
  description: "NEXAIVON پنل مدیریت ادمین",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirFont.variable} ${interFont.variable} storefront font-sans text-body bg-page text-ink`}
      >
        <Providers>
          <Toaster />
          <Header />
          <div className="container xl:max-w-screen-xl">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
