"use client";

import { useGetUser } from "@/hooks/useAuth";
import { likeProduct } from "@/services/productService";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

function LikeProduct({ product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useGetUser();
  const { user } = data || {};
  // static pages are built without cookies, so trust the logged-in user over product.isLiked
  const isLiked = user
    ? user.likedProducts?.includes(product._id)
    : product.isLiked;

  const likeHandler = async () => {
    try {
      const { message } = await likeProduct(product._id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
      router.refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <button
      type="button"
      onClick={likeHandler}
      aria-label={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      aria-pressed={!!isLiked}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary-0/80"
    >
      {isLiked ? (
        <AiFillHeart className="w-5 h-5 text-red-500" />
      ) : (
        <AiOutlineHeart className="w-5 h-5 text-secondary-500" />
      )}
    </button>
  );
}
export default LikeProduct;
