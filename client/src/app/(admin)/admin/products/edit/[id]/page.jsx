"use client";

import Loading from "@/common/Loading";
import ProductForm from "@/components/ProductForm";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetProductById, useUpdateProduct } from "@/hooks/useProducts";
import { includeObj } from "@/utils/objectUtils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const includesProductKey = [
  "title",
  "description",
  "slug",
  "brand",
  "price",
  "discount",
  "offPrice",
  "countInStock",
  "imageLink",
];

function EditProduct() {
  const { id } = useParams();
  const { data, isLoading: isLoadingProduct } = useGetProductById(id);
  const { product } = data || {};
  const router = useRouter();
  const { data: categoryData } = useGetCategories();
  const { categories } = categoryData || {};
  const [formData, setFormData] = useState({});
  const [tags, setTags] = useState(product?.tags || []);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const { isLoading, mutateAsync } = useUpdateProduct();

  const handChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync({
        productId: product._id,
        data: {
          ...formData,
          tags,
          category: selectedCategory._id,
        },
      });
      toast.success(message);
      router.push("/admin/products");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (product) {
      setFormData(includeObj(product, includesProductKey));
      setTags(product.tags);
      setSelectedCategory(product.category);
    }
  }, [data]);

  if (isLoadingProduct) return <Loading />;
  return (
    <div className="mb-10">
      <h1 className="mb-4 font-bold text-xl">ویرایش محصول</h1>
      <ProductForm
        onSubmit={handleSubmit}
        categories={categories}
        selectedCategory={product.category}
        setSelectedCategory={setSelectedCategory}
        tags={tags}
        setTags={setTags}
        isLoading={isLoading}
        productData={formData}
        productDataOnChange={handChange}
      />
    </div>
  );
}
export default EditProduct;
