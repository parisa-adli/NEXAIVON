"use client";

import { LuX } from "react-icons/lu";
import ImageInput from "./ImageInput";

// One empty value per field type, for a newly added item.
const emptyValues = { text: "", image: "", icon: "", checkbox: false };

function newItem(fields) {
  if (!fields) return "";
  return Object.fromEntries(
    fields.map(({ name, type = "text" }) => [name, emptyValues[type]])
  );
}

// Add, edit and remove the items of one homepage section. Without fields, the
// items are plain strings (e.g. search tags).
function ListEditor({ id, title, items, fields, onChange }) {
  const updateItem = (index, value) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <details className="border rounded-xl p-4">
      <summary className="font-bold cursor-pointer">
        {title} ({items.length})
      </summary>
      <ul className="space-y-4 mt-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="relative grid gap-4 sm:grid-cols-2 border rounded-lg p-4 pt-10"
          >
            {fields ? (
              fields.map((field) => (
                <Field
                  key={field.name}
                  id={`${id}-${index}-${field.name}`}
                  field={field}
                  value={item[field.name]}
                  onChange={(value) =>
                    updateItem(index, { ...item, [field.name]: value })
                  }
                />
              ))
            ) : (
              <input
                aria-label={`${title} ${index + 1}`}
                className="textField__input"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
              />
            )}
            <button
              type="button"
              aria-label={`حذف مورد ${index + 1}`}
              onClick={() => removeItem(index)}
              className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full text-red-500 hover:bg-red-50"
            >
              <LuX className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...items, newItem(fields)])}
        className="mt-4 rounded-lg border border-secondary-300 px-4 py-2 text-sm"
      >
        افزودن مورد جدید
      </button>
    </details>
  );
}
export default ListEditor;

function Field({ id, field, value, onChange }) {
  const { label, type = "text", options } = field;

  if (type === "image")
    return (
      <div className="sm:col-span-2">
        <ImageInput
          id={id}
          label={label}
          value={value}
          onChange={onChange}
          removable={field.removable}
        />
      </div>
    );

  if (type === "checkbox")
    return (
      <label htmlFor={id} className="flex items-center gap-x-2">
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );

  return (
    <div>
      <label htmlFor={id} className="block mb-2">
        {label}
      </label>
      {type === "icon" ? (
        <select
          id={id}
          className="textField__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">بدون آیکون</option>
          {options.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          dir={field.ltr ? "ltr" : undefined}
          className="textField__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
