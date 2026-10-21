import "../../styles/Label.css"

function Label({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="form-label">
      {children}
      {required && <span className="required-mark"> *</span>}
    </label>
  );
}

export default Label;