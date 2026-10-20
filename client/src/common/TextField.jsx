function TextField({ label, name, value, onChange, disabled = "" }) {
  return (
    <div>
      <label htmlFor={name} className="block mb-2">
        {label}
      </label>
      <input
        autoCapitalize="off"
        className="textField__input"
        type="text"
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
