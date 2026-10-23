
import "../../styles/DetailsField.css";

function DetailsField({ label, value }) {
  return (
    <div className="details-field">
      <span className="details-field-label">{label}</span>
      <strong className="details-field-value">
        {value !== undefined && value !== null && value !== ""
          ? value
          : "-"}
      </strong>
    </div>
  );
}

export default DetailsField;
