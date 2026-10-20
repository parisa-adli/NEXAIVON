"use client";

import Loading from "@/common/Loading";
import { useGetAllUsers } from "@/hooks/useAuth";
import UsersTable from "./UsersTable";

function UsersPage() {
  const { isLoading, data } = useGetAllUsers();
  const { users } = data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="border rounded-xl p-4 mt-8">
      <h1 className="font-bold">اطلاعات کاربران</h1>
      <UsersTable users={users} />
    </div>
  );
}
export default UsersPage;
