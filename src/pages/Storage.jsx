import { useState } from "react";
import {
  Warehouse,
  Package,
  PackagePlus,
  PackageMinus,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import WarehouseLocation from "./WarehouseLocation.jsx";
import WarehouseType from "./WarehouseType.jsx";
import Zone from "./Zone.jsx";
import ZoneType from "./ZoneType.jsx";
import IncomingStock from "./IncomingStock.jsx";
import OutgoingStock from "./OutgoingStock.jsx";
import WarehouseInventory from "./Warehouse Inventory.jsx";
import DamagedGoods from "./DamagedGoods.jsx";

import "../styles/Storage.css";

const tabs = [
  "Warehouse",
  "Incoming Stock",
  "Outgoing Stock",
  "Warehouse Inventory",
  "Damaged Goods",
];

const warehouseTabs = [
  "Warehouse Type",
  "Warehouse",
  "Zone Type",
  "Zone",
];

function Storage() {
  const [activeTab, setActiveTab] = useState("Warehouse");
  const [activeWarehouseTab, setActiveWarehouseTab] =
    useState("Warehouse");

  return (
    <div className="storage-page">
      <div className="storage-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`storage-tab ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Warehouse" && (
        <>
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
            <div className="warehouse-tabs">
              {warehouseTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`warehouse-tab ${
                    activeWarehouseTab === tab ? "active" : ""
                  }`}
                  onClick={() => setActiveWarehouseTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeWarehouseTab === "Warehouse Type" && (
              <WarehouseType />
            )}

            {activeWarehouseTab === "Warehouse" && (
              <WarehouseLocation />
            )}

            {activeWarehouseTab === "Zone Type" && (
              <ZoneType />
            )}

            {activeWarehouseTab === "Zone" && <Zone />}
          </div>
        </>
      )}

      {activeTab === "Incoming Stock" && (
        <div className="storage-content">
          <IncomingStock />
        </div>
      )}

      {activeTab === "Outgoing Stock" && (
        <div className="storage-content">
          <OutgoingStock />
        </div>
      )}

      {activeTab === "Warehouse Inventory" && (
        <div className="storage-content">
          <WarehouseInventory />
        </div>
      )}

      {activeTab === "Damaged Goods" && (
        <div className="storage-content">
          <DamagedGoods />
        </div>
      )}
    </div>
  );
}

export default Storage;