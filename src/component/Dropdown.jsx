
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/Dropdown.css";

function Dropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "All Categories",
  isOpen,
  onToggle,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const controlled = isOpen !== undefined;
  const dropdownOpen = controlled ? isOpen : internalIsOpen;

  const closeDropdown = () => {
    if (controlled) {
      onToggle?.(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (controlled) {
      onToggle?.(!dropdownOpen);
    } else {
      setInternalIsOpen((previous) => !previous);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [controlled, onToggle]);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="reusable-dropdown"
        onClick={handleToggle}
        aria-expanded={dropdownOpen}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={16} />
      </button>

      {dropdownOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className="dropdown-option"
              onClick={() => {
                onChange?.(option.value);
                closeDropdown();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
