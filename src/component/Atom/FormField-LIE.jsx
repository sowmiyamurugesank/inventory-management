
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
}) {
  return (
    <div className="form-field">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          rows={4}
          className="form-textarea-field"
        />
      ) : (
        <Input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
        />
      )}

      {error && (
        <p className="field-error">{error}</p>
      )}
    </div>
  );
}

export default FormField;

