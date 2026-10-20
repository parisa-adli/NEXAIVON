import CardsWrapper from "@/pages/(admin)/admin/_components/CartWrapper";
import { Suspense } from "react";
import LimitedPayments from "./_components/LimitedPayments";
import Fallback from "@/common/Fallback";

async function Admin() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-bold text-lg mb-4">داشبورد ادمین</h1>
        <Suspense fallback={<Fallback />}>
          <CardsWrapper />
        </Suspense>
      </div>

      <LimitedPayments />
    </div>
  );
}
export default Admin;
