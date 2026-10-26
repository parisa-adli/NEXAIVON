function RadioInput({ id, name, value, onChange, checked, label, disabled }) {
  return (
    <div className="flex items-center gap-x-2 text-secondary-600">
      <input
        type="radio"
        name={name}
        id={id}
        checked={checked}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="cursor-pointer w-4 h-4 accent-brand"
      />
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
}
export default RadioInput;
