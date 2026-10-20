import { couponListTHeads } from "@/constants/tableHeads";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";
import { useRemoveCoupon } from "@/hooks/useCoupons";
import { Modal } from "@/common/Modal";
import ConfirmDelete from "@/common/ConfirmDelete";
import { useState } from "react";

function CouponsTable({ coupons }) {
  const { mutateAsync } = useRemoveCoupon();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const removeCouponHandler = async (id) => {
    try {
      const { message } = await mutateAsync(id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-coupons"] });
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="shadow-sm overflow-auto my-8">
      <table className="border-collapse table-auto w-full min-w-[800px] text-sm ">
        <thead>
          <tr>
            {couponListTHeads.map((item) => (
              <th className="table__th" key={item.id}>
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon, index) => (
            <tr key={coupon._id}>
              <td className="table__td">{index + 1}</td>
              <td className="table__td">{coupon.code}</td>
              <td className="table__td">
                <span className="badge badge--primary">{coupon.type}</span>
              </td>
              <td className="table__td">
                {toPersianNumbersWithComma(coupon.amount)}
              </td>
              <td className="table__td">
                <div className="flex flex-col gap-y-2 items-start">
                  {coupon.productIds.map((product) => (
                    <span className="badge badge--secondary" key={product._id}>
                      {product.title}
                    </span>
                  ))}
                </div>
              </td>
              <td className="table__td">
                {toPersianNumbers(coupon.usageCount)}
              </td>
              <td className="table__td">
                {toPersianNumbers(coupon.usageLimit)}
              </td>
              <td className="table__td">
                {toLocalDateStringShort(coupon.createdAt)}
              </td>
              <td className="table__td">
                <div className="flex items-center gap-x-2">
                  <Link href={`/admin/coupons/${coupon._id}`}>
                    <FaEye className="w-5 h-5 text-primary-900" />
                  </Link>
                  <Link href={`/admin/coupons/edit/${coupon._id}`}>
                    <FiEdit3 className="w-5 h-5 text-secondary-600" />
                  </Link>
                  <div
                    onClick={() => {
                      setSelected(coupon);
                      setIsOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <HiOutlineTrash className="w-5 h-5 text-rose-500" />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={`حذف کد تخفیف ${selected.code}`}
      >
        <ConfirmDelete
          resourceName={selected.code}
          onClose={() => setIsOpen(false)}
          onConfirm={() => removeCouponHandler(selected._id)}
        />
      </Modal>
    </div>
  );
}
export default CouponsTable;
