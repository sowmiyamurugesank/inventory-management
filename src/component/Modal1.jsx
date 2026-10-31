import { useEffect } from "react";
import Button from "./Button.jsx";
import "../styles/Modal1.css";

function Modal({
  isOpen,
  onClose,
  onSave,
  children,
  closeOnOutsideClick = false,
  closeOnEnter = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (closeOnEnter && e.key === "Enter") {
        const target = e.target;

        if (
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.type === "submit" ||
          target.tagName === "SELECT"
        ) {
          return;
        }

        if (target.tagName === "INPUT") {
          e.preventDefault();
          onSave?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSave, closeOnEnter]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onSave?.();
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <Button
            type="button"
            onClick={onClose}
            className="product-modal-cross"
          >
            ×
          </Button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;