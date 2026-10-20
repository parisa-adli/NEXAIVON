"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { PiSortAscendingBold } from "react-icons/pi";

const sortOptions = [
  {
    id: 1,
    value: "latest",
    label: "جدید ترین",
  },
  {
    id: 2,
    value: "earliest",
    label: "قدیمی ترین",
  },
  {
    id: 3,
    value: "popular",
    label: "محبوب ترین",
  },
];

function SortProducts() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sort, setSort] = useState(searchParams.get("sort") || "");

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const sortHandler = (value) => {
    setSort(value);
    router.push(pathname + "?" + createQueryString("sort", value));
  };

  return (
    <div className="border-b mb-8">
      <ul className="flex items-center gap-x-2 whitespace-nowrap overflow-x-auto">
        <div className="font-bold flex gap-x-1">
          <PiSortAscendingBold className="w-5 h-5" />
          <span>مرتب سازی:</span>
        </div>
        {sortOptions.map((item) => (
          <li
            key={item.id}
            className={`cursor-pointer p-2 ${
              sort === item.value
                ? "font-bold text-primary-900"
                : "text-secondary-400"
            }`}
            onClick={() => sortHandler(item.value)}
          >
            {item.label}
          </li>
        ))}
          </ul>
          
    </div>
  );
}

export default SortProducts;
