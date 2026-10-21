import "../../styles/Input.css";

function Input({
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  ...props
}) {
  return (
    <input
      id={name}
      name={name}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
}

export default Input;