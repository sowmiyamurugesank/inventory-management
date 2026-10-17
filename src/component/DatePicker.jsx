
import "../styles/DatePicker.css";

function DatePicker({ label, name, value, onChange }) {
  return (
    <div className="date-picker">
      <label htmlFor={name}>{label}</label>

      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default DatePicker;
