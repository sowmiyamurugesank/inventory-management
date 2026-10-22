
import FormField from "./FormField-LIE.jsx";
import SelectField from "./SelectField.jsx";
import Textarea from "./Textarea.jsx";

import "../../styles/AttributeField.css";

function AttributeField({
  field,
  value,
  onChange,
  error = "",
  disabled = false,
}) {
  const commonProps = {
    label: field.label,
    name: field.name,
    value,
    onChange,
    required: field.required,
    error,
    disabled,
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

  if (field.type === "textarea") {
    return (
      <Textarea
        {...commonProps}
        placeholder={field.placeholder}
        rows={4}
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
