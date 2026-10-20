
import { useState } from "react";
import {
  Warehouse,
  Package,
  PackagePlus,
  PackageMinus,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import WarehouseLocation from "./WarehouseLocation.jsx";
import IncomingStock from "./IncomingStock.jsx";
import "../styles/Storage.css";
import OutgoingStock from "./OutgoingStock.jsx";

function Storage() {
  const [activeTab, setActiveTab] = useState("Warehouse");

  const tabs = [
    "Warehouse",
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
            type="button"
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

      {activeTab === "Warehouse" && (
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
      )}

      <div className="storage-content">
        {activeTab === "Warehouse" && (
          <WarehouseLocation />
        )}

        {activeTab === "Incoming Stock" && (
          <IncomingStock />
        )}
           
           {activeTab === "Outgoing Stock" && (<OutgoingStock />)}
       
      </div>
    </div>
  );
}

export default Storage;
