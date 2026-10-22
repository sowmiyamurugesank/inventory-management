
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
  const handleStep = (direction) => {
    if (disabled || !onChange) return;

    const currentValue = value === "" || value == null ? 0 : Number(value);
    const step = Number(props.step) || 1;
    const min = props.min !== undefined ? Number(props.min) : -Infinity;
    const max = props.max !== undefined ? Number(props.max) : Infinity;
    const nextValue = Math.min(max, Math.max(min, currentValue + direction * step));

    onChange({
      target: {
        name,
        value: String(nextValue),
        type: "number",
      },
    });
  };

  if (type === "number") {
    return (
      <div className="number-input-wrapper">
        <input
          {...props}
          className="reusable-input number-input"
          id={name}
          name={name}
          type="number"
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />

        <div className="number-input-controls">
          <button
            type="button"
            className="number-input-arrow"
            onClick={() => handleStep(1)}
            disabled={disabled || (value !== "" && value != null && Number(value) >= Number(props.max ?? Infinity))}
            aria-label="Increase value"
          >
            ⌃
          </button>

          <button
            type="button"
            className="number-input-arrow"
            onClick={() => handleStep(-1)}
            disabled={disabled || (value !== "" && value != null && Number(value) <= Number(props.min ?? -Infinity))}
            aria-label="Decrease value"
          >
            ⌄
          </button>
        </div>
      </div>
    );
  }

  return (
    <input
      className="reusable-input"
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
