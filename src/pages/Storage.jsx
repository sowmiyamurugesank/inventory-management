
import { useState } from "react";
import {
  Warehouse,
  Package,
  PackagePlus,
  PackageMinus,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import WarehouseLocation from "./WarehouseLocation.jsx";
import "../styles/Storage.css";

function Storage() {
  const [activeTab, setActiveTab] = useState("Warehouse Location");

  const tabs = [
    "Warehouse Location",
    "Stock Overview",
    "Incoming Stock",
    "Outgoing Stock",
  ];

  return (
    <div className="storage-page">
  
       <div className="storage-heading">
        <div className="storage-heading-icon">
          <Warehouse />
        </div>

        <div className="storage-heading-text">
          <h2>Storage Management</h2>
        </div>
      </div>

     
      <div className="storage-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "storage-tab active"
                : "storage-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

     
      <div className="storage-summary">
        <StatCard
          title="Total Warehouses"
          value="0"
          icon={<Warehouse />}
        />

        <StatCard
          title="Total Stock"
          value="0"
          icon={<Package />}
        />

        <StatCard
          title="Incoming Stock"
          value="0"
          icon={<PackagePlus />}
        />

        <StatCard
          title="Outgoing Stock"
          value="0"
          icon={<PackageMinus />}
        />
      </div>

     
      <div className="storage-content">
        {activeTab === "Warehouse Location" && (
          <WarehouseLocation />
        )}

        {activeTab === "Stock Overview" && (
          <>
            <h3>Stock Overview</h3>
            <p>View current stock and stock status here.</p>
          </>
        )}

        {activeTab === "Incoming Stock" && (
          <>
            <h3>Incoming Stock</h3>
            <p>Manage incoming stock from suppliers here.</p>
          </>
        )}

        {activeTab === "Outgoing Stock" && (
          <>
            <h3>Outgoing Stock</h3>
            <p>Manage outgoing stock and dispatches here.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Storage;
