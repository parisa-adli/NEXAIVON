import {
  LuCreditCard,
  LuHeadphones,
  LuHeadset,
  LuShieldCheck,
  LuSmartphone,
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

// category values are Category.englishTitle, the key the products filter reads
export const navLinks = [
  { label: "صفحه اصلی", href: "/" },
  { label: "موبایل", href: "/products?category=smartphones" },
  { label: "هدفون و هندزفری", href: "/products?category=headphones" },
  { label: "ساعت هوشمند", href: "/products?category=smartwatches" },
  { label: "گجت‌های دیجیتال", href: "/products?category=gadgets" },
  { label: "لوازم جانبی", href: "/products?category=accessories" },
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

export const homeCategories = [
  { label: "موبایل", category: "smartphones", image: "/category/mobile.png" },
  { label: "تبلت", category: "tablets", image: "/category/tablet.webp" },
  { label: "هدفون و هندزفری", category: "headphones", image: "/category/headphone.png" },
  { label: "ساعت هوشمند", category: "smartwatches", image: "/category/smart-watch.png" },
  { label: "گجت‌های دیجیتال", category: "gadgets", image: "/category/gadgets.png" },
  { label: "لوازم جانبی", category: "accessories", image: "/category/charger.png" },
];

export const promos = [
  {
    chip: "ساعت‌های هوشمند",
    title: "سبک زندگی هوشمند",
    subtitle: "مدل‌های جدید با امکانات پیشرفته",
    image: "/category/smart-watch.png",
    dark: true,
  },
  {
    chip: "هدفون و هندزفری",
    title: "صدای شفاف، تجربه بهتر",
    subtitle: "با بهترین برندها و کیفیت عالی",
    image: "/category/headphone.png",
    dark: false,
  },
];

export const brands = [
  { name: "Apple", icon: SiApple },
  // wide: wordmark glyphs that render thin in a square icon box
  { name: "Samsung", icon: SiSamsung, wide: true },
  { name: "Xiaomi", icon: SiXiaomi },
  { name: "Sony", icon: SiSony, wide: true },
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
