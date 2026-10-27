
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
  const [error, setError] = useState("");


  useEffect(() => {
    const controller = new AbortController();

    async function fetchWarehouses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load warehouses. Server status: ${response.status}`
          );
        }

        const result = await response.json();

if (!result.success || !Array.isArray(result.data)) {
  throw new Error(
    result.error || "Backend did not return a warehouse array."
  );
}

setWarehouses(result.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Warehouse fetch error:", err);
          setError(
            err.message || "Unable to load warehouses."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWarehouses();

    return () => controller.abort();
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchableText = [
      warehouse.name,
      warehouse.code,
      warehouse.location,
      warehouse.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.trim().toLowerCase());
  });

  function handleAddWarehouse() {
    setShowAddWarehouse(true);
  }

  async function handleSaveWarehouse(formData) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
  console.error("Warehouse creation failed:", result);

  throw new Error(
    result.error ||
      result.message ||
      `Failed to add warehouse (${response.status})`
  );
}

      if (!result.success || !result.data) {
  throw new Error(
    result.error || "Backend did not return the created warehouse."
  );
}

const newWarehouse = result.data;

      setWarehouses((previous) => [
        ...previous,
        newWarehouse,
      ]);

      setShowAddWarehouse(false);
      window.alert("Warehouse added successfully!");
    } catch (err) {
      console.error("Add warehouse error:", err);
      setError(err.message || "Unable to add warehouse.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (id === undefined || id === null || id === "") {
      setError("Warehouse ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to delete warehouse (${response.status})`
        );
      }

      setWarehouses((previous) =>
        previous.filter(
          (warehouse) =>
            String(warehouse.id ?? warehouse._id) !== String(id)
        )
      );
    } catch (err) {
      console.error("Delete warehouse error:", err);
      setError(err.message || "Unable to delete warehouse.");
    }
  }

  return (
    <main className="warehouse-page">
      <section className="warehouse-section">
        <h2 className="warehouse-heading">Warehouse</h2>

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

        {error && (
          <p className="warehouse-message" role="alert">
            {error}
          </p>
        )}

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
            onClose={() => {
              if (!saving) {
                setShowAddWarehouse(false);
              }
            }}
            onSave={handleSaveWarehouse}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}

export default WarehouseLocation;
