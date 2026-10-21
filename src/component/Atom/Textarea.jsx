import "../../styles/Textarea.css";

function Textarea({
  name,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  disabled = false,
  required = false,
}) {
  return (
    <textarea
      id={name}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      required={required}
    />
  );
}

export default Textarea;