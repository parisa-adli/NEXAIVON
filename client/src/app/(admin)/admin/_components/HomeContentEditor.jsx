"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Loading from "@/common/Loading";
import { brandIcons, lineIcons } from "@/constants/homeIcons";
import { getHomeContent, updateHomeContent } from "@/services/homeService";
import ListEditor from "./ListEditor";

const lineIconNames = Object.keys(lineIcons);
const brandIconNames = Object.keys(brandIcons);
const linkFields = [
  { name: "label", label: "عنوان" },
  { name: "href", label: "لینک", ltr: true },
];

const SECTIONS = [
  {
    key: "heroSlides",
    title: "بنرهای اصلی (اسلایدر)",
    fields: [
      { name: "image", label: "تصویر بنر", type: "image", removable: true },
      { name: "eyebrow", label: "متن بالای عنوان" },
      { name: "title", label: "عنوان" },
      { name: "subtitle", label: "توضیح" },
      {
        name: "icon",
        label: "آیکون (وقتی تصویر ندارد)",
        type: "icon",
        options: lineIconNames,
      },
    ],
  },
  {
    key: "promos",
    title: "بنرهای کوچک",
    fields: [
      { name: "image", label: "تصویر بنر", type: "image", removable: true },
      { name: "chip", label: "برچسب" },
      { name: "title", label: "عنوان" },
      { name: "subtitle", label: "توضیح" },
      { name: "dark", label: "زمینه تیره", type: "checkbox" },
    ],
  },
  {
    key: "homeCategories",
    title: "دسته‌بندی‌های صفحه اصلی",
    fields: [
      { name: "image", label: "تصویر", type: "image" },
      { name: "label", label: "عنوان" },
      { name: "category", label: "نام انگلیسی دسته‌بندی", ltr: true },
    ],
  },
  {
    key: "brands",
    title: "برندهای محبوب",
    fields: [
      { name: "name", label: "نام برند" },
      {
        name: "icon",
        label: "لوگو (بدون لوگو، نام برند نمایش داده می‌شود)",
        type: "icon",
        options: brandIconNames,
      },
      { name: "wide", label: "لوگوی عریض", type: "checkbox" },
    ],
  },
  {
    key: "services",
    title: "خدمات فروشگاه",
    fields: [
      { name: "title", label: "عنوان" },
      { name: "subtitle", label: "توضیح" },
      { name: "icon", label: "آیکون", type: "icon", options: lineIconNames },
    ],
  },
  { key: "navLinks", title: "منوی بالای سایت", fields: linkFields },
  { key: "searchTags", title: "جستجوهای پیشنهادی", fields: null },
  {
    key: "footerLinks",
    title: "لینک‌های خدمات مشتریان (فوتر)",
    fields: linkFields,
  },
];

const CONTACT_FIELDS = [
  { name: "phone", label: "تلفن" },
  { name: "email", label: "ایمیل", ltr: true },
  { name: "address", label: "آدرس" },
];

function HomeContentEditor() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: getHomeContent,
  });
  const [content, setContent] = useState(null);
  const { isPending, mutateAsync } = useMutation({
    mutationFn: updateHomeContent,
  });

  useEffect(() => {
    if (data) setContent(data);
  }, [data]);

  const setSection = (key, value) => setContent({ ...content, [key]: value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync(content);
      toast.success(message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  if (isLoading || !content) return <Loading />;
  return (
    <form className="space-y-4" onSubmit={submitHandler}>
      <h2 className="font-bold">محتوای صفحه اصلی فروشگاه</h2>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-secondary-500">
          تغییرات حداکثر یک دقیقه پس از ذخیره در سایت نمایش داده می‌شود.
        </p>
        <div className="w-52 shrink-0">
          {isPending ? (
            <Loading width="45" height="15" />
          ) : (
            <Button>ذخیره تغییرات صفحه اصلی</Button>
          )}
        </div>
      </div>
      {SECTIONS.map(({ key, title, fields }) => (
        <ListEditor
          key={key}
          id={key}
          title={title}
          fields={fields}
          items={content[key]}
          onChange={(value) => setSection(key, value)}
        />
      ))}
      <details className="border rounded-xl p-4">
        <summary className="font-bold cursor-pointer">
          اطلاعات تماس (فوتر)
        </summary>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          {CONTACT_FIELDS.map(({ name, label, ltr }) => (
            <div key={name}>
              <label htmlFor={`contact-${name}`} className="block mb-2">
                {label}
              </label>
              <input
                id={`contact-${name}`}
                dir={ltr ? "ltr" : undefined}
                className="textField__input"
                value={content.contact[name]}
                onChange={(e) =>
                  setSection("contact", {
                    ...content.contact,
                    [name]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
      </details>
    </form>
  );
}
export default HomeContentEditor;
