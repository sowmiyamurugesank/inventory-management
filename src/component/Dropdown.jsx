import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Button from "./Button";
import "./Dropdown.css";

function Dropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "All Categories",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <div className="dropdown-wrapper">

      <Button
        className="reusable-dropdown"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <Button
              key={option.value}
              className="dropdown-option"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

    </div>
  );
}

export default Dropdown;