import Select from "react-select";
import { TagsInput } from "react-tag-input-component";
import Button from "@/common/Button";
import Loading from "@/common/Loading";
import TextField from "@/common/TextField";

const productsFormData = [
  {
    id: 1,
    label: "عنوان",
    name: "title",
  },
  {
    id: 2,
    label: "توضیحات",
    name: "description",
  },
  {
    id: 3,
    label: "اسلاگ",
    name: "slug",
  },
  {
    id: 4,
    label: "بررند",
    name: "brand",
  },
  {
    id: 5,
    label: "قیمت",
    name: "price",
  },
  {
    id: 6,
    label: "تخفیف",
    name: "discount",
  },
  {
    id: 7,
    label: "تخفیف روی قیمت",
    name: "offPrice",
  },
  {
    id: 8,
    label: "موجودی",
    name: "countInStock",
  },
  {
    id: 9,
    label: "لینک عکس محصول",
    name: "imageLink",
  },
];

function ProductForm({
  onSubmit,
  tags,
  setTags,
  categories,
  selectedCategory = "",
  setSelectedCategory,
  productData,
  productDataOnChange,
  isLoading,
}) {
  return (
    <div className="max-w-sm">
      <form className="space-y-6" onSubmit={onSubmit}>
        {productsFormData.map((item) => (
          <TextField
            key={item.id}
            label={item.label}
            name={item.name}
            value={productData[item.name] ?? ""}
            onChange={productDataOnChange}
          />
        ))}
        <div>
          <label htmlFor="tags" className="mb-2">
            تگ محصولات
          </label>
          <TagsInput
            id="tags"
            // placeHolder="تگ"
            value={tags}
            onChange={setTags}
            name="tags"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-2">
            دسته بندی
          </label>
          <Select
            className="bg-secondary-100"
            instanceId="category"
            onChange={setSelectedCategory}
            options={categories}
            getOptionLabel={(option) => option.title}
            getOptionValue={(option) => option._id}
            defaultValue={selectedCategory}
          />
        </div>
        <div>
          {isLoading ? (
            <Loading width="45" height="15" />
          ) : (
            <Button>تایید</Button>
          )}
        </div>
      </form>
    </div>
  );
}
export default ProductForm;
