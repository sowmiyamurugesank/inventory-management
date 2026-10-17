
import { useEffect, useState } from "react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";

import "../styles/WarehouseLocation.css";

const API_URL = "http://localhost:5000/api/warehouses";

function WarehouseLocation() {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchWarehouses();
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const text = `${warehouse.name || ""} ${
      warehouse.code || ""
    } ${warehouse.location || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

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

  function handleAddWarehouse() {
    console.log("Add Warehouse clicked");
  }

  return (
    <main className="warehouse-page">
      <section className="warehouse-section">
        <h2 className="warehouse-heading">
          Warehouse Locations
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
      </section>
    </main>
  );
}

export default WarehouseLocation;
