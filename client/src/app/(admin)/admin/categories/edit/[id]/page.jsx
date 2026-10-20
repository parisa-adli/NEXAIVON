"use client";

import Loading from "@/common/Loading";
import CategoryForm, { categoryTypes } from "@/components/CategoryForm";
import { useGetCategoryById, useUpdateCategory } from "@/hooks/useCategories";
import { includeObj } from "@/utils/objectUtils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const includesCategoryKey = ["title", "englishTitle", "description"];

function UpdateCategoryPage() {
  const { id } = useParams();
  const { data, isLoading: isLoadingCategory } = useGetCategoryById(id);
  const { category } = data || {};
  const [formData, setFormData] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const { isLoading, mutateAsync } = useUpdateCategory();
  const router = useRouter();

  useEffect(() => {
    if (category) {
      setFormData(includeObj(category, includesCategoryKey));
      setSelectedType(categoryTypes.find((c) => c.value === category.type));
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync({
        id: category._id,
        data: {
          ...formData,
          type: selectedType.value,
        },
      });
      toast.success(message);
      router.push("/admin/categories");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  if (isLoadingCategory) return <Loading />;

  return (
    <div className="mb-10">
      <h1 className="mb-4 font-bold text-xl">ویرایش دسته بندی</h1>
      <CategoryForm
        category={formData}
        onSubmit={handleSubmit}
        handleChange={handleChange}
        selectedType={categoryTypes.find((c) => c.value === category.type)}
        setSelectedType={setSelectedType}
        isLoading={isLoading}
      />
    </div>
  );
}
export default UpdateCategoryPage;
