
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import WarehouseTabs from "../component/WarehouseTabs.jsx";
import AddWarehouse from "../component/AddWarehouse.jsx";

import "../styles/WarehouseLocation.css";

const API_URL = "http://localhost:5000/api/warehouses";

const TABS = [
  "Warehouse",
  "Warehouse Type",
  "Zone",
  "Zone Type",
];

const COLUMNS = [
  { key: "name", label: "Warehouse", editable: true },
  { key: "location", label: "Location", editable: true },
  {
    key: "capacity",
    label: "Capacity",
    editable: true,
    type: "number",
  },
  { key: "status", label: "Status", editable: false },
];

function WarehouseLocation() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterWarehouseName, setFilterWarehouseName] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load warehouse data
  useEffect(() => {
    const controller = new AbortController();

    async function loadWarehouses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server status: ${response.status}`);
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : data.warehouses;

        if (!Array.isArray(list)) {
          throw new Error("Invalid warehouse data.");
        }

        setWarehouses(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Unable to load warehouses. Check your backend connection."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWarehouses();

    return () => controller.abort();
  }, []);

  // Navigate between warehouse tabs
  function handleTabChange(index) {
    const paths = [
      "/storage/warehouse",
      "/storage/warehouse-type",
      "/storage/zone",
      "/storage/zone-type",
    ];

    if (paths[index]) {
      navigate(paths[index]);
    }
  }

  // Search and filter warehouses
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const capacity =
      warehouse.capacity ??
      warehouse.capacityPercentage ??
      warehouse.capacity_percentage ??
      warehouse.maxCapacity ??
      warehouse.max_capacity ??
      "";

    const searchableText = [
      warehouse.name,
      warehouse.code,
      warehouse.location,
      warehouse.city,
      warehouse.locationCode,
      capacity,
      warehouse.status,
    ]
      .filter((value) => value != null && value !== "")
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.trim().toLowerCase()
    );

    const matchesName = String(warehouse.name ?? "")
      .toLowerCase()
      .includes(filterWarehouseName.trim().toLowerCase());

    const matchesCapacity = String(capacity)
      .toLowerCase()
      .includes(filterCapacity.trim().toLowerCase());

    return matchesSearch && matchesName && matchesCapacity;
  });

  // Reload warehouses after adding a record
  async function reloadWarehouses() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to refresh warehouse data.");
    }

    const data = await response.json();
    const list = Array.isArray(data)
      ? data
      : data.warehouses;

    if (!Array.isArray(list)) {
      throw new Error("Invalid warehouse data.");
    }

    setWarehouses(list);
  }

  // Add a new warehouse
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
        throw new Error(
          result.message || `Server status: ${response.status}`
        );
      }

      await reloadWarehouses();
      setShowAddWarehouse(false);
    } catch (err) {
      setError(err.message || "Unable to add warehouse.");
    } finally {
      setSaving(false);
    }
  }

  // UPDATE: Save inline-edited warehouse to the backend
  async function handleUpdateWarehouse(id, updatedWarehouse) {
    if (id == null || id === "") {
      throw new Error("Warehouse ID is missing.");
    }

    setError("");

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedWarehouse),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to update warehouse."
      );
    }

    // Support either a direct record or { warehouse: record } response.
    const updatedRecord = result.warehouse ?? result;

    setWarehouses((previous) =>
      previous.map((warehouse) =>
        String(warehouse.id ?? warehouse._id) === String(id)
          ? { ...warehouse, ...updatedRecord }
          : warehouse
      )
    );
  }

  // Delete a warehouse
  async function handleDelete(id) {
    if (id == null || id === "") {
      setError("Warehouse ID is missing.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this warehouse?"
      )
    ) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete warehouse."
        );
      }

      setWarehouses((previous) =>
        previous.filter(
          (warehouse) =>
            String(warehouse.id ?? warehouse._id) !== String(id)
        )
      );
    } catch (err) {
      setError(err.message || "Unable to delete warehouse.");
    }
  }

  // Clear all search and filter values
  function clearFilters() {
    setSearch("");
    setFilterWarehouseName("");
    setFilterCapacity("");
  }

  return (
    <main className="warehouse-page">
      <section className="warehouse-section">
        <button
          type="button"
          className="warehouse-back-arrow"
          onClick={() => navigate("/storage")}
          aria-label="Back to Storage"
          title="Back to Storage"
        >
          <ArrowLeft />
        </button>

        <h2 className="warehouse-heading">
          Warehouse Management
        </h2>

        <WarehouseTabs
          tabs={TABS}
          activeTab={0}
          setActiveTab={handleTabChange}
        />

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
            className={`filter-btn ${showFilters ? "active" : ""}`}
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
          >
            <SlidersHorizontal size={16} />
            Filter
          </Button>

          <Button
            type="button"
            className="add-warehouse-btn"
            onClick={() => {
              setError("");
              setShowAddWarehouse(true);
            }}
          >
            + Add Warehouse
          </Button>
        </div>

        {showFilters && (
          <div className="warehouse-filter-panel">
            <div className="warehouse-filter-field">
              <label htmlFor="filter-warehouse-name">
                Warehouse Name
              </label>

              <input
                id="filter-warehouse-name"
                type="text"
                value={filterWarehouseName}
                onChange={(event) =>
                  setFilterWarehouseName(event.target.value)
                }
                placeholder="Enter warehouse name"
                className="warehouse-filter-input"
              />
            </div>

            <div className="warehouse-filter-field">
              <label htmlFor="filter-capacity">
                Capacity
              </label>

              <input
                id="filter-capacity"
                type="text"
                value={filterCapacity}
                onChange={(event) =>
                  setFilterCapacity(event.target.value)
                }
                placeholder="Enter capacity"
                className="warehouse-filter-input"
              />
            </div>

            <Button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        )}

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
            columns={COLUMNS}
            onUpdate={handleUpdateWarehouse}
            onView={(warehouse) => {
              console.log("View warehouse:", warehouse);
            }}
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
