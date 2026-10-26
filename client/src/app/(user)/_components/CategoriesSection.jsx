import Image from "next/image";
import Link from "next/link";
import { getCachedHomeContent } from "@/services/homeContentCache";

export default async function CategoriesSection() {
  const { homeCategories } = await getCachedHomeContent();

  return (
    <section aria-label="دسته‌بندی‌ها">
      <h2 className="text-lg font-bold text-secondary-900 pb-4">
        دسته‌بندی محصولات
      </h2>
      {/* columns stay at least ~150px wide so the 120px images never overflow */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {homeCategories.map(({ label, category, image }, i) => (
          <li key={i}>
            <Link
              href={`/products?category=${category}`}
              className="flex h-full flex-col items-center justify-center gap-y-4 rounded-xl bg-secondary-100 px-3 py-6 text-sm font-medium text-secondary-900 text-center"
            >
              <Image
                src={image}
                alt=""
                width={120}
                height={120}
                className="w-[120px] h-[120px] shrink-0 object-contain"
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
