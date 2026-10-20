import { cookies } from "next/headers";
import { getAllUsers } from "./authServices";
import { getAllProducts } from "./productService";
import { getCategories } from "./categoryService";
import { getAllPayments } from "./paymentService";
import { setCookieOnReq } from "@/utils/setCookieOnReq";

export async function fetchCardData() {
  const cookieStore = await cookies();
  const options = await setCookieOnReq(await cookieStore);

  try {
    const data = await Promise.all([
      getAllUsers(options),
      getAllProducts(options),
      getAllPayments(options),
      getCategories(options),
    ]);

    const numberOfUsers = Number(data[0].users.length ?? "0");
    const numberOfProducts = Number(data[1].products.length ?? "0");
    const numberOfPayments = Number(data[2].payments.length ?? "0");
    const numberOfCategories = Number(data[3].categories.length ?? "0");

    return {
      numberOfUsers,
      numberOfProducts,
      numberOfPayments,
      numberOfCategories,
    };
  } catch (error) {
    throw new Error("خطا در بارگذاری اطلاعات");
  }
}
