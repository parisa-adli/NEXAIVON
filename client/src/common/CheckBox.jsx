function CheckBox({name,id,value,onChange,checked,label}) {
  return (
    <div className="flex items-center gap-x-2 text-secondary-600">
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        value={value}
        onChange={onChange}
        className="cursor-pointer w-4 h-4 accent-brand"
      />
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
}
export default CheckBox;
