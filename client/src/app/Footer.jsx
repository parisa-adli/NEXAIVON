import Link from "next/link";
import Logo from "@/common/Logo";
import { contact, footerColumns } from "@/constants/home";
import {
  LuChevronUp,
  LuInstagram,
  LuLinkedin,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSend,
  LuYoutube,
} from "react-icons/lu";

const socials = [
  { label: "Instagram", icon: LuInstagram },
  { label: "Telegram", icon: LuSend },
  { label: "LinkedIn", icon: LuLinkedin },
  { label: "YouTube", icon: LuYoutube },
];

function Footer() {
  return (
    <footer className="bg-footer text-gray-300 mt-16 px-4">
      <div className="container xl:max-w-screen-xl grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <h3 className="text-white font-bold mb-4">تماس با ما</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-x-2">
              <LuPhone className="w-4 h-4" />
              <span dir="ltr">{contact.phone}</span>
            </li>
            <li className="flex items-center gap-x-2">
              <LuMail className="w-4 h-4" />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li className="flex items-center gap-x-2">
              <LuMapPin className="w-4 h-4" />
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-white font-bold mb-4">{column.title}</h3>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="space-y-4">
          <Logo className="brightness-0 invert" />
          <p className="leading-7">
            فروشگاه اینترنتی لوازم دیجیتال و گجت‌های هوشمند، همراه شما در دنیای
            تکنولوژی
          </p>
          <ul className="flex gap-x-4">
            {socials.map(({ label, icon: Icon }) => (
              <li key={label}>
                <a href="#" aria-label={label} className="text-white">
                  <Icon className="w-5 h-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container xl:max-w-screen-xl flex items-center justify-between py-4 text-xs text-gray-400">
        <span dir="ltr">© 2025 NEXAIVON. All rights reserved.</span>
        <a
          href="#"
          aria-label="بازگشت به بالا"
          className="w-8 h-8 flex items-center justify-center rounded bg-white/10 text-white"
        >
          <LuChevronUp />
        </a>
      </div>
    </footer>
  );
}
export default Footer;
