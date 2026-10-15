import "../component/Dropdown.css";

function Dropdown({ options, value, onChange, placeholder }) {
  return (
    <select
      className="reusable-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
