
import "../../styles/Input.css";

function Input({
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  min,
  max,
  step = 1,
  ...props
}) {
  const minimum = min !== undefined ? Number(min) : 0;
  const maximum = max !== undefined ? Number(max) : Infinity;
  const numericStep = Number(step) || 1;

  const handleStep = (direction) => {
    if (disabled || !onChange) return;

    const currentValue =
      value === "" || value == null ? minimum : Number(value);

    const nextValue = Math.min(
      maximum,
      Math.max(minimum, currentValue + direction * numericStep)
    );

    onChange({
      target: {
        name,
        value: String(nextValue),
        type: "number",
      },
    });
  };

  const handleNumberChange = (event) => {
    const nextValue = event.target.value;

    if (nextValue !== "" && Number(nextValue) < minimum) {
      return;
    }

    onChange?.(event);
  };

  if (type === "number") {
    const numericValue =
      value === "" || value == null ? null : Number(value);

    return (
      <div className="number-input-wrapper">
        <input
          {...props}
          className="reusable-input number-input"
          id={name}
          name={name}
          type="number"
          value={value ?? ""}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={minimum}
          max={max}
          step={numericStep}
        />

        <div className="number-input-controls">
          <button
            type="button"
            className="number-input-arrow"
            onClick={() => handleStep(1)}
            disabled={
              disabled ||
              (numericValue !== null && numericValue >= maximum)
            }
            aria-label="Increase value"
          >
            ⌃
          </button>

          <button
            type="button"
            className="number-input-arrow"
            onClick={() => handleStep(-1)}
            disabled={
              disabled ||
              (numericValue !== null && numericValue <= minimum)
            }
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
