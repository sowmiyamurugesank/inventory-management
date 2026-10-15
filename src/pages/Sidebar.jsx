
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ReceiptText,
  Users,
  Wallet,
  Palette,
  Truck,
  ChartNoAxesCombined,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../styles/Sidebar.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
    { name: "Products", path: "/products", icon: Package },
    { name: "Storage", path: "/storage", icon: Warehouse },
    { name: "Billing", path: "/billing", icon: ReceiptText },
    { name: "Parties", path: "/parties", icon: Users },
    { name: "Income & Expense", path: "/income-expense", icon: Wallet },
    { name: "Design", path: "/design", icon: Palette },
    { name: "Transport", path: "/transport", icon: Truck },
    { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
    { name: "Activity Log", path: "/activity-log", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
        title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={22} />
        ) : (
          <ChevronLeft size={22} />
        )}
      </button>

      {!collapsed && (
        <>
          <h2 className="sidebar-title">
            Inventory
            <br />
            Management
          </h2>
          <div className="sidebar-divider" />
        </>
      )}

      <nav className="sidebar-menu">
        {menuItems.map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            title={collapsed ? name : undefined}
            className="sidebar-link"
          >
            <Icon className="sidebar-icon" size={21} />
            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
