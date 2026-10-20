import ProductsFilter from "./ProductsFilter";
import ProductsSort from "./ProductsSort";

function CategorySidebar({ categories }) {
  return (
    <div className="w-[200px] space-y-8">
      <ProductsFilter categories={categories} />
      <ProductsSort />
    </div>
  );
}
export default CategorySidebar;
