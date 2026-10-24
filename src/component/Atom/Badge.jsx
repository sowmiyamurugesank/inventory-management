import "../../styles/Badge.css"
function Badge({ children, type = "default" }) {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
}

export default Badge;
