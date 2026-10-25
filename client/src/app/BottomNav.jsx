"use client";
import { useGetUser } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuHouse, LuLayoutGrid, LuShoppingCart, LuUser } from "react-icons/lu";
import { toPersianNumbers } from "@/utils/toPersianNumber";

// RTL: first item sits on the right, matching docs/design/mobile-navbottom.png
const items = [
  { label: "سبد خرید", href: "/cart", icon: LuShoppingCart },
  { label: "دسته‌بندی‌ها", href: "/categories", icon: LuLayoutGrid },
  { label: "خانه", href: "/", icon: LuHouse },
  { label: "پروفایل", href: "/profile", icon: LuUser },
];

function BottomNav() {
  const { data } = useGetUser();
  const cartCount = data?.cart?.payDetail.productIds.length || 0;
  const pathname = usePathname();

  return (
    <nav
      aria-label="منوی پایین"
      className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-secondary-0 rounded-t-3xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-y-1 py-3 text-xs ${
                  isActive ? "text-brand font-bold" : "text-secondary-500"
                }`}
              >
                <span className="relative">
                  <Icon className="w-6 h-6" />
                  {href === "/cart" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-brand text-white text-xs">
                      {toPersianNumbers(cartCount)}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
export default BottomNav;
