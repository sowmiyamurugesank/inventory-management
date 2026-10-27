import "../styles/DatePicker.css";

function DatePicker({
  label,
  name,
  value,
  onChange,
  type = "date",
  required = false,
  disabled = false,
}) {
  return (
    <div className="date-picker">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

export default DatePicker;