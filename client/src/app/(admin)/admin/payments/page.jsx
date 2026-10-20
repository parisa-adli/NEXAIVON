"use client";

import { useGetPayments } from "@/hooks/usePayments";
import Loading from "@/common/Loading";
import PaymentListTable from "./PaymentListTable";

function PaymentsPage() {
  const { data, isLoading } = useGetPayments();
  const { payments } = data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="border rounded-xl p-4 mt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">سفارشات</h1>
        {/* <Link
          href="/admin/categories/add"
          className="flex items-center text-primary-900 gap-x-1 text-sm font-bold"
        >
          <FaPlusCircle />
          اضافه کردن دسته بندی
        </Link> */}
      </div>
      <PaymentListTable payments={payments} />
    </div>
  );
}
export default PaymentsPage;
