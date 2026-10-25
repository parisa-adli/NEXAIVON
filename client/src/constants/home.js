import {
  LuCable,
  LuCamera,
  LuCreditCard,
  LuHeadphones,
  LuHeadset,
  LuShieldCheck,
  LuSmartphone,
  LuTablet,
  LuTruck,
  LuWatch,
} from "react-icons/lu";
import {
  SiApple,
  SiHuawei,
  SiJbl,
  SiSamsung,
  SiSony,
  SiXiaomi,
} from "react-icons/si";

// shortcut: category links all point to /products, link real category slugs once the nav set is decided (design.md §10.1)
export const navLinks = [
  { label: "صفحه اصلی", href: "/" },
  { label: "موبایل", href: "/products" },
  { label: "هدفون و هندزفری", href: "/products" },
  { label: "ساعت هوشمند", href: "/products" },
  { label: "گجت‌های دیجیتال", href: "/products" },
  { label: "لوازم جانبی", href: "/products" },
];

export const heroSlides = [
  {
    eyebrow: "تکنولوژی، همراه زندگی شما",
    title: "جدیدترین گوشی‌های هوشمند",
    subtitle: "با بهترین برندها، جدیدترین مدل‌ها و گارانتی معتبر",
    icon: LuSmartphone,
  },
  {
    eyebrow: "همیشه در جریان",
    title: "ساعت‌های هوشمند",
    subtitle: "سلامتی و اعلان‌ها، همیشه روی مچ دست شما",
    icon: LuWatch,
  },
  {
    eyebrow: "صدای خالص",
    title: "هدفون و هندزفری بی‌سیم",
    subtitle: "حذف نویز و کیفیت صدای عالی از برندهای معتبر",
    icon: LuHeadphones,
  },
];

// shortcut: icons stand in for product photos, swap for images when assets exist
export const homeCategories = [
  { label: "موبایل", href: "/products", icon: LuSmartphone },
  { label: "تبلت", href: "/products", icon: LuTablet },
  { label: "هدفون و هندزفری", href: "/products", icon: LuHeadphones },
  { label: "ساعت هوشمند", href: "/products", icon: LuWatch },
  { label: "گجت‌های دیجیتال", href: "/products", icon: LuCamera },
  { label: "لوازم جانبی", href: "/products", icon: LuCable },
];

export const promos = [
  {
    chip: "ساعت‌های هوشمند",
    title: "سبک زندگی هوشمند",
    subtitle: "مدل‌های جدید با امکانات پیشرفته",
    icon: LuWatch,
    dark: true,
  },
  {
    chip: "هدفون و هندزفری",
    title: "صدای شفاف، تجربه بهتر",
    subtitle: "با بهترین برندها و کیفیت عالی",
    icon: LuHeadphones,
    dark: false,
  },
];

export const brands = [
  { name: "Apple", icon: SiApple },
  { name: "Samsung", icon: SiSamsung },
  { name: "Xiaomi", icon: SiXiaomi },
  { name: "Sony", icon: SiSony },
  { name: "JBL", icon: SiJbl },
  { name: "Huawei", icon: SiHuawei },
  // no Anker glyph in react-icons, rendered as a wordmark
  { name: "ANKER" },
];

export const services = [
  { title: "ارسال سریع", subtitle: "به سراسر کشور", icon: LuTruck },
  { title: "ضمانت اصالت کالا", subtitle: "با گارانتی معتبر", icon: LuShieldCheck },
  { title: "پرداخت امن", subtitle: "با درگاه‌های مطمئن", icon: LuCreditCard },
  { title: "پشتیبانی ۲۴/۷", subtitle: "در تمام مراحل خرید", icon: LuHeadset },
];

export const footerColumns = [
  {
    title: "خدمات مشتریان",
    links: [
      { label: "پیگیری سفارش", href: "/profile" },
      { label: "راهنمای خرید", href: "#" },
      { label: "سوالات متداول", href: "#" },
      { label: "شرایط و ضوابط", href: "#" },
      { label: "حریم خصوصی", href: "#" },
    ],
  },
  { title: "دسترسی سریع", links: navLinks },
];

export const contact = {
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "info@nexaivon.com",
  address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
};
