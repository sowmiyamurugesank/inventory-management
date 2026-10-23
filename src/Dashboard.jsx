import {Package,AlertTriangle,PackageX,ClipboardCheck,ClipboardList,Activity} from "lucide-react";
import StatCard from "./StatCard";
import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard">
            <section className="dashboard-section overview-section">
                <h2>Overview</h2>
                <div className="card-container">
                    <StatCard
                        title="Total Products"
                        value="0"
                        icon={<Package />}
                    />
                    <StatCard
                        title="Low Stock"
                        value="0"
                        icon={<AlertTriangle />}
                    />
                    <StatCard
                        title="Out of Stock"
                        value="0"
                        icon={<PackageX />}
                    />
                    <StatCard
                        title="Pending Approvals"
                        value="0"
                        icon={<ClipboardCheck />}
                    />
                </div>
            </section>
            <div className="dashboard-grid">
                <section className="dashboard-box">
                    <h2>Stock Summary</h2>
                    <div className="stock-summary">
                    <div className="stock-item">
                    <div className="summary-icon">
                    <Package />
                    </div>
                        <h4>In Stock</h4>
                        <strong>0</strong>
                        </div>
                        <div className="stock-item">
                            <div className="summary-icon">
                                <AlertTriangle />
                            </div>
                            <h4>Low Stock</h4>
                            <strong>0</strong>
                        </div>
                        <div className="stock-item">
                            <div className="summary-icon">
                                <PackageX />
                            </div>
                            <h4>Out of Stock</h4>
                            <strong>0</strong>
                        </div>
                    </div>
                </section>
                <section className="dashboard-box">
                    <h2>Pending Approvals</h2>
                    <div className="empty-state">
                        <ClipboardList />
                        <p>No pending approvals</p>
                    </div>
                </section>
            </div>
            <section className="dashboard-box activity-section">
                <h2>Recent Activity</h2>
                <div className="empty-state">
                    <Activity />
                    <p>No recent activity</p>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;