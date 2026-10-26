function TextField({
  label,
  name,
  value,
  onChange,
  disabled = "",
  multiline = false,
  type = "text",
}) {
  const Input = multiline ? "textarea" : "input";

  return (
    <div>
      <label htmlFor={name} className="block mb-2">
        {label}
      </label>
      <Input
        autoCapitalize="off"
        className="textField__input"
        type={multiline ? undefined : type}
        rows={multiline ? 5 : undefined}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
export default TextField;
