"use client";

import { categoryListTHeads } from "@/constants/tableHeads";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { useQueryClient } from "@tanstack/react-query";
import { useRemoveCategory } from "@/hooks/useCategories";
import toast from "react-hot-toast";
import { Modal } from "@/common/Modal";
import { useState } from "react";
import ConfirmDelete from "@/common/ConfirmDelete";

function CategoryListTable({ categories }) {
  const { mutateAsync } = useRemoveCategory();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const removeCategoryHandler = async (id) => {
    try {
      const { message } = await mutateAsync(id);
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
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
            {categoryListTHeads.map((item) => (
              <th className="table__th" key={item.id}>
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category._id}>
              <td className="table__td">{index + 1}</td>
              <td className="table__td font-bold">{category.title}</td>
              <td className="table__td">{category.englishTitle}</td>
              <td className="table__td whitespace-nowrap max-w-[180px] truncate">
                {category.description}
              </td>
              <td className="table__td">
                <span className="badge badge--secondary">{category.type}</span>
              </td>

              <td className="table__td">
                {toLocalDateStringShort(category.createdAt)}
              </td>
              <td className="table__td">
                <div className="flex items-center gap-x-2">
                  <Link href={`/admin/categories/${category._id}`}>
                    <FaEye className="w-5 h-5 text-primary-900" />
                  </Link>
                  <Link href={`/admin/categories/edit/${category._id}`}>
                    <FiEdit3 className="w-5 h-5 text-secondary-600" />
                  </Link>
                  <div
                    onClick={() => {
                      setSelected(category);
                      setIsOpen(true);
                    }}
                    className="cursor-pointer"
                    // onClick={() => removeCategoryHandler(category._id)}
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
        title={`حذف دسته بندی ${selected.title}`}
      >
        <ConfirmDelete
          resourceName={selected.title}
          onClose={() => setIsOpen(false)}
          onConfirm={() => removeCategoryHandler(selected._id)}
        />
      </Modal>
    </div>
  );
}
export default CategoryListTable;
