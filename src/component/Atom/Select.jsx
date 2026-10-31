import "../../styles/Select.css";

function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  required = false,
}) {
  return (
    <select
      id={name}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      required={required}
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;