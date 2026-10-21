import { Inter } from "next/font/google";

// Used only for the wordmark and Latin text on the Storefront (`font-latin`).
const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default interFont;
