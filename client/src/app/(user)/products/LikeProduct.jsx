"use client";

import { likeProduct } from "@/services/productService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

function LikeProduct({ product }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const likeHandler = async () => {
    try {
      const { message } = await likeProduct(product._id);
      toast.success(message);
      router.refresh(pathname + "?" + searchParams.toString());
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <button
      type="button"
      onClick={likeHandler}
      aria-label={
        product.isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
      }
      aria-pressed={product.isLiked}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary-0/80"
    >
      {product.isLiked ? (
        <AiFillHeart className="w-5 h-5 text-red-500" />
      ) : (
        <AiOutlineHeart className="w-5 h-5 text-secondary-500" />
      )}
    </button>
  );
}
export default LikeProduct;
