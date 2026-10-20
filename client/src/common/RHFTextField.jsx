"use client";
function RHFTextField({
  label,
  name,
  value,
  onChange,
  validationSchema,
  dir = "rtl",
  required,
  register,
  errors,
}) {
  return (
    <div>
      <label htmlFor={name} className="block mb-4">
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      <input
        autoCapitalize="off"
        type="text"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`textField__input  ${
          dir === "ltr" ? "text-left" : "text-right"
        }`}
        {...register(name, validationSchema)}
      />
      {errors && errors[name] && (
        <span className="text-error block text-sm mt-2">
          {errors[name]?.message}
        </span>
      )}
    </div>
  );
}
export default RHFTextField;
