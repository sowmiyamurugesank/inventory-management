
import Input from "./Input.jsx";
import Label from "./Label.jsx";
import "../../styles/FormField-LIE.css";

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error = "",
  disabled = false,
  min,
  step,
}) {
  return (
    <div className="form-field">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      <Input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        min={min}
        step={step}
      />

      {error && (
        <p className="field-error">{error}</p>
      )}
    </div>
  );
}

export default FormField;
