"use client";

import Loading from "@/common/Loading";
import TextFieldDetail from "@/common/TextFieldDetail";
import { useGetOneCoupon } from "@/hooks/useCoupons";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { useParams } from "next/navigation";

const couponFormData = [
  {
    id: 1,
    label: "کد",
    name: "code",
  },
  {
    id: 2,
    label: "مقدار",
    name: "amount",
  },
  {
    id: 3,
    label: "ظرفیت",
    name: "usageLimit",
  },
  {
    id: 4,
    label: "نوع کد تخفیف",
    name: "type",
  },
  {
    id: 5,
    label: "تعداد مصرف شده",
    name: "usageCount",
  },
];

function CouponDetail() {
  const { id } = useParams();
  const { isLoading, data } = useGetOneCoupon(id);
  const { coupon } = data || {};

  if (isLoading) return <Loading />;
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="font-bold text-lg mb-8 border-b pb-4">مشخصات دسته بندی</h1>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">وضعیت کد تخفیف</span>
        <div className="textField__input !max-w-sm col-span-2">
          {coupon.isActive ? (
            <span className="badge badge--success">فعال</span>
          ) : (
            <span className="badge badge--error">غیر فعال</span>
          )}
        </div>
      </div>
      {couponFormData.map((item) => (
        <TextFieldDetail
          key={item.id}
          label={item.label}
          name={item.name}
          value={coupon[item.name] || ""}
        />
      ))}
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">تاریخ انقضا</span>
        <input
          className="textField__input !max-w-sm col-span-2"
          value={toLocalDateStringShort(coupon.expireDate)}
          disabled
        />
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">شامل محصولات</span>
        <div className="textField__input !max-w-sm col-span-2 flex flex-col gap-y-2 items-start">
          {coupon.productIds?.map((product, index) => (
            <span className="badge badge--secondary" key={index}>
              {product.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export default CouponDetail;
