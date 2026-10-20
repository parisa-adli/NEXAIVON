import { adminPaymentListTHeads } from "@/constants/tableHeads";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { toPersianNumbersWithComma } from "@/utils/toPersianNumber";

function PaymentListTable({ payments }) {
  return (
    <div className="shadow-sm overflow-auto mt-8">
      <table className="border-collapse table-auto w-full min-w-[800px] text-sm ">
        <thead>
          <tr>
            {adminPaymentListTHeads.map((item) => (
              <th className="table__th" key={item.id}>
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={payment._id}>
              <td className="table__td">{index + 1}</td>
              <td className="table__td">{payment.invoiceNumber}</td>
              <td className="table__td whitespace-nowrap max-w-[180px] truncate">
                {payment.description}
              </td>
              <td className="table__td">
                <div className="flex flex-col gap-y-2">
                  <span>{payment.user.name}</span>
                  <span>{payment.user.email}</span>
                  <span className="font-bold">{payment.user.phoneNumber}</span>
                </div>
              </td>
              <td className="table__td">
                <div className="flex flex-col gap-y-2 items-start">
                  {payment.cart.productDetail.map((product) => (
                    <span className="badge badge--secondary" key={product._id}>
                      {product.title}
                    </span>
                  ))}
                </div>
              </td>
              <td className="table__td font-bold">
                {toPersianNumbersWithComma(payment.amount)}
              </td>

              <td className="table__td">
                {toLocalDateStringShort(payment.createdAt)}
              </td>
              <td className="table__td">
                <span
                  className={`badge ${
                    payment.status === "COMPLETED"
                      ? "badge--success"
                      : "badge--error"
                  } `}
                >
                  {payment.status === "COMPLETED" ? "موفق" : "ناموفق"}
                </span>
              </td>
              <td className="table__td">
                <Link
                  className="text-sm flex items-center gap-x-1 text-secondary-600"
                  href={`/admin/payments/${payment._id}`}
                >
                  <FaEye />
                  <span>جزئیات</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default PaymentListTable;
