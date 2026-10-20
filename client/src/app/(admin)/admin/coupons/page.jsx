"use client";

import Loading from "@/common/Loading";
import { useGetCoupons } from "@/hooks/useCoupons";
import CouponsTable from "./couponsTable";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";

function CouponsPage() {
  const { data, isLoading } = useGetCoupons();
  const { coupons } = data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="border rounded-xl p-4 mt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">کد های تخفیف</h1>
        <Link
          href="/admin/coupons/add"
          className="flex items-center text-primary-900 gap-x-1 text-sm font-bold"
        >
          <FaPlusCircle />
          اضافه کردن کد تخفیف
        </Link>
      </div>
      <CouponsTable coupons={coupons} />
    </div>
  );
}
export default CouponsPage;
