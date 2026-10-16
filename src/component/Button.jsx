
import "../styles/Button.css";

function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  type="button"
}) {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
