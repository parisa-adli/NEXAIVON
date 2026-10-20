"use client";

import { useGetProducts } from "@/hooks/useProducts";
import { useState } from "react";

import { useAddNewCoupon } from "@/hooks/useCoupons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CouponForm from "@/components/CouponForm";

function AddCouponPage() {
  const { data } = useGetProducts();
  const { products } = data || {};
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    usageLimit: "",
  });
  const [type, setType] = useState("percent");
  const [productIds, setProductIds] = useState([]);
  const [expireDate, setExpireDate] = useState(new Date());
  const { isLoading, mutateAsync } = useAddNewCoupon();
  const router = useRouter();

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync({
        ...formData,
        type,
        expireDate: new Date(expireDate).toISOString(),
        productIds: productIds.map((p) => p._id),
      });
      toast.success(message);
      router.push("/admin/coupons");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="mb-10">
      <h1 className="mb-8 font-bold text-xl">اضافه کردن کد تخفیف</h1>
      <CouponForm
        formData={formData}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
        type={type}
        setType={setType}
        options={products}
        onChangeSelect={setProductIds}
        expireDate={expireDate}
        setExpireDate={setExpireDate}
        isLoading={isLoading}
      />
    </div>
  );
}
export default AddCouponPage;
