
import DetailsField from "./DetailsField";
import "../../styles/DetailsSection.css";

function DetailsSection({ title, fields = [] }) {
  return (
    <section className="details-section">
      <h3 className="details-section-title">{title}</h3>

      <div className="details-section-grid">
        {fields.map((field, index) => (
          <DetailsField
            key={field.label || index}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </section>
  );
}

export default DetailsSection;
