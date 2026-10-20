"use client";

import { useGetUser } from "@/hooks/useAuth";
import toLocalDateStringShort, { toLocalDateString } from "@/utils/toLocalDate";
import Link from "next/link";
import PaymentTable from "./payments/PaymentTable";
import { FaEye } from "react-icons/fa";
import Loading from "@/common/Loading";

function Profile() {
  const { isLoading, data } = useGetUser();
  const { user, payments } = data || {};
  if (isLoading) return <Loading />;
  return (
    <div>
      <h1 className="mb-4">
        سلام! <span className="font-bold">{user.name}</span> خوش آمدید
      </h1>
      <p>
        <span>تاریخ پیوستن : </span>
        <span>{toLocalDateString(user.createdAt)}</span>
      </p>
      <div className="border rounded-xl p-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">آخرین سفارشات کاربر</h2>
          <Link
            className="flex items-center gap-x-1.5 border-b border-b-primary-900 text-primary-900"
            href="/profile/payments"
          >
            <FaEye className="w-5 h-5" />
            <span>همه سفارشات</span>
          </Link>
        </div>
        <PaymentTable
          payments={payments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)}
        />
      </div>
    </div>
  );
}
export default Profile;
