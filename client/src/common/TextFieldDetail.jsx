function TextFieldDetail({ label, name, value }) {
  return (
    <div className="grid grid-cols-3 gap-x-4">
      <label htmlFor={name} className="block mb-2 col-span-1">
        {label}
      </label>
      <input
        className="textField__input !max-w-sm col-span-2"
        type="text"
        name={name}
        id={name}
        value={value}
        disabled
      />
    </div>
  );
}
export default TextFieldDetail;
