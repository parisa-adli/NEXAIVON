"use client";

import { usePathname } from "next/navigation";
import BreadCrumbs from "./BreadCrumbs";

const labels = {
  admin: "داشبورد",
  profile: "داشبورد",
  users: "کاربران",
  products: "محصولات",
  categories: "دسته بندی",
  coupons: "کد تخفیف",
  payments: "سفارشات",
  add: "افزودن",
  me: "اطلاعات کاربری",
};

export default function PanelBreadCrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  if (segments.length < 2) return null; // panel dashboard itself

  const breadcrumbs = segments.flatMap((segment, index) => {
    if (segment === "edit") return []; // no page at .../edit
    const label =
      labels[segment] ?? (segments[index - 1] === "edit" ? "ویرایش" : "جزئیات");
    return [{ label, href: "/" + segments.slice(0, index + 1).join("/") }];
  });
  breadcrumbs.at(-1).active = true;

  return <BreadCrumbs breadcrumbs={breadcrumbs} />;
}
