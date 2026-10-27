
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Pagination from "../component/Pagination.jsx";
import Button from "../component/Button.jsx";
import AddWarehouse from "../component/AddWarehouse.jsx";

import "../styles/WarehouseLocation.css";

const API_URL = "http://localhost:5000/api/warehouses";
const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  { key: "name", label: "Warehouse", editable: true },
  { key: "location", label: "Location", editable: true },
  { key: "capacity", label: "Capacity", editable: true, type: "number" },
  { key: "status", label: "Status", editable: false },
];

const FILTER_FIELDS = [
  { key: "name", label: "Warehouse Name" },
  { key: "capacity", label: "Capacity" },
];

const INITIAL_FILTERS = {
  name: "",
  capacity: "",
};

function getWarehouseList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.warehouses)) return data.warehouses;
  if (Array.isArray(data?.data)) return data.data;

  throw new Error("Invalid warehouse data.");
}

function normalizeWarehouse(row) {
  return {
    ...row,
    name: row.name ?? row.warehouseName ?? row.warehouse_name ?? "",
    location: row.location ?? row.address ?? row.city ?? "",
    capacity:
      row.capacity ??
      row.maxCapacity ??
      row.max_capacity ??
      row.capacityPercentage ??
      row.capacity_percentage ??
      "",
    status: row.status ?? row.warehouseStatus ?? "Active",
  };
}

function WarehouseLocation() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

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
          throw new Error("Unable to load warehouse data.");
        }

        const result = await response.json();

        setWarehouses(getWarehouseList(result).map(normalizeWarehouse));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load warehouse data.");
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

  const filteredWarehouses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return warehouses.filter((row) => {
      const matchesSearch =
        !query ||
        COLUMNS.some(({ key }) =>
          String(row[key] ?? "").toLowerCase().includes(query)
        );

      const matchesFilters = FILTER_FIELDS.every(({ key }) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(filters[key].trim().toLowerCase())
      );

      return matchesSearch && matchesFilters;
    });
  }, [warehouses, search, filters]);

  const totalPages = Math.ceil(
    filteredWarehouses.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentWarehouses = filteredWarehouses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changeFilter(key, value) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setFilters({ ...INITIAL_FILTERS });
    setPage(1);
  }

  async function saveWarehouse(formData) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to save warehouse.");
      }

      const savedWarehouse = result.warehouse ?? result.data;

      if (savedWarehouse && typeof savedWarehouse === "object") {
        setWarehouses((previous) => [
          ...previous,
          normalizeWarehouse(savedWarehouse),
        ]);
      } else {
        const refresh = await fetch(API_URL);

        if (!refresh.ok) {
          throw new Error("Warehouse saved, but refresh failed.");
        }

        setWarehouses(
          getWarehouseList(await refresh.json()).map(normalizeWarehouse)
        );
      }

      setShowForm(false);
      setPage(1);
    } catch (err) {
      setError(err.message || "Unable to save warehouse.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWarehouse(id, updatedRow) {
    if (id == null || id === "") {
      throw new Error("Warehouse ID is missing.");
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRow),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to update warehouse.");
      }

      const updatedRecord = result.warehouse ?? result.data ?? result;

      setWarehouses((previous) =>
        previous.map((row) =>
          String(row.id ?? row._id) === String(id)
            ? normalizeWarehouse({ ...row, ...updatedRecord })
            : row
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update warehouse.");
      throw err;
    }
  }

  async function handleDeleteWarehouse(id) {
    if (id == null || id === "") {
      setError("Warehouse ID is missing.");
      return;
    }

    if (!window.confirm("Delete this warehouse?")) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete warehouse.");
      }

      setWarehouses((previous) =>
        previous.filter(
          (row) => String(row.id ?? row._id) !== String(id)
        )
      );

      setPage(1);
    } catch (err) {
      setError(err.message || "Unable to delete warehouse.");
    }
  }

  return (
    <main className="warehouse-page">
      <section className="warehouse-section">
          <h2 className="warehouse-heading">
            Warehouse Management</h2>
        <div className="warehouse-toolbar">
          <div className="warehouse-search">
            <SearchBox
              value={search}
              onChange={changeSearch}
              placeholder="Search warehouse..."
            />
          </div>

          <div className="warehouse-toolbar-actions">
            <Button
              type="button"
              className={`warehouse-filter-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((value) => !value)}
            >
              <SlidersHorizontal/>
              <span>Filters</span>
              <ChevronDown
                className={showFilters ? "warehouse-chevron-open" : ""}
              />
            </Button>

            <Button
              type="button"
              className="add-warehouse-btn"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
            >
              + Add Warehouse
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="warehouse-filter-panel">
            {FILTER_FIELDS.map(({ key, label }) => (
              <div className="warehouse-filter-field" key={key}>
                <label htmlFor={`warehouse-filter-${key}`}>{label}</label>
                <input
                  id={`warehouse-filter-${key}`}
                  className="warehouse-filter-input"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={filters[key]}
                  onChange={(event) => changeFilter(key, event.target.value)}
                />
              </div>
            ))}

            <Button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              <RotateCcw/>
              Reset
            </Button>
          </div>
        )}
        <div className="warehouse-table-wrapper">
          <StorageTable
            warehouses={currentWarehouses}
            columns={COLUMNS}
            onUpdate={handleUpdateWarehouse}
            onView={(row) => console.log("View warehouse:", row)}
            onDelete={handleDeleteWarehouse}
            showSerial
            emptyMessage={
              loading ? "Loading warehouses..." : "No warehouse records found."
            }
          />

          {!loading && !error && (
            <div className="warehouse-stock-footer">
              <span className="pagination-info">
                Showing {filteredWarehouses.length === 0 ? 0 : startIndex + 1}
                {" - "}
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredWarehouses.length
                )}{" "}
                of {filteredWarehouses.length} records
              </span>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        {showForm && (
          <AddWarehouse
            onSave={saveWarehouse}
            onClose={() => {
              if (!saving) setShowForm(false);
            }}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}

export default WarehouseLocation;
