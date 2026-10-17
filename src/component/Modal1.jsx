
import Button from "./Button.jsx";
import "../styles/Modal.css";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <Button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            ✕
          </Button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
