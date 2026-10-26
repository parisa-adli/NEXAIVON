"use client";

import Loading from "@/common/Loading";
import { useGetUser } from "@/hooks/useAuth";
import HomeContentEditor from "./HomeContentEditor";
import LimitedPayments from "./LimitedPayments";

// The main admin edits the homepage here; other admins see the latest orders.
function DashboardContent() {
  const { data, isLoading } = useGetUser();

  if (isLoading) return <Loading />;
  return data?.user?.isMainAdmin ? <HomeContentEditor /> : <LimitedPayments />;
}
export default DashboardContent;
