"use client";

import Loading from "@/common/Loading";
import TextFieldDetail from "@/common/TextFieldDetail";
import { useGetCategoryById } from "@/hooks/useCategories";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { useParams } from "next/navigation";

const categoryFormData = [
  {
    id: 1,
    label: "عنوان",
    name: "title",
  },
  {
    id: 2,
    label: "عنوان انگلیسی",
    name: "englishTitle",
  },
  {
    id: 3,
    label: "توضیحات",
    name: "description",
  },
  {
    id: 4,
    label: "نوع",
    name: "type",
  },
];

function CategoryDetail() {
  const { id } = useParams();
  const { isLoading, data } = useGetCategoryById(id);
  const { category } = data || {};

  if (isLoading) return <Loading />;
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="font-bold text-lg mb-8 border-b pb-4">مشخصات دسته بندی</h1>
      {categoryFormData.map((item) => (
        <TextFieldDetail
          key={item.id}
          label={item.label}
          name={item.name}
          value={category[item.name] || ""}
        />
      ))}
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">تاریخ ایجاد</span>
        <input
          className="textField__input !max-w-sm col-span-2"
          value={toLocalDateStringShort(category.createdAt)}
          disabled
        />
      </div>
    </div>
  );
}
export default CategoryDetail;
