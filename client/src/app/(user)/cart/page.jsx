"use client";

import Loading from "@/common/Loading";
import { useGetUser } from "@/hooks/useAuth";
import Link from "next/link";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

function CartPage() {
  const { data, isLoading } = useGetUser();
  const { user, cart } = data || {};
  console.log("cart", cart);
  if (isLoading) return <Loading />;

  if (!user || !cart)
    return (
      <div className="container lg:max-w-screen-lg">
        <p className="font-bold mb-4">برای مشاهده سبد خرید لطفا لاگین کنید</p>
        <Link href="/auth" className="text-lg font-bold text-primary-900">
          رفتن به صفحه لاگین؟
        </Link>
      </div>
    );

  if (!user.cart.products || user.cart.products.length === 0)
    return (
      <div>
        <p className="font-bold mb-4">سبد خرید خالیه!</p>
        <Link href="/products" className="text-lg font-bold text-primary-900">
          رفتن به صفحه محصولات
        </Link>
      </div>
    );

  return (
    <div className="grid grid-cols-12 gap-4 px-4 ">
      <div className="col-span-12 lg:col-span-9 space-y-5">
        {cart &&
          cart.productDetail.map((item) => (
            <CartItem key={item._id} cartItem={item} />
          ))}
      </div>
      <div className="col-span-12 max-w-md lg:col-span-3">
        <CartSummary payDetail={cart.payDetail} />
      </div>
    </div>
  );
}
export default CartPage;
