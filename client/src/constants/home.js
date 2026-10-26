// Default homepage content. Once the main admin saves the homepage from the
// admin dashboard, each saved section replaces its default here (GET /home).
// Icons are names from constants/homeIcons.js, so the content can be stored.

// category values are Category.englishTitle, the key the products filter reads
export const navLinks = [
  { label: "صفحه اصلی", href: "/" },
  { label: "محصولات", href: "/products" },
  { label: "موبایل", href: "/products?category=smartphones" },
  { label: "هدفون و هندزفری", href: "/products?category=headphones" },
  { label: "ساعت هوشمند", href: "/products?category=smartwatches" },
  { label: "گجت‌های دیجیتال", href: "/products?category=gadgets" },
  { label: "لوازم جانبی", href: "/products?category=accessories" },
];

export const searchTags = [
  "آیفون",
  "سامسونگ",
  "ایرپاد",
  "اپل واچ",
  "هندزفری بلوتوث",
  "پاوربانک",
  "شارژر",
];

export const heroSlides = [
  {
    eyebrow: "تکنولوژی، همراه زندگی شما",
    title: "جدیدترین گوشی‌های هوشمند",
    subtitle: "با بهترین برندها، جدیدترین مدل‌ها و گارانتی معتبر",
    icon: "LuSmartphone",
    image: "",
  },
  {
    eyebrow: "همیشه در جریان",
    title: "ساعت‌های هوشمند",
    subtitle: "سلامتی و اعلان‌ها، همیشه روی مچ دست شما",
    icon: "LuWatch",
    image: "",
  },
  {
    eyebrow: "صدای خالص",
    title: "هدفون و هندزفری بی‌سیم",
    subtitle: "حذف نویز و کیفیت صدای عالی از برندهای معتبر",
    icon: "LuHeadphones",
    image: "",
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
  { name: "Apple", icon: "SiApple", wide: false },
  // wide: wordmark glyphs that render thin in a square icon box
  { name: "Samsung", icon: "SiSamsung", wide: true },
  { name: "Xiaomi", icon: "SiXiaomi", wide: false },
  { name: "Sony", icon: "SiSony", wide: true },
  { name: "JBL", icon: "SiJbl", wide: false },
  { name: "Huawei", icon: "SiHuawei", wide: false },
  // no Anker glyph in react-icons, rendered as a wordmark
  { name: "ANKER", icon: "", wide: false },
];

export const services = [
  { title: "ارسال سریع", subtitle: "به سراسر کشور", icon: "LuTruck" },
  { title: "ضمانت اصالت کالا", subtitle: "با گارانتی معتبر", icon: "LuShieldCheck" },
  { title: "پرداخت امن", subtitle: "با درگاه‌های مطمئن", icon: "LuCreditCard" },
  { title: "پشتیبانی ۲۴/۷", subtitle: "در تمام مراحل خرید", icon: "LuHeadset" },
];

// the "خدمات مشتریان" footer column; the quick-access column repeats navLinks
export const footerLinks = [
  { label: "پیگیری سفارش", href: "/profile" },
  { label: "راهنمای خرید", href: "#" },
  { label: "سوالات متداول", href: "#" },
  { label: "شرایط و ضوابط", href: "#" },
  { label: "حریم خصوصی", href: "#" },
];

export const contact = {
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "info@nexaivon.com",
  address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
};

export const homeContentDefaults = {
  navLinks,
  searchTags,
  heroSlides,
  homeCategories,
  promos,
  brands,
  services,
  footerLinks,
  contact,
};
