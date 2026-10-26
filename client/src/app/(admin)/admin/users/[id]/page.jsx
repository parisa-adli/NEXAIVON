"use client";

import Loading from "@/common/Loading";
import { useGetAllUsers, useUpdateUserByAdmin } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { toLocalDateString } from "@/utils/toLocalDate";
import TextFieldDetail from "@/common/TextFieldDetail";
import RadioInput from "@/common/RadioInput";
import Button from "@/common/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
];

function UserPage() {
  const { id } = useParams();
  const { isLoading, data } = useGetAllUsers();
  const { users } = data || {};
  const selectedUser = users && users.find((user) => user._id === id);
  const [isBlocked, setIsBlocked] = useState(false);
  const [role, setRole] = useState("USER");
  const { isPending, mutateAsync } = useUpdateUserByAdmin();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selectedUser) {
      setIsBlocked(!!selectedUser.isBlocked);
      setRole(selectedUser.role);
    }
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync({
        id: selectedUser._id,
        data: { isBlocked, role },
      });
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-users"] });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  if (isLoading) return <Loading />;
  return (
    <form className="space-y-4 max-w-lg" onSubmit={handleSubmit}>
      <h1 className="font-bold text-lg mb-8 border-b pb-4">مشخصات کاربر</h1>
      {selectedUser.isMainAdmin && (
        <p className="text-secondary-500">
          نقش و وضعیت ادمین اصلی قابل تغییر نیست.
        </p>
      )}
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">وضعیت کاربر</span>
        <div className="flex items-center gap-x-8 col-span-2">
          <RadioInput
            checked={!isBlocked}
            id="status-active"
            name="isBlocked"
            label="فعال"
            value="active"
            disabled={selectedUser.isMainAdmin}
            onChange={() => setIsBlocked(false)}
          />
          <RadioInput
            checked={isBlocked}
            id="status-inactive"
            name="isBlocked"
            label="غیر فعال"
            value="inactive"
            disabled={selectedUser.isMainAdmin}
            onChange={() => setIsBlocked(true)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <span className="block mb-2 col-span-1">سطح دسترسی کاربر</span>
        <div className="flex items-center gap-x-8 col-span-2">
          <RadioInput
            checked={role === "USER"}
            id="role-user"
            name="role"
            label="کاربر"
            value="USER"
            disabled={selectedUser.isMainAdmin}
            onChange={(e) => setRole(e.target.value)}
          />
          <RadioInput
            checked={role === "ADMIN"}
            id="role-admin"
            name="role"
            label="ادمین"
            value="ADMIN"
            disabled={selectedUser.isMainAdmin}
            onChange={(e) => setRole(e.target.value)}
          />
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
      {isPending ? (
        <Loading width="45" height="15" />
      ) : (
        <Button>ذخیره تغییرات</Button>
      )}
    </form>
  );
}
export default UserPage;
