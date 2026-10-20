"use client";

import Loading from "@/common/Loading";
import TextArea from "@/common/TextAria";
import TextFieldDetail from "@/common/TextFieldDetail";
import { paymentDetailTHeads } from "@/constants/tableHeads";
import { useGetPaymentById } from "@/hooks/usePayments";
import { toLocalDateStringShort } from "@/utils/toLocalDate";
import { toPersianNumbersWithComma } from "@/utils/toPersianNumber";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const paymentFormData = [
  {
    id: 1,
    label: "شماره فاکتور",
    name: "invoiceNumber",
  },
  {
    id: 2,
    label: "درگاه پرداخت",
    name: "paymentMethod",
  },
];

function PaymentPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetPaymentById(id);
  const { payment } = data || {};
  const [openFactor, setOpenFactor] = useState(false);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between border-b mb-8 pb-4">
        <h1 className="font-bold text-lg ">جزئیات سفارش کاربر</h1>
        <button
          className="bg-primary-900 text-white btn font-normal text-sm flex items-center gap-x-1.5"
          onClick={() => setOpenFactor((prev) => !prev)}
        >
          {openFactor ? (
            <FaEyeSlash className="w-4 h-4" />
          ) : (
            <FaEye className="w-4 h-4" />
          )}
          نمایش فاکتور
        </button>
      </div>

      {openFactor ? (
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <div className=" overflow-auto">
            <table className="border-collapse table-auto w-full min-w-lg text-sm">
              <tbody>
                {paymentDetailTHeads.map((item, index) => (
                  <tr key={item.id}>
                    <th className="table__td border-l">{item.label}</th>
                    <td className="table__td">
                      {index === 0 ? (
                        <span className="font-bold">جزئیات سفارش</span>
                      ) : index === 1 ? (
                        payment[0].status === "COMPLETED" ? (
                          <span className="badge badge--success">
                            انجام شده
                          </span>
                        ) : (
                          <span className="badge badge--error">لغو شده</span>
                        )
                      ) : index === 2 ? (
                        toLocalDateStringShort(payment[0].createdAt)
                      ) : index === 3 ? (
                        payment[0].invoiceNumber
                      ) : index === 4 ? (
                        <span className="font-bold">
                          {toPersianNumbersWithComma(payment[0].amount)} تومان
                        </span>
                      ) : index === 5 ? (
                        <span className="whitespace-pre-wrap leading-6">
                          {payment[0].description}
                        </span>
                      ) : index === 6 ? (
                        toPersianNumbersWithComma(
                          payment[0].cart.payDetail.totalGrossPrice
                        ) + " تومان"
                      ) : index === 7 ? (
                        toPersianNumbersWithComma(
                          payment[0].cart.payDetail.totalOffAmount
                        ) + " تومان"
                      ) : index === 8 ? (
                        toPersianNumbersWithComma(
                          payment[0].cart.payDetail.totalPrice
                        ) + " تومان"
                      ) : index === 9 ? (
                        payment[0].user.name
                      ) : (
                        payment[0].user.phoneNumber
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-x-4">
            <span className="block mb-2 col-span-1">وضعیت سفارش</span>
            <div className="textField__input !max-w-sm col-span-2">
              {payment[0].status === "COMPLETED" ? (
                <span className="badge badge--success">انجام شده</span>
              ) : (
                <span className="badge badge--error">لغو شده</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            <span className="block mb-2 col-span-1">تاریخ سفارش</span>
            <input
              className="textField__input !max-w-sm col-span-2"
              value={toLocalDateStringShort(payment[0].createdAt)}
              disabled
            />
          </div>
          {paymentFormData.map((item) => (
            <TextFieldDetail
              key={item.id}
              label={item.label}
              name={item.name}
              value={payment[0][item.name] || ""}
              readOnly
            />
          ))}
          <div className="grid grid-cols-3 gap-x-4">
            <span className="block mb-2 col-span-1">مبلغ سفارش</span>
            <input
              className="textField__input !max-w-sm col-span-2"
              value={toPersianNumbersWithComma(payment[0].amount) + " تومان"}
              disabled
            />
          </div>
          <div>
            <TextArea
              label="توضیحات سفارش"
              name="description"
              value={payment[0].description || ""}
            />
          </div>
          <div>
            <span className="block mb-2">جزئیات پرداخت</span>
            <div className="border rounded-xl p-4 overflow-x-auto">
              <table className="border-collapse table-auto w-full text-sm ">
                <thead>
                  <tr>
                    <td className="table__th">قیمت اصلی</td>
                    <td className="table__th">تخفیف</td>
                    <td className="table__th">مبلغ پرداختی</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 pb-0 pr-8">
                      {toPersianNumbersWithComma(
                        payment[0].cart.payDetail.totalGrossPrice
                      ) + " تومان" || ""}
                    </td>
                    <td className="p-3 pb-0 pr-8">
                      {toPersianNumbersWithComma(
                        payment[0].cart.payDetail.totalOffAmount
                      ) + " تومان" || ""}
                    </td>
                    <td className="p-3 pb-0 pr-8">
                      {toPersianNumbersWithComma(
                        payment[0].cart.payDetail.totalPrice
                      ) + " تومان" || ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <span className="block mb-2">اطلاعات کاربر</span>
            <div className="border rounded-xl p-4 overflow-x-auto">
              <table className="border-collapse table-auto w-full text-sm ">
                <thead>
                  <tr>
                    <td className="table__th">نام کاربر</td>
                    <td className="table__th">ایمیل</td>
                    <td className="table__th">شماره تلفن</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 pb-0 pr-8">
                      {payment[0].user.name || ""}
                    </td>
                    <td className="p-3 pb-0 pr-8">
                      {payment[0].user.email || ""}
                    </td>
                    <td className="p-3 pb-0 pr-8">
                      {payment[0].user.phoneNumber || ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default PaymentPage;
