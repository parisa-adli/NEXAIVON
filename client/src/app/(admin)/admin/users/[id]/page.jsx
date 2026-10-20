"use client";

import Loading from "@/common/Loading";
import { useGetAllUsers } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { toLocalDateString } from "@/utils/toLocalDate";
import TextFieldDetail from "@/common/TextFieldDetail";

const userFormData = [
  {
    id: 1,
    label: "نام کاربری",
    name: "name",
  },
  {
    id: 2,
    label: "ایمیل",
    name: "email",
  },
  {
    id: 3,
    label: "بایوگرافی",
    name: "biography",
  },
  {
    id: 4,
    label: "شماره موبایل",
    name: "phoneNumber",
  },
  {
    id: 5,
    label: "سطح دسترسی کاربر",
    name: "role",
  },
];

function UserPage() {
  const { id } = useParams();
  const { isLoading, data } = useGetAllUsers();
  const { users } = data || {};
  const selectedUser = users && users.find((user) => user._id === id);

  if (isLoading) return <Loading />;
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="font-bold text-lg mb-8 border-b pb-4">مشخصات کاربر</h1>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">وضعیت کاربر</span>
        <div className="textField__input !max-w-sm col-span-2">
          {selectedUser.isActive ? (
            <span className="badge badge--success">فعال</span>
          ) : (
            <span className="badge badge--error">غیر فعال</span>
          )}
        </div>
      </div>
      {userFormData.map((item) => (
        <TextFieldDetail
          key={item.id}
          label={item.label}
          name={item.name}
          value={selectedUser[item.name] || ""}
        />
      ))}
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">تاریخ پیوستن</span>
        <input
          className="textField__input !max-w-sm col-span-2"
          value={toLocalDateString(selectedUser.createdAt)}
          disabled
        />
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">محصولات خریداری شده</span>
        <div className="textField__input !max-w-sm col-span-2 flex flex-col gap-y-2 items-start">
          {selectedUser.Products.map((product, index) => (
            <span className="badge badge--secondary" key={index}>
              {product.title}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">محصولات لایک شده</span>
        <input
          className="textField__input !max-w-sm col-span-2"
          value={selectedUser.likedProducts.length}
          disabled
        />
      </div>
    </div>
  );
}
export default UserPage;
