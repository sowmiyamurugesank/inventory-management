
import FormField from "./FormField-LIE.jsx";
import SelectField from "./SelectField.jsx";
import "../../styles/AttributeField.css";

function AttributeField({
  field,
  value,
  onChange,
  disabled = false,
  error = "",
}) {
  const commonProps = {
    label: field.label,
    name: field.name,
    value,
    onChange,
    required: field.required,
    disabled,
    error,
  };

  const fieldClassName =
    field.type === "textarea"
      ? "warehouse-field warehouse-full-width"
      : "warehouse-field";

  if (field.type === "select") {
    return (
      <div className={fieldClassName}>
        <SelectField
          {...commonProps}
          options={field.options || []}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  return (
    <div className={fieldClassName}>
      <FormField
        {...commonProps}
        type={field.type || "text"}
        placeholder={field.placeholder}
      />
    </div>
  );
}

export default AttributeField;

