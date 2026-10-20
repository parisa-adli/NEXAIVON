"use client";

import { useGetPayments } from "@/hooks/usePayments";
import PaymentListTable from "../payments/PaymentListTable";
import Loading from "@/common/Loading";

function LimitedPayments() {
  const { data, isLoading } = useGetPayments();
  const { payments } = data || {};

  if (isLoading) return <Loading />;
  return (
    <div className="border rounded-xl p-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">آخرین سفارشات کاربران</h2>
      </div>
      <PaymentListTable
        payments={payments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)}
      />
    </div>
  );
}
export default LimitedPayments;
