
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../../styles/DetailsAccordion.css";

function DetailsAccordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="details-accordion">
      <button
        type="button"
        className="details-accordion-header"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
      </button>

      {isOpen && (
        <div className="details-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default DetailsAccordion;
