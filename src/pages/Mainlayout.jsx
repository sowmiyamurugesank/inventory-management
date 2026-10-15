import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../styles/MainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />

      <div className="main-area">
        <Header />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;