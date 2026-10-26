import vazirFont from "@/constants/localFonts";
import "../globals.css";
import Providers from "../Providers";
import { Toaster } from "react-hot-toast";
import Header from "../Header";
import Footer from "../Footer";
import BottomNav from "../BottomNav";
import { getCachedHomeContent } from "@/services/homeContentCache";

export const metadata = {
  title: "NEXAIVON",
  description: "NEXAIVON پنل مدیریت ادمین",
};

export default async function RootLayout({ children }) {
  const { navLinks, searchTags } = await getCachedHomeContent();
  return (
    <html lang="fa" dir="rtl">
      <body
        suppressHydrationWarning
        className={`${vazirFont.variable} font-sans bg-secondary-0 text-secondary-700 pb-20 md:pb-0`}
      >
        <Providers>
          <Toaster />
          <Header navLinks={navLinks} searchTags={searchTags} />
          <div className="container xl:max-w-screen-xl">{children}</div>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
