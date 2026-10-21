
import "../styles/Checkbox.css";

function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
}) {
  return (
    <label className="reusable-checkbox">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        disabled={disabled}
      />

      {label && <span>{label}</span>}
    </label>
  );
}

export default Checkbox;
