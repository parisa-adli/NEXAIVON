"use client";

import { useAddToCart, useDecrementFromCart } from "@/hooks/useCart";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiMinus, HiOutlineTrash, HiPlus } from "react-icons/hi2";

function CartItem({ cartItem }) {
  const queryClient = useQueryClient();

  const { isPending: isAdding, mutateAsync: addToCart } = useAddToCart();
  const { isPending: isDecrementing, mutateAsync: decrementFromCart } =
    useDecrementFromCart();

  const addToCartHandler = async () => {
    try {
      const { message } = await addToCart(cartItem._id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
    } catch (error) {
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  const decrementHandler = async () => {
    try {
      const { message } = await decrementFromCart(cartItem._id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
    } catch (error) {
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-y-2 md:flex-row md:justify-between ">
      <Link href={`/products/${cartItem.slug}`}>
        <span className="md:flex-1 font-bold">{cartItem.title}</span>
      </Link>
      <div className="grid grid-cols-1 gap-y-2 md:flex items-center justify-between md:gap-x-8">
        <div className="md:border-l-2 pl-4">
          <div>
            <span>قیمت: </span>
            <span
              className={`${
                cartItem.discount ? "line-through text-gray-500" : "font-bold"
              }`}
            >
              {toPersianNumbersWithComma(cartItem.price)}
            </span>
          </div>
          {!!cartItem.discount && (
            <div className="flex items-center gap-x-2 mt-2">
              <p className="font-bold">
                {toPersianNumbersWithComma(cartItem.offPrice)}
              </p>
              <div className="bg-rose-500 px-2 py-0.5 rounded-xl text-white text-sm">
                {toPersianNumbers(cartItem.discount)} %
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between md:gap-x-8">
          <span>تعداد: {toPersianNumbers(cartItem.quantity)}</span>
          <div className="flex gap-x-2">
            <button
              onClick={addToCartHandler}
              className="bg-primary-900 text-white rounded p-1"
            >
              <HiPlus className="w-4 h-4" />
            </button>
            <button onClick={decrementHandler} className="border rounded p-1">
              {cartItem.quantity > 1 ? (
                <HiMinus className="w-4 h-4" />
              ) : (
                <HiOutlineTrash className="w-6 h-6 text-rose-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CartItem;
