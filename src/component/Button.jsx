
import "../component/Button.css";

function Button({
  children,
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}git 
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
