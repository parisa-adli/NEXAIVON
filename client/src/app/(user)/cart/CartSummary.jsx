import Button from "@/common/Button";
import Loading from "@/common/Loading";
import TextField from "@/common/TextField";
import { useAddCouponToCart, useGetCoupons } from "@/hooks/useCoupons";
import { deleteCouponToCart } from "@/services/couponServices";
import { createPayment } from "@/services/paymentService";
import { toPersianNumbersWithComma } from "@/utils/toPersianNumber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

function CartSummary({ payDetail }) {
  const queryClient = useQueryClient();
  const { totalOffAmount, totalPrice, totalGrossPrice } = payDetail;
  const { isPending, mutateAsync } = useMutation({ mutationFn: createPayment });
  const { data } = useGetCoupons();
  const { coupons } = data || {};
  const [couponCode, setCouponCode] = useState("");
  const { isPending: isAddingCoupon, mutateAsync: addCouponToCart } =
    useAddCouponToCart();

  const createPaymentHandler = async () => {
    try {
      const { message } = await mutateAsync();
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
    } catch (error) {
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  const checkCouponHandle = async (e) => {
    e.preventDefault();
    setCouponCode(e.target.value);

    // console.log({ couponCode });
    // console.log(coupons.find((c) => c.code === couponCode));
    // coupons.find((c) => c._id === couponCode);
    try {
      if (couponCode === "") {
        deleteCouponToCart({ couponCode });
        queryClient.invalidateQueries({ queryKey: ["get-user"] });
      }

      if (coupons.find((c) => c.code === couponCode)) {
        const data = await addCouponToCart({ couponCode });
        queryClient.invalidateQueries({ queryKey: ["get-user"] });
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    // isolate: keep the z-10 layers below inside this card, under the sticky header
    <div className="isolate">
      {/* printer body with the paper slot along its bottom edge */}
      <div className="relative z-10 rounded-2xl bg-promo-dark px-4 pt-3 pb-5 shadow-lg ring-1 ring-inset ring-white/10">
        <p className="flex items-center gap-x-2 text-sm font-bold text-brand-tint">
          <span className="w-2 h-2 rounded-full bg-badge-best" />
          اطلاعات پرداخت
        </p>
        <div className="absolute inset-x-4 bottom-2 h-1.5 rounded-full bg-black/60 shadow-inner" />
      </div>
      <div className="relative -mt-2 mx-3 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-black/30 to-transparent" />
        <div
          className="motion-safe:animate-receipt-feed bg-secondary-100 text-secondary-700 px-4 pt-6 pb-8 space-y-4 shadow-md"
          style={{ clipPath: RECEIPT_EDGE }}
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>جمع کل</span>
              <span>{toPersianNumbersWithComma(totalGrossPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-500">کد تخفیف</span>
              <div className="flex flex-row-reverse gap-x-2 relative [&_input]:border-secondary-300">
                <TextField
                  name="couponCode"
                  dir="ltr"
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="!w-[120px] "
                />
                <button
                  onClick={checkCouponHandle}
                  type="button"
                  className="absolute left-2 top-[18px] text-sm bg-primary-600 border border-primary-900 text-white px-2 py-1 rounded-xl"
                >
                  تایید
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-secondary-300 pb-4">
              <span>تخفیف</span>
              <span>{toPersianNumbersWithComma(totalOffAmount)} -</span>
            </div>
            <div className="flex items-center justify-between font-bold text-base text-secondary-900 border-b border-dashed border-secondary-300 pb-4">
              <span>مبلغ قابل پرداخت</span>
              <span>{toPersianNumbersWithComma(totalPrice)}</span>
            </div>
          </div>
          {isPending ? (
            <div className="flex justify-center">
              <Loading width="45" height="15" />
            </div>
          ) : (
            <Button onClick={createPaymentHandler}>ثبت سفارش</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// jagged tear-off bottom edge: 20 teeth, 6px deep
const RECEIPT_EDGE = `polygon(0 0, 100% 0, ${Array.from(
  { length: 41 },
  (_, i) => `${100 - i * 2.5}% calc(100% - ${i % 2 ? 0 : 6}px)`,
).join(", ")})`;
export default CartSummary;
