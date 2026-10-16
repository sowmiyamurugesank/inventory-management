
function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="form-field">
      <span>{label}</span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default InputField;
