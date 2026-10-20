"use client";

import Loading from "@/common/Loading";
import { useGetUser } from "@/hooks/useAuth";
import { useAddToCart } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaArrowLeftLong } from "react-icons/fa6";

function AddToCart({ product }) {
  const queryClient = useQueryClient();

  const router = useRouter();
  const { isPending, mutateAsync } = useAddToCart();
  const { data } = useGetUser();
  const { user } = data || {};

  const addToCartHandler = async () => {
    if (!user) {
      toast("لطفا ابتدا لاگین کنید", {
        icon: "⚠",
      });
      router.push("/auth");
      return;
    }
    try {
      const { message } = await mutateAsync(product._id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
    } catch (error) {
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  const isInCart = (user, product) => {
    if (!user) return false;
    return user.cart?.products.some((p) => p.productId === product._id);
  };

  return (
    <div>
      {isInCart(user, product) ? (
        <Link
          href="/cart"
          className="flex items-center justify-center bg-secondary-50 text-primary-700 font-bold btn btn--primary border border-primary-900 w-full"
        >
          <div className="flex items-center gap-x-3">
            <span>ادامه سفارش</span>
            <span>
              <FaArrowLeftLong />
            </span>
          </div>
        </Link>
      ) : isPending ? (
        <div className="px-10">
          <Loading justifyContent="flex-start" width="45" height="15" />
        </div>
      ) : (
        <button onClick={addToCartHandler} className="btn btn--primary w-full">
          اضافه کردن به سبد خرید
        </button>
      )}
    </div>
  );
}
export default AddToCart;
