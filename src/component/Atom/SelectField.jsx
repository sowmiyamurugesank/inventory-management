
import Select from "./Select";
import Label from "./Label";
import " ../../styles/SelectField.css"

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  error = "",
  disabled = false,
}) {
  return (
    <div className="form-field">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
      />

      {error && (
        <p className="field-error">{error}</p>
      )}
    </div>
  );
}

export default SelectField;
