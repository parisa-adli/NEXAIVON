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
    <div className="border p-2 pb-4 rounded-xl space-y-4">
      <p className="font-bold p-2 text-secondary-700 text-center border-b">
        اطلاعات پرداخت
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>جمع کل</span>
          <span>{toPersianNumbersWithComma(totalGrossPrice)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">کد تخفیف</span>
          <div className="flex flex-row-reverse gap-x-2 relative">
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
        <div className="flex items-center justify-between border-b border-dashed pb-4">
          <span>تخفیف</span>
          <span>{toPersianNumbersWithComma(totalOffAmount)} -</span>
        </div>
        <div className="flex items-center justify-between font-bold">
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
  );
}
export default CartSummary;
