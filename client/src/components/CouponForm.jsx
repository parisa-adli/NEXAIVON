import RadioInput from "@/common/RadioInput";
import TextField from "@/common/TextField";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Button from "@/common/Button";
import Loading from "@/common/Loading";

function CouponForm({
  formData,
  onSubmit,
  onFormChange,
  type,
  setType,
  options,
  onChangeSelect,
  expireDate,
  setExpireDate,
  isLoading,
  defaultValue = "",
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-sm">
      <TextField
        label="کد"
        name="code"
        value={formData.code || ""}
        onChange={onFormChange}
      />
      <TextField
        label="مقدار"
        name="amount"
        value={formData.amount || ""}
        onChange={onFormChange}
      />
      <TextField
        label="ظرفیت"
        name="usageLimit"
        value={formData.usageLimit || ""}
        onChange={onFormChange}
      />
      <div>
        <span>نوع کد تخفیف</span>
        <div className="border rounded-lg p-2 mt-2 flex items-center justify-around">
          <RadioInput
            checked={type === "percent"}
            id="percent-type"
            name="type"
            label="درصد"
            value="percent"
            onChange={(e) => setType(e.target.value)}
          />
          <RadioInput
            checked={type === "fixedProduct"}
            id="fixedProduct-type"
            name="type"
            label="قیمت ثابت"
            value="fixedProduct"
            onChange={(e) => setType(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="products" className="mb-2 block">
          شامل محصولات
        </label>
        <Select
          isMulti
          instanceId="products"
          onChange={onChangeSelect}
          options={options}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option._id}
          defaultValue={defaultValue}
        />
      </div>
      <div>
        <span className="block mb-2">تاریخ انقضا</span>
        <DatePicker
          inputClass="textField__input w-[384px]"
          className="w-full"
          value={expireDate}
          onChange={(date) => setExpireDate(date)}
          format="YYYY/MM/DD"
          calendar={persian}
          locale={persian_fa}
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
  );
}
export default CouponForm;
