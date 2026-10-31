
function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <h3>{title}</h3>
        <p>{value}</p>

        {subtitle && (
          <p className="stat-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;