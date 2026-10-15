
import {
  Search,
  Bell,
  UserRound,
  ChevronDown,
} from "lucide-react";

import "../styles/Header.css";

function Header() {
  return (
    <header className="app-header">
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