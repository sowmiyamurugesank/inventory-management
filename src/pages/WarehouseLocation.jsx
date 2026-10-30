
import { useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
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
  {
    key: "location",
    label: "Location",
    editable: true,
    editKey: "address_line_1",
  },
  {
    key: "capacity",
    label: "Capacity",
    editable: true,
    type: "number",
  },
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
  const attributes = row.custom_attributes ?? {};

  const locationParts = [
    attributes.address_line_1,
    attributes.address_line_2,
    attributes.city,
    attributes.state,
    attributes.country,
    attributes.postal_code,
  ];

  const location = locationParts
    .filter(
      (part) =>
        part !== null &&
        part !== undefined &&
        String(part).trim() !== ""
    )
    .join(", ");

  const totalCapacity = row.total_capacity ?? row.totalCapacity;
  const capacityUnit = row.capacity_unit ?? row.capacityUnit ?? "";

  return {
    ...row,

    id: row.id ?? row._id,

    name: row.name ?? row.warehouseName ?? row.warehouse_name ?? "",

    location: location || "—",

    capacity:
      totalCapacity !== null &&
      totalCapacity !== undefined &&
      totalCapacity !== ""
        ? Number(totalCapacity)
        : "",

    capacityUnit,

    status:
      row.status ??
      row.warehouseStatus ??
      (row.is_active === false ? "inactive" : "active"),
  };
}


function WarehouseLocation() {
  const [warehouses, setWarehouses] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
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
      const existing = editingWarehouse;
      const existingAttributes = existing?.custom_attributes ?? {};

      const customAttributes = {
        ...existingAttributes,
        manager_name: formData.managerName ?? "",
        description: formData.description ?? "",
        location_code: formData.locationCode ?? "",
        address_line_1: formData.addressLine1 ?? "",
        address_line_2: formData.addressLine2 ?? "",
        city: formData.city ?? "",
        state: formData.state ?? "",
        country: formData.country ?? "",
        postal_code: formData.postalCode ?? "",
        length: Number(formData.length) || 0,
        width: Number(formData.width) || 0,
        height: Number(formData.height) || 0,
        dimension_unit: formData.dimensionUnit ?? "Meters",
        floor_area: Number(formData.floorArea) || 0,
        floor_area_sq_ft: Number(formData.floorAreaSqFt) || 0,
        building_volume: Number(formData.buildingVolume) || 0,
        building_volume_cu_ft: Number(formData.buildingVolumeCuFt) || 0,
      };

      const payload = {
        name: String(formData.name ?? "").trim(),
        code: String(formData.code ?? "").trim(),
        email: formData.email ?? "",
        phone: formData.contactNumber ?? "",
        total_capacity: Number(formData.totalCapacity) || 0,
        capacity_unit: formData.capacityUnit ?? "Sacks",
        warehouse_type_id: formData.warehouseTypeId || null,
        operating_hours: {
          opening_time: formData.openingTime ?? "09:00",
          closing_time: formData.closingTime ?? "18:00",
          working_days: formData.workingDays ?? [],
        },
        custom_attributes: customAttributes,
        status: formData.active === false ? "inactive" : "active",
        is_active: formData.active !== false,
      };

      const isEditing = Boolean(existing?.id);
      if (isEditing) payload.version = existing.version;

      const response = await fetch(
        isEditing
          ? `${API_URL}/${encodeURIComponent(existing.id)}`
          : API_URL,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error || result.message ||
          `Unable to ${isEditing ? "update" : "save"} warehouse.`
        );
      }

      const savedWarehouse = result.data ?? result.warehouse ?? result;
      if (!savedWarehouse || typeof savedWarehouse !== "object" || !savedWarehouse.id) {
        throw new Error("The server did not return the saved warehouse record.");
      }

      const normalized = normalizeWarehouse(savedWarehouse);

      setWarehouses((previous) =>
        isEditing
          ? previous.map((warehouse) =>
              String(warehouse.id) === String(existing.id) ? normalized : warehouse
            )
          : [...previous, normalized]
      );

      setShowForm(false);
      setEditingWarehouse(null);
      setPage(1);
    } catch (err) {
      setError(err.message || "Unable to save warehouse.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWarehouse(id, updatedRow) {
    if (!id) {
      throw new Error("Warehouse ID is missing.");
    }

    setError("");

    try {
      const existingWarehouse = warehouses.find(
        (warehouse) => String(warehouse.id) === String(id)
      );

      if (!existingWarehouse) {
        throw new Error("Warehouse not found.");
      }

      const payload = {
        version: existingWarehouse.version,
      };

      // 1. Warehouse name
      if (updatedRow.name !== existingWarehouse.name) {
        const name = String(updatedRow.name ?? "").trim();

        if (!name) {
          throw new Error("Warehouse name cannot be empty.");
        }

        payload.name = name;
      }

      // 2. Capacity
      if (
        String(updatedRow.capacity ?? "") !==
        String(existingWarehouse.capacity ?? "")
      ) {
        const capacity = Number(updatedRow.capacity);

        if (
          updatedRow.capacity === "" ||
          !Number.isFinite(capacity) ||
          capacity < 0
        ) {
          throw new Error("Capacity must be a valid non-negative number.");
        }

        payload.total_capacity = capacity;
      }

      // 3. Address fields: update only changed keys and preserve all others.
      const addressKeys = [
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "country",
        "postal_code",
      ];
      const existingAttributes = existingWarehouse.custom_attributes ?? {};
      const updatedAttributes = { ...existingAttributes };
      let addressChanged = false;

      for (const key of addressKeys) {
        if (updatedRow[key] !== undefined) {
          const nextValue = String(updatedRow[key] ?? "").trim();
          const currentValue = String(existingAttributes[key] ?? "");

          if (nextValue !== currentValue) {
            updatedAttributes[key] = nextValue;
            addressChanged = true;
          }
        }
      }

      // Backward compatibility with the existing inline Location editor.
      // Its draft stores the edited Address Line 1 in `location`.
      if (
        updatedRow.location !== undefined &&
        updatedRow.address_line_1 === undefined
      ) {
        const nextAddress = String(updatedRow.location ?? "").trim();
        const currentAddress = String(existingAttributes.address_line_1 ?? "");

        if (nextAddress !== currentAddress) {
          updatedAttributes.address_line_1 = nextAddress;
          addressChanged = true;
        }
      }

      if (addressChanged) {
        payload.custom_attributes = updatedAttributes;
      }

      // Nothing changed except the version field.
      if (Object.keys(payload).length === 1) {
        return;
      }

      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || result.message || "Unable to update warehouse."
        );
      }

      if (!result.data) {
        throw new Error("Updated warehouse data was not returned.");
      }

      setWarehouses((previous) =>
        previous.map((warehouse) =>
          String(warehouse.id) === String(id)
            ? normalizeWarehouse(result.data)
            : warehouse
        )
      );

      // Keep the selected modal record in sync if the popup remains open.
      setSelectedWarehouse((previous) =>
        previous && String(previous.id) === String(id)
          ? normalizeWarehouse(result.data)
          : previous
      );
    } catch (err) {
      setError(err.message || "Unable to update warehouse.");
      throw err;
    }
  }

  function openEditWarehouse(warehouse) {
    setError("");
    setEditingWarehouse(warehouse);
    setShowForm(true);
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
                setEditingWarehouse(null);
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
            onEdit={openEditWarehouse}
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
            key={editingWarehouse?.id ?? "new-warehouse"}
            initialData={editingWarehouse}
            onSave={saveWarehouse}
            onClose={() => {
              if (!saving) {
                setShowForm(false);
                setEditingWarehouse(null);
              }
            }}
            saving={saving}
          />
        )}
      </section>
    </main>
  );
}

export default WarehouseLocation;
