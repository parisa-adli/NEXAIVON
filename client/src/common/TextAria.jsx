function TextArea({
  label,
  name,
  value,
  dir = "rtl",
  onChange,
  isRequired = false,
}) {
  return (
    <div className="grid grid-cols-3 gap-x-4">
      <label htmlFor={name} className="block mb-2 col-span-1">
        {label}
      </label>

      <textarea
        name={name}
        id={name}
        dir={dir}
        className={`textField__input mt-2 min-h-min leading-8 !max-w-sm col-span-2 cursor-default ${
          dir === "ltr" ? "text-left" : "text-right"
        }`}
        value={value}
        readOnly
      ></textarea>
    </div>
  );
}
export default TextArea;
