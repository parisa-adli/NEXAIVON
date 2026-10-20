"use client";

import Loading from "@/common/Loading";
import { useGetProductById } from "@/hooks/useProducts";
import { useParams } from "next/navigation";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";

function ProductPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetProductById(id);
  const { product } = data || {};
  console.log(product);
  if (isLoading) return <Loading />;
  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl ">{product.title}</h1>
      <p>{product.description}</p>
      <p>
        <span>قیمت محصول: </span>
        <span className={`${product.discount ? "line-through" : "font-bold"}`}>
          {toPersianNumbersWithComma(product.price)}
        </span>
      </p>
      {!!product.discount && (
        <div className="flex items-center gap-x-2">
          <p className="text-xl font-bold">
            قیمت با تخفیف: {toPersianNumbersWithComma(product.offPrice)}
          </p>
          <div
            className="
                    bg-rose-500 px-2 py-0.5 rounded-xl text-white text-sm"
          >
            {toPersianNumbers(product.discount)} %
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductPage;
