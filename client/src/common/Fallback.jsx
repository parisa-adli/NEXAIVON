"use client";
import Loading from "./Loading";

export default function Fallback() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center my-12 mx-auto">
      <span className="text-secondary-500"> در حال بارگذاری اطلاعات</span>
      <Loading />
    </div>
  );
}
