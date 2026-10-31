import Label from "./Label.jsx";
import "../../styles/SelectField.css";

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  required = false,
  error = "",
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className="warehouse-field">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      <select
        id={name}
        name={name}
        className="reusable-select"
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
      >
       <option value="" disabled hidden style={{ display: "none" }}>
      {placeholder}
      </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default SelectField;