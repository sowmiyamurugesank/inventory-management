
import "../styles/Toggle.css";

function Toggle({ label, checked = false, onChange, disabled = false }) {
  return (
    <label className="toggle-container">
      {label && <span className="toggle-label">{label}</span>}

      <input
        type="checkbox"
        className="toggle-input"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />

      <span className="toggle-slider"></span>
    </label>
  );
}

export default Toggle;
