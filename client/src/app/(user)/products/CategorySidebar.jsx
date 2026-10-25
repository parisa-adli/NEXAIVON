import ProductsFilter from "./ProductsFilter";
import ProductsSort from "./ProductsSort";

function CategorySidebar({ categories }) {
  return (
    <aside className="sm:w-56 shrink-0 self-start space-y-8 rounded-xl border border-secondary-200 p-4">
      <p className="font-bold text-secondary-900">فیلترها</p>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-8">
        <ProductsFilter categories={categories} />
        <ProductsSort />
      </div>
    </aside>
  );
}
export default CategorySidebar;
