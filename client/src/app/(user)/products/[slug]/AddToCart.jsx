"use client";

import Loading from "@/common/Loading";
import { useGetUser } from "@/hooks/useAuth";
import { useAddToCart, useDecrementFromCart } from "@/hooks/useCart";
import { toPersianNumbers } from "@/utils/toPersianNumber";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaArrowLeftLong } from "react-icons/fa6";
import {
  LuCheck,
  LuMinus,
  LuPlus,
  LuShoppingCart,
  LuTrash2,
} from "react-icons/lu";

function AddToCart({ product, compact = false }) {
  const queryClient = useQueryClient();

  const router = useRouter();
  const { isPending, mutateAsync } = useAddToCart();
  const { isPending: isDecrementing, mutateAsync: decrementFromCart } =
    useDecrementFromCart();
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
    await updateCart(mutateAsync);
  };

  const updateCart = async (mutate) => {
    try {
      const { message } = await mutate(product._id);
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

  const quantity =
    user?.cart?.products.find((p) => p.productId === product._id)?.quantity ||
    0;

  if (compact) {
    const iconClass =
      "w-9 h-9 flex items-center justify-center rounded-md bg-brand-tint text-brand";
    return isInCart(user, product) ? (
      <Link href="/cart" aria-label="ادامه سفارش" className={iconClass}>
        <LuCheck className="w-5 h-5" />
      </Link>
    ) : (
      <button
        type="button"
        aria-label="افزودن به سبد خرید"
        disabled={isPending}
        onClick={addToCartHandler}
        className={`${iconClass} disabled:opacity-50`}
      >
        <LuShoppingCart className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div>
      {isInCart(user, product) ? (
        <div className="flex items-center gap-x-3">
          <Link
            href="/cart"
            className="btn flex-1 px-4 py-3 flex items-center justify-center rounded-xl bg-brand-tint text-brand border border-brand"
          >
            <div className="flex items-center gap-x-3">
              <span>ادامه سفارش</span>
              <span>
                <FaArrowLeftLong />
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-x-3 rounded-xl border border-secondary-200 px-3 py-2">
            <button
              type="button"
              aria-label="افزایش تعداد"
              disabled={isPending || isDecrementing}
              onClick={() => updateCart(mutateAsync)}
              className="p-1 text-secondary-900 disabled:opacity-50"
            >
              <LuPlus className="w-4 h-4" />
            </button>
            <span aria-live="polite" className="w-6 text-center font-bold">
              {toPersianNumbers(quantity)}
            </span>
            <button
              type="button"
              aria-label={quantity > 1 ? "کاهش تعداد" : "حذف از سبد خرید"}
              disabled={isPending || isDecrementing}
              onClick={() => updateCart(decrementFromCart)}
              className="p-1 text-secondary-900 disabled:opacity-50"
            >
              {quantity > 1 ? (
                <LuMinus className="w-4 h-4" />
              ) : (
                <LuTrash2 className="w-4 h-4 text-rose-500" />
              )}
            </button>
          </div>
        </div>
      ) : isPending ? (
        <div className="px-10">
          <Loading justifyContent="flex-start" width="45" height="15" />
        </div>
      ) : (
        <button
          onClick={addToCartHandler}
          className="btn w-full px-4 py-3 rounded-xl bg-brand text-white hover:bg-brand/90 flex items-center justify-center gap-x-2"
        >
          <LuShoppingCart aria-hidden className="w-5 h-5" />
          افزودن به سبد خرید
        </button>
      )}
    </div>
  );
}
export default AddToCart;
