// Deterministic seed fixtures (sub-PRD 11 §2). Fixed _ids and timestamps, so
// every run produces identical data and tests can refer to documents by id.
const { Types } = require("mongoose");

// Ids are readable when printed: 1xx categories, 2xx products, 3xx coupons,
// 4xx users.
const id = (n) => new Types.ObjectId(n.padStart(24, "0"));
// Every fixture is dated from this instant, one minute apart in list order,
// so "newest" sorting is stable across runs.
const BASE_DATE = Date.UTC(2026, 0, 1);
const dated = (docs) =>
  docs.map((doc, i) => {
    const date = new Date(BASE_DATE + i * 60_000);
    return { ...doc, createdAt: date, updatedAt: date };
  });

const categoryIds = {
  smartphones: id("101"),
  headphones: id("102"),
  smartwatches: id("103"),
  accessories: id("104"),
  reviews: id("105"),
};

const categories = dated([
  {
    _id: categoryIds.smartphones,
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "گوشی های هوشمند",
  },
  {
    _id: categoryIds.headphones,
    title: "هدفون",
    englishTitle: "headphones",
    description: "هدفون و هندزفری",
  },
  {
    _id: categoryIds.smartwatches,
    title: "ساعت هوشمند",
    englishTitle: "smartwatches",
    description: "ساعت و مچ بند هوشمند",
  },
  {
    _id: categoryIds.accessories,
    title: "لوازم جانبی",
    englishTitle: "accessories",
    description: "شارژر، کابل و قاب",
  },
  // Not a product category: proves the storefront's ?type=product filter.
  {
    _id: categoryIds.reviews,
    title: "دیدگاه ها",
    englishTitle: "reviews",
    description: "دسته بندی دیدگاه ها",
    type: "comment",
  },
]);

const LONG_DESCRIPTION = [
  "گلکسی A55 با بدنه فلزی و پشت شیشه ای، یکی از خوش ساخت ترین گوشی های میان رده سامسونگ است.",
  "",
  "نمایشگر ۶.۶ اینچی Super AMOLED با نرخ نوسازی ۱۲۰ هرتز تصویری روشن و روان در نور مستقیم آفتاب ارائه می کند.",
  "تراشه Exynos 1480 برای کارهای روزمره، شبکه های اجتماعی و بازی های سبک کاملا کافی است.",
  "",
  "دوربین اصلی ۵۰ مگاپیکسلی با لرزشگیر اپتیکال، عکس های شب بهتری نسبت به نسل قبل ثبت می کند.",
  "باتری ۵۰۰۰ میلی آمپر ساعتی با شارژ سریع ۲۵ واتی به راحتی یک روز کامل کار می کند.",
  "",
  "سامسونگ برای این گوشی چهار سال به روزرسانی سیستم عامل و پنج سال وصله امنیتی وعده داده است.",
].join("\n");

// `image` names a file in scripts/seed/images, copied to the uploads folder.
// Fixtures set only price and discount: the seed computes offPrice the way
// the server does (Q16). Stock covers 0, 1–3 (low stock) and plenty.
const products = dated([
  // smartphones
  {
    _id: id("201"),
    title: "گوشی سامسونگ Galaxy A55",
    slug: "galaxy-a55",
    description: LONG_DESCRIPTION,
    category: categoryIds.smartphones,
    image: "smartphones.png",
    price: 18500000,
    discount: 10,
    brand: "Samsung",
    tags: ["samsung", "android"],
    countInStock: 25,
  },
  {
    _id: id("202"),
    title: "Apple iPhone 15",
    slug: "iphone-15",
    description: "آیفون ۱۵ با Dynamic Island و درگاه USB-C.",
    category: categoryIds.smartphones,
    image: "smartphones.png",
    price: 62000000,
    discount: 0,
    brand: "Apple",
    tags: ["apple", "ios"],
    countInStock: 2,
  },
  {
    _id: id("203"),
    title: "گوشی شیائومی Redmi Note 13",
    slug: "redmi-note-13",
    description: "گوشی اقتصادی با نمایشگر AMOLED و دوربین ۱۰۸ مگاپیکسلی.",
    category: categoryIds.smartphones,
    image: "smartphones.png",
    price: 11900000,
    discount: 15,
    brand: "Xiaomi",
    tags: ["xiaomi", "android"],
    countInStock: 0,
  },
  {
    _id: id("204"),
    title: "Google Pixel 8a",
    slug: "pixel-8a",
    description: "پیکسل 8a با تراشه Tensor G3 و هفت سال به روزرسانی.",
    category: categoryIds.smartphones,
    image: "smartphones.png",
    price: 29000000,
    discount: 0,
    brand: "Google",
    tags: ["google", "android"],
    countInStock: 12,
  },
  // headphones
  {
    _id: id("205"),
    title: "هندزفری سامسونگ Galaxy Buds FE",
    slug: "galaxy-buds-fe",
    description: "هندزفری بی سیم با حذف نویز فعال و صدای پرقدرت.",
    category: categoryIds.headphones,
    image: "headphones.png",
    price: 4900000,
    discount: 20,
    brand: "Samsung",
    tags: ["samsung", "wireless"],
    countInStock: 40,
  },
  {
    _id: id("206"),
    title: "Apple AirPods Pro 2",
    slug: "airpods-pro-2",
    description: "ایرپادز پرو نسل دوم با حذف نویز تطبیقی و کیس USB-C.",
    category: categoryIds.headphones,
    image: "headphones.png",
    price: 14500000,
    discount: 0,
    brand: "Apple",
    tags: ["apple", "wireless"],
    countInStock: 3,
  },
  {
    _id: id("207"),
    title: "هدفون سونی WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "هدفون روگوشی با یکی از بهترین سیستم های حذف نویز بازار.",
    category: categoryIds.headphones,
    image: "headphones.png",
    price: 21000000,
    discount: 12,
    brand: "Sony",
    tags: ["sony", "wireless"],
    countInStock: 0,
  },
  {
    _id: id("208"),
    title: "هندزفری QCY T13",
    slug: "qcy-t13",
    description: "هندزفری بی سیم اقتصادی با باتری طولانی.",
    category: categoryIds.headphones,
    image: "headphones.png",
    price: 890000,
    discount: 0,
    brand: "QCY",
    tags: ["qcy", "wireless"],
    countInStock: 60,
  },
  // smartwatches
  {
    _id: id("209"),
    title: "ساعت هوشمند سامسونگ Galaxy Watch6",
    slug: "galaxy-watch6",
    description: "ساعت هوشمند با سنسور سلامت BioActive و صفحه گرد.",
    category: categoryIds.smartwatches,
    image: "smartwatches.png",
    price: 11500000,
    discount: 8,
    brand: "Samsung",
    tags: ["samsung", "wear-os"],
    countInStock: 1,
  },
  {
    _id: id("210"),
    title: "Apple Watch SE",
    slug: "apple-watch-se",
    description: "اپل واچ اقتصادی با تشخیص سقوط و تصادف.",
    category: categoryIds.smartwatches,
    image: "smartwatches.png",
    price: 19800000,
    discount: 0,
    brand: "Apple",
    tags: ["apple", "watchos"],
    countInStock: 15,
  },
  {
    _id: id("211"),
    title: "مچ بند هوشمند شیائومی Smart Band 8",
    slug: "xiaomi-smart-band-8",
    description: "مچ بند سبک با نمایشگر AMOLED و دو هفته شارژدهی.",
    category: categoryIds.smartwatches,
    image: "smartwatches.png",
    price: 1650000,
    discount: 5,
    brand: "Xiaomi",
    tags: ["xiaomi", "fitness"],
    countInStock: 80,
  },
  {
    _id: id("212"),
    title: "ساعت هوشمند امیزفیت GTS 4 Mini",
    slug: "amazfit-gts-4-mini",
    description: "ساعت هوشمند جمع و جور با GPS داخلی.",
    category: categoryIds.smartwatches,
    image: "smartwatches.png",
    price: 4200000,
    discount: 0,
    brand: "Amazfit",
    tags: ["amazfit", "fitness"],
    countInStock: 0,
  },
  // accessories
  {
    _id: id("213"),
    title: "شارژر انکر Nano 20W",
    slug: "anker-nano-20w",
    description: "شارژر دیواری کوچک با پشتیبانی از Power Delivery.",
    category: categoryIds.accessories,
    image: "accessories.png",
    price: 1150000,
    discount: 10,
    brand: "Anker",
    tags: ["anker", "charger"],
    countInStock: 100,
  },
  {
    _id: id("214"),
    title: "کابل باسئوس USB-C به USB-C",
    slug: "baseus-usb-c-cable",
    description: "کابل ۱ متری با توان ۶۰ وات.",
    category: categoryIds.accessories,
    image: "accessories.png",
    price: 320000,
    discount: 0,
    brand: "Baseus",
    tags: ["baseus", "cable"],
    countInStock: 3,
  },
  {
    _id: id("215"),
    title: "قاب اسپیگن Galaxy A55",
    slug: "spigen-galaxy-a55-case",
    description: "قاب محافظ با لبه های برجسته برای دوربین و نمایشگر.",
    category: categoryIds.accessories,
    image: "accessories.png",
    price: 650000,
    discount: 25,
    brand: "Spigen",
    tags: ["spigen", "case"],
    countInStock: 30,
  },
  {
    _id: id("216"),
    title: "پاوربانک شیائومی 20000mAh",
    slug: "xiaomi-powerbank-20000",
    description: "پاوربانک ۲۰۰۰۰ میلی آمپر ساعتی با شارژ سریع ۲۲.۵ واتی.",
    category: categoryIds.accessories,
    image: "accessories.png",
    price: 2100000,
    discount: 0,
    brand: "Xiaomi",
    tags: ["xiaomi", "powerbank"],
    countInStock: 8,
  },
]);

// Sign in with these phone numbers: outside production the OTP is written to
// the server log. Telegram users (P1) wait for the S-16 User fields.
const users = dated([
  {
    _id: id("401"),
    name: "مدیر فروشگاه",
    email: "admin@example.com",
    phoneNumber: "09120000001",
    isVerifiedPhoneNumber: true,
    isActive: true,
    role: "ADMIN",
    isMainAdmin: true,
  },
  {
    _id: id("402"),
    name: "کاربر نمونه",
    email: "user@example.com",
    phoneNumber: "09120000002",
    isVerifiedPhoneNumber: true,
    isActive: true,
    role: "USER",
  },
]);

// Coupons only change products that have no discount of their own, so the
// valid ones target non-discounted products. One coupon per rejection reason.
const FAR_FUTURE = new Date(Date.UTC(2099, 11, 31));
const PAST = new Date(Date.UTC(2025, 0, 1));
const coupons = dated([
  {
    _id: id("301"),
    code: "PERCENT10",
    type: "percent",
    amount: 10,
    expireDate: FAR_FUTURE,
    usageLimit: 1000,
    productIds: [id("202"), id("204"), id("206")],
  },
  {
    _id: id("302"),
    code: "FIXED500",
    type: "fixedProduct",
    amount: 500000,
    expireDate: FAR_FUTURE,
    usageLimit: 1000,
    productIds: [id("210"), id("216")],
  },
  {
    _id: id("303"),
    code: "EXPIRED15",
    type: "percent",
    amount: 15,
    expireDate: PAST,
    usageLimit: 1000,
    productIds: [id("202")],
  },
  {
    _id: id("304"),
    code: "USEDUP20",
    type: "percent",
    amount: 20,
    expireDate: FAR_FUTURE,
    usageCount: 50,
    usageLimit: 50,
    productIds: [id("202")],
  },
  {
    _id: id("305"),
    code: "INACTIVE25",
    type: "percent",
    amount: 25,
    expireDate: FAR_FUTURE,
    isActive: false,
    usageLimit: 1000,
    productIds: [id("202")],
  },
  // Valid, but only for smartwatches: rejected for a cart without one.
  {
    _id: id("306"),
    code: "WATCHES10",
    type: "percent",
    amount: 10,
    expireDate: FAR_FUTURE,
    usageLimit: 1000,
    productIds: [id("210"), id("212")],
  },
]);

module.exports = { categories, products, users, coupons };
