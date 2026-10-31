
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import WarehouseTypeForm from "../component/WarehouseTypeForm.jsx";

import "../styles/WarehouseType.css";

const API_URL = "http://localhost:5000/api/warehouse-types";

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
return {
...row,

id: row.id,

warehouseType:
  row.name ??
  row.warehouseType ??
  row.warehouse_type ??
  "",

typeCode:
  row.code ??
  row.typeCode ??
  row.type_code ??
  "",

category:
  row.facility_category ??
  row.category ??
  "",

status:
  row.status ??
  (row.is_active ? "active" : "inactive"),

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

const result = await response.json().catch(() => ({}));

if (!response.ok || result.success !== true) {
throw new Error(
result.error || "Unable to load warehouse types."
);
}

if (!Array.isArray(result.data)) {
throw new Error("Invalid warehouse type response.");
}

setWarehouses(result.data.map(normalizeWarehouse));
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
    // Map each dropdown label to its corresponding database value.

const FACILITY_CATEGORY_MAP = {
  "General Warehouse": "GENERAL_WAREHOUSE",
  "Distribution Center": "DISTRIBUTION_CENTER",
  "Cold Storage": "COLD_STORAGE",
  "Raw Materials": "RAW_MATERIALS",
  "Finished Goods": "FINISHED_GOODS",
};



    const facilityCategory = FACILITY_CATEGORY_MAP[formData.category];

    // Prepare the request payload for the backend.
    const payload = {
      code: formData.typeCode?.trim(),

      code_int:
        formData.numericCode === "" || formData.numericCode == null
          ? null
          : Number(formData.numericCode),

      name: formData.warehouseType?.trim(),

      description: formData.description?.trim() || null,

      facility_category: facilityCategory,

      is_active: Boolean(formData.status),

      custom_attributes: {
        available_for_selection: Boolean(
          formData.availableForSelection
        ),
      },
    };

    // Validate required fields.
    if (!payload.code || !payload.name) {
      throw new Error(
        "Type Code and Warehouse Type Name are required."
      );
    }

    if (!payload.facility_category) {
      throw new Error("Please select a valid Facility Category.");
    }

    // Send the new warehouse type to the backend.
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error ||
          result.message ||
          "Unable to save warehouse type."
      );
    }

    // Refresh the table with the latest database records.
    await loadWarehouses();

    // Close the form after a successful save.
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
    throw new Error("Warehouse Type ID is missing.");
  }

  setError("");

  try {
    // Find the original warehouse type record.
    const existingWarehouse = warehouses.find(
      (row) => String(row.id) === String(id)
    );

    if (!existingWarehouse) {
      throw new Error("Warehouse type not found. Please refresh.");
    }

    // Map frontend field names to PostgreSQL field names.
    const payload = {
      name: String(updatedRow.warehouseType ?? "").trim(),
      code: String(updatedRow.typeCode ?? "").trim(),
      facility_category: updatedRow.category,
      version: existingWarehouse.version,
    };

    if (!payload.name) {
      throw new Error("Warehouse type name cannot be empty.");
    }

    if (!payload.code) {
      throw new Error("Type code cannot be empty.");
    }

    if (!payload.facility_category) {
      throw new Error("Category cannot be empty.");
    }

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error ||
          result.message ||
          "Unable to update warehouse type."
      );
    }

    if (!result.data) {
      throw new Error("The server did not return the updated record.");
    }

    // Normalize the updated database record.
    const updatedWarehouse = normalizeWarehouse(result.data);

    // Update the table with the latest database values.
    setWarehouses((previous) =>
      previous.map((row) =>
        String(row.id) === String(id)
          ? updatedWarehouse
          : row
      )
    );

  } catch (err) {
    setError(err.message || "Unable to update warehouse type.");
    throw err;
  }
}

async function handleDeleteWarehouseType(id) {
  if (!id) {
    setError("Warehouse type ID is missing.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this warehouse type?"
  );

  if (!confirmed) return;

  setError("");

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error ||
          result.message ||
          "Unable to delete warehouse type."
      );
    }

    // Remove the deleted warehouse type from the displayed list.
    setWarehouses((previous) =>
      previous.filter((row) => String(row.id) !== String(id))
    );
  } catch (err) {
    setError(err.message || "Unable to delete warehouse type.");
  }
}



  return (
    <main className="warehouse-type-page">
      <section className="warehouse-type-section">
        <h2 className="warehouse-type-heading">
          Warehouse Management
        </h2>

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
            onClick={() => setShowFilters((value) => !value)}
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

            <Button type="button" onClick={clearFilters}>
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
  onDelete={handleDeleteWarehouseType}
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