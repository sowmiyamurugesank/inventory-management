import FormField from "./FormField-LIE.jsx";
import SelectField from "./SelectField.jsx";
import "../../styles/AttributeField.css";

function AttributeField({
  field,
  value,
  onChange,
  error = "",
}) {
  const commonProps = {
    label: field.label,
    name: field.name,
    value,
    onChange,
    required: field.required,
    error,
  };

  if (field.type === "select") {
    return (
      <SelectField
        {...commonProps}
        options={field.options || []}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <FormField
      {...commonProps}
      type={field.type || "text"}
      placeholder={field.placeholder}
    />
  );
}

export default AttributeField;