function StatCard(props) {
    return (
        <div className="stat-card">
            <div className="stat-icon">
                {props.icon}
            </div>
            <div className="stat-content">
                <h3>{props.title}</h3>
                <p>{props.value}</p>
            </div>
        </div>
    );
}

export default StatCard;