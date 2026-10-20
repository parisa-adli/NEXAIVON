import { fetchCardData } from "@/services/data";
import { FaUsers } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { FaBasketShopping } from "react-icons/fa6";
import { IoLayers } from "react-icons/io5";

async function CardsWrapper() {
  const {
    numberOfUsers,
    numberOfProducts,
    numberOfPayments,
    numberOfCategories,
  } = await fetchCardData();

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
      <Cart title="کاربران" value={numberOfUsers} type="users" />
      <Cart title="محصولات" value={numberOfProducts} type="products" />
      <Cart title="سفارشات" value={numberOfPayments} type="payments" />
      <Cart title="دسته بندی ها" value={numberOfCategories} type="categories" />
    </div>
  );
}
export default CardsWrapper;

const iconMap = {
  users: FaUsers,
  products: FaBasketShopping,
  payments: MdPayment,
  categories: IoLayers,
};

export function Cart({ title, value, type }) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl p-2 shadow-sm flex flex-col items-center gap-4 bg-primary-100">
      <div className=" ">
        {Icon ? <Icon className="h-20 w-20 text-primary-900" /> : null}
      </div>
      <div className="flex flex-col items-center gap-4 text-gray-800">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className={`truncate rounded-xl text-2xl font-bold py-2 px-4`}>
          {value}
        </p>
      </div>
    </div>
  );
}
