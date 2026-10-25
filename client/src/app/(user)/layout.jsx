import vazirFont from "@/constants/localFonts";
import "../globals.css";
import Providers from "../Providers";
import { Toaster } from "react-hot-toast";
import Header from "../Header";
import Footer from "../Footer";
import BottomNav from "../BottomNav";

export const metadata = {
  title: "NEXAIVON",
  description: "NEXAIVON پنل مدیریت ادمین",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        suppressHydrationWarning
        className={`${vazirFont.variable} font-sans bg-secondary-0 text-secondary-700 pb-20 md:pb-0`}
      >
        <Providers>
          <Toaster />
          <Header />
          <div className="container xl:max-w-screen-xl">{children}</div>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
