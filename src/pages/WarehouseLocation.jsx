
import { useEffect, useState } from "react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import AddWarehouse from "../component/AddWarehouse.jsx";

import "../styles/WarehouseLocation.css";

const API_URL = "http://localhost:5000/api/warehouses";

function WarehouseLocation() {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchWarehouses() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }

      const data = await response.json();

      setWarehouses(
        Array.isArray(data) ? data : data.warehouses || []
      );
    } catch (error) {
      console.error("Warehouse fetch error:", error);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const text = `${warehouse.name || ""} ${
      warehouse.code || ""
    } ${warehouse.location || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  function handleAddWarehouse() {
    setShowAddWarehouse(true);
  }

  async function handleSaveWarehouse(formData) {
    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add warehouse");
      }

      const data = await response.json();
      const newWarehouse = data.warehouse || data;

      setWarehouses((previous) => [
        ...previous,
        newWarehouse,
      ]);

      setShowAddWarehouse(false);
      window.alert("Warehouse added successfully!");
    } catch (error) {
      console.error("Add warehouse error:", error);
      window.alert("Unable to add warehouse. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setWarehouses((previous) =>
        previous.filter((warehouse) => warehouse.id !== id)
      );
    } catch (error) {
      console.error("Delete error:", error);
      window.alert("Unable to delete warehouse.");
    }
  }

  return (
    <main className="warehouse-page">
      <section className="warehouse-section">
        <h2 className="warehouse-heading">
          Warehouse
        </h2>

        <div className="warehouse-toolbar">
          <div className="warehouse-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search warehouse..."
            />
          </div>

          <Button
            type="button"
            className="add-warehouse-btn"
            onClick={handleAddWarehouse}
          >
            + Add Warehouse
          </Button>
        </div>

        {loading ? (
          <p className="warehouse-message">
            Loading warehouses...
          </p>
        ) : (
          <StorageTable
            warehouses={filteredWarehouses}
            onDelete={handleDelete}
          />
        )}

        {showAddWarehouse && (
          <AddWarehouse
            onClose={() => setShowAddWarehouse(false)}
            onSave={handleSaveWarehouse}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}

export default WarehouseLocation;
