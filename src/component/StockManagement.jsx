import { useState } from "react";

import DataTable from "./DataTable";
import Button from "./Button";
import Dropdown from "./Dropdown";

function StockManagement() {
  // Stock filter states
  const [stockCategory, setStockCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  // Stock table columns
  const stockColumns = [
    { key: "name", label: "Product" },
    { key: "availableStock", label: "Available Stock" },
    { key: "reorderLevel", label: "Reorder Level" },
    { key: "status", label: "Status" },
  ];

  return (
    <>
      {/* Stock Management Header */}
      <div className="stock-header">
        <h3>Stock Management</h3>
      </div>

      {/* Stock Filters */}
      <div className="stock-filters">
        <Dropdown
          options={[
            { value: "all", label: "All Categories" },
            { value: "electronics", label: "Electronics" },
            { value: "furniture", label: "Furniture" },
            { value: "stationery", label: "Stationery" },
          ]}
          value={stockCategory}
          onChange={setStockCategory}
          placeholder="All Categories"
        />

        <Dropdown
          options={[
            { value: "all", label: "All Status" },
            { value: "in-stock", label: "In Stock" },
            { value: "low-stock", label: "Low Stock" },
            { value: "out-of-stock", label: "Out of Stock" },
          ]}
          value={stockStatus}
          onChange={setStockStatus}
          placeholder="All Status"
        />
      </div>

      {/* Stock Table */}
      <DataTable
        columns={stockColumns}
        data={[]}
        actions={() => <Button>View</Button>}
      />
    </>
  );
}

export default StockManagement;