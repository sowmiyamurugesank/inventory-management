
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import WarehouseTabs from "../component/WarehouseTabs.jsx";
import WarehouseTypeForm from "../component/WarehouseTypeForm.jsx";

import "../styles/WarehouseType.css";

const API_URL = "http://localhost:5000/api/warehouses";

const TABS = [
  "Warehouse",
  "Warehouse Type",
  "Zone",
  "Zone Type",
];

const COLUMNS = [
  { key: "warehouseType", label: "Warehouse Type", editable: true },
  { key: "typeCode", label: "Type Code", editable: true },
  { key: "category", label: "Category", editable: true },
  { key: "status", label: "Status", editable: false },
];

const FILTER_FIELDS = [
  { key: "warehouseType", label: "Warehouse Type" },
  { key: "typeCode", label: "Type Code" },
  { key: "category", label: "Category" },
];

function normalizeWarehouse(row) {
  const type =
    row.warehouseType ??
    row.warehouse_type ??
    row.type;

  const typeObject =
    typeof type === "object" && type !== null
      ? type
      : {};

  return {
    ...row,
    name:
      row.name ??
      row.warehouseName ??
      row.warehouse_name ??
      "",
    status:
      row.status ??
      row.warehouseStatus ??
      "",
    warehouseType:
      (typeof type === "string" ? type : "") ||
      typeObject.name ||
      typeObject.typeName ||
      row.typeName ||
      "",
    typeCode:
      row.typeCode ??
      row.type_code ??
      typeObject.code ??
      "",
    category:
      row.category ??
      typeObject.category ??
      "",
  };
}

function WarehouseType() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    warehouseType: "",
    typeCode: "",
    category: "",
  });

  async function loadWarehouses() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load warehouse data.");
    }

    const data = await response.json();

    const rows = Array.isArray(data)
      ? data
      : data.warehouses;

    if (!Array.isArray(rows)) {
      throw new Error("Invalid warehouse data.");
    }

    setWarehouses(rows.map(normalizeWarehouse));
  }

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        await loadWarehouses();
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const filteredWarehouses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return warehouses.filter((row) => {
      const matchesSearch =
        !query ||
        COLUMNS.some(({ key }) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(query)
        );

      const matchesFilters = FILTER_FIELDS.every(({ key }) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(filters[key].trim().toLowerCase())
      );

      return matchesSearch && matchesFilters;
    });
  }, [warehouses, search, filters]);

  function clearFilters() {
    setSearch("");
    setFilters({
      warehouseType: "",
      typeCode: "",
      category: "",
    });
  }

  async function saveWarehouseType(formData) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
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
          result.message || "Unable to save warehouse type."
        );
      }

      await loadWarehouses();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWarehouseType(id, updatedRow) {
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
        body: JSON.stringify({
          warehouseType: updatedRow.warehouseType,
          typeCode: updatedRow.typeCode,
          category: updatedRow.category,
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to update warehouse type."
      );
    }

    const updatedRecord = result.warehouse ?? result;

    setWarehouses((previous) =>
      previous.map((row) =>
        String(row.id ?? row._id) === String(id)
          ? normalizeWarehouse({
              ...row,
              ...updatedRecord,
              warehouseType:
                updatedRecord.warehouseType ??
                updatedRecord.warehouse_type ??
                updatedRow.warehouseType,
              typeCode:
                updatedRecord.typeCode ??
                updatedRecord.type_code ??
                updatedRow.typeCode,
              category:
                updatedRecord.category ??
                updatedRow.category,
            })
          : row
      )
    );
  }

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

  return (
    <main className="warehouse-type-page">
      <section className="warehouse-type-section">
        <button
          type="button"
          className="warehouse-type-back-arrow"
          onClick={() => navigate("/storage")}
          aria-label="Back to Storage"
          title="Back to Storage"
        >
          <ArrowLeft />
        </button>

        <h2 className="warehouse-type-heading">
          Warehouse Management
        </h2>

        <WarehouseTabs
          tabs={TABS}
          activeTab={1}
          setActiveTab={handleTabChange}
        />

        <div className="warehouse-type-toolbar">
          <div className="warehouse-type-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search warehouse type..."
            />
          </div>

          <Button
            type="button"
            className={`warehouse-filter-btn ${
              showFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowFilters((value) => !value)
            }
          >
            <SlidersHorizontal size={16} />
            Filter
          </Button>

          <Button
            type="button"
            className="add-warehouse-type-btn"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            + Add Warehouse Type
          </Button> 
        </div>

        {showFilters && (
          <div className="warehouse-type-filter-panel">
            {FILTER_FIELDS.map(({ key, label }) => (
              <div
                className="warehouse-type-filter-field"
                key={key}
              >
                <label htmlFor={`filter-${key}`}>
                  {label}
                </label>

                <input
                  id={`filter-${key}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={filters[key]}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <Button
              type="button"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        )}

        {error && (
          <p className="warehouse-type-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="warehouse-type-message">
            Loading warehouse types...
          </p>
        ) : (
          <StorageTable
            warehouses={filteredWarehouses}
            columns={COLUMNS}
            onUpdate={handleUpdateWarehouseType}
            showSerial
          />
        )}

        {showForm && (
          <WarehouseTypeForm
            onSave={saveWarehouseType}
            onClose={() => {
              if (!saving) {
                setShowForm(false);
              }
            }}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}

export default WarehouseType;
