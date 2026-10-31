
import {
  Search,
  Bell,
  UserRound,
  ChevronDown,
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
} from "lucide-react";

import { useLocation } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
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

  const activeItem =
    menuItems.find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
    ) || menuItems[0];

  const ActiveIcon = activeItem.icon;

  return (
    <header className="app-header">
      <div className="header-page-title">
        <ActiveIcon className="page-title-icon" />
        <h2>{activeItem.name}</h2>
      </div>

      <div className="header-search">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search products, categories, suppliers..."
        />
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-icon"
          aria-label="Notifications"
        >
          <Bell />
        </button>

        <div className="header-profile">
          <div className="profile-avatar">
            <UserRound />
          </div>
          <span>Admin</span>
          <ChevronDown className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Header;
