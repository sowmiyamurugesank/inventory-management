import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import ZoneForm from "../component/ZoneForm.jsx";

import "../styles/Zone.css";

const API_URL = "http://localhost:5000/api/zones";
const WAREHOUSES_API_URL = "http://localhost:5000/api/warehouses";
const ZONE_TYPES_API_URL = "http://localhost:5000/api/zone-types";

const COLUMNS = [
  { key: "zoneCode", label: "Zone Code", editable: false },
  { key: "name", label: "Zone Name", editable: false },
  { key: "zoneType", label: "Zone Type", editable: false },
  { key: "status", label: "Status", editable: false },
];

const FILTER_FIELDS = [
  { key: "name", label: "Zone Name" },
  { key: "zoneCode", label: "Zone Code" },
  { key: "zoneType", label: "Zone Type" },
];

// ==========================================
// NORMALIZE ZONE DATA
// ==========================================

function normalizeZone(row, zoneTypes = []) {
  const zoneTypeId =
    row.warehouse_zone_type_id ??
    row.warehouseZoneTypeId ??
    row.zone_type_id ??
    "";

  const matchedZoneType = zoneTypes.find(
    (type) => String(type.id) === String(zoneTypeId)
  );

  return {
    ...row,

    id: row.id ?? row._id,

    name:
      row.name ??
      row.zoneName ??
      row.zone_name ??
      "",

    zoneCode:
      row.code ??
      row.zoneCode ??
      row.zone_code ??
      "",

    warehouseId:
      row.warehouse_id ??
      row.warehouseId ??
      "",

    warehouseZoneTypeId: zoneTypeId,

    zoneType:
      row.zone_type_name ??
      row.warehouse_zone_type_name ??
      matchedZoneType?.name ??
      row.zoneTypeName ??
      row.zoneType ??
      row.zone_type ??
      "",

    floorLevel:
      row.floor_level ??
      row.floorLevel ??
      0,

    maxCapacity:
      row.maximum_capacity ??
      row.max_capacity ??
      row.maxCapacity ??
      "",

    capacityUnit:
      row.capacity_unit ??
      row.capacityUnit ??
      "Units",

    allowPicking:
      row.is_pickable ??
      row.allow_picking ??
      row.allowPicking ??
      false,

    allowReceiving:
      row.is_receivable ??
      row.allow_receiving ??
      row.allowReceiving ??
      false,

    requireInspection:
      row.requires_inspection ??
      row.require_inspection ??
      row.requireInspection ??
      false,

    status:
      row.status ??
      (row.is_active === false ? "inactive" : "active"),
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================

function Zone() {
  const [zones, setZones] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [zoneTypes, setZoneTypes] = useState([]);

  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // NEW: Store the zone currently being edited.
  const [editingZone, setEditingZone] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    zoneCode: "",
    zoneType: "",
  });

  // ==========================================
  // EXTRACT API RESPONSE
  // ==========================================

  function extractRows(result) {
    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (Array.isArray(result?.data?.items)) {
      return result.data.items;
    }

    if (Array.isArray(result?.data?.rows)) {
      return result.data.rows;
    }

    if (Array.isArray(result?.items)) {
      return result.items;
    }

    return null;
  }

  // ==========================================
  // LOAD WAREHOUSES AND ZONE TYPES
  // ==========================================

  async function loadZoneFormOptions() {
    setLoadingOptions(true);

    try {
      const [
        warehouseResponse,
        zoneTypeResponse,
      ] = await Promise.all([
        fetch(WAREHOUSES_API_URL),
        fetch(ZONE_TYPES_API_URL),
      ]);

      const warehouseResult = await warehouseResponse
        .json()
        .catch(() => ({}));

      const zoneTypeResult = await zoneTypeResponse
        .json()
        .catch(() => ({}));

      if (!warehouseResponse.ok) {
        throw new Error(
          warehouseResult.error ||
            warehouseResult.message ||
            "Unable to load warehouses."
        );
      }

      if (!zoneTypeResponse.ok) {
        throw new Error(
          zoneTypeResult.error ||
            zoneTypeResult.message ||
            "Unable to load zone types."
        );
      }

      const warehouseRows = extractRows(warehouseResult);
      const zoneTypeRows = extractRows(zoneTypeResult);

      if (!warehouseRows || !zoneTypeRows) {
        throw new Error(
          "Unexpected warehouse or zone type API response."
        );
      }

      const activeWarehouses = warehouseRows.filter(
        (row) => row.is_active !== false
      );

      const activeZoneTypes = zoneTypeRows.filter(
        (row) => row.is_active !== false
      );

      setWarehouses(activeWarehouses);
      setZoneTypes(activeZoneTypes);

      return {
        warehouses: activeWarehouses,
        zoneTypes: activeZoneTypes,
      };
    } finally {
      setLoadingOptions(false);
    }
  }

  // ==========================================
  // LOAD ZONES
  // ==========================================

  async function loadZones(zoneTypeRows = zoneTypes) {
    const response = await fetch(API_URL);

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.error ||
          result.message ||
          "Unable to load zone data."
      );
    }

    const rows = extractRows(result);

    if (!rows) {
      throw new Error("Invalid zone data.");
    }

    const availableZoneTypes = Array.isArray(zoneTypeRows)
      ? zoneTypeRows
      : [];

    setZones(
      rows.map((row) =>
        normalizeZone(row, availableZoneTypes)
      )
    );
  }

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  useEffect(() => {
    let active = true;

    async function initializeZones() {
      try {
        setLoading(true);
        setError("");

        const options = await loadZoneFormOptions();

        await loadZones(options.zoneTypes);
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load zone data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeZones();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredZones = useMemo(() => {
    const query = search.trim().toLowerCase();

    return zones.filter((row) => {
      const matchesSearch =
        !query ||
        COLUMNS.some(({ key }) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(query)
        );

      const matchesFilters = FILTER_FIELDS.every(
        ({ key }) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(filters[key].trim().toLowerCase())
      );

      return matchesSearch && matchesFilters;
    });
  }, [zones, search, filters]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  function clearFilters() {
    setSearch("");

    setFilters({
      name: "",
      zoneCode: "",
      zoneType: "",
    });
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  async function handleOpenZoneForm() {
    setError("");
    setEditingZone(null);

    try {
      await loadZoneFormOptions();
      setShowForm(true);
    } catch (err) {
      setError(
        err.message || "Unable to load zone form data."
      );
    }
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  async function handleEditZone(zone) {
    setError("");

    try {
      // Refresh dropdown data before opening the form.
      const options = await loadZoneFormOptions();

      // Find the selected zone type.
      const normalizedZone = normalizeZone(
        zone,
        options.zoneTypes
      );

      setEditingZone(normalizedZone);

      setShowForm(true);
    } catch (err) {
      setError(
        err.message || "Unable to open zone details."
      );
    }
  }

  // ==========================================
  // CREATE ZONE
  // ==========================================

  async function createZone(formData) {
    const payload = {
      warehouse_id: formData.warehouseId,

      warehouse_zone_type_id:
        formData.warehouseZoneTypeId,

      code: String(formData.zoneCode ?? "").trim(),

      name: String(formData.zoneName ?? "").trim(),

      floor_level: Number(formData.floorLevel),

      maximum_capacity:
        formData.maxCapacity === "" ||
        formData.maxCapacity == null
          ? null
          : Number(formData.maxCapacity),

      capacity_unit: formData.capacityUnit,

      is_pickable: formData.allowPicking,

      is_receivable: formData.allowReceiving,

      requires_inspection: formData.requireInspection,
    };

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
          "Unable to create zone."
      );
    }
  }

  // ==========================================
  // UPDATE ZONE
  // ==========================================

  async function updateZone(id, formData) {
    if (!id) {
      throw new Error("Zone ID is missing.");
    }

    const existingZone = zones.find(
      (row) => String(row.id) === String(id)
    );

    if (!existingZone) {
      throw new Error("Zone record not found.");
    }

    const payload = {
      warehouse_id: formData.warehouseId,

      warehouse_zone_type_id:
        formData.warehouseZoneTypeId,

      code: String(formData.zoneCode ?? "").trim(),

      name: String(formData.zoneName ?? "").trim(),

      floor_level: Number(formData.floorLevel),

      maximum_capacity:
        formData.maxCapacity === "" ||
        formData.maxCapacity == null
          ? null
          : Number(formData.maxCapacity),

      capacity_unit: formData.capacityUnit,

      is_pickable: formData.allowPicking,

      is_receivable: formData.allowReceiving,

      requires_inspection: formData.requireInspection,

      version: existingZone.version,
    };

    if (
      !payload.warehouse_id ||
      !payload.warehouse_zone_type_id ||
      !payload.code ||
      !payload.name
    ) {
      throw new Error(
        "Warehouse, zone type, zone code and zone name are required."
      );
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
          "Unable to update zone."
      );
    }

    if (!result.data) {
      throw new Error(
        "Updated zone data was not returned."
      );
    }
  }

  // ==========================================
  // SAVE FORM - CREATE OR UPDATE
  // ==========================================

  async function handleSaveZone(formData) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      if (editingZone) {
        await updateZone(editingZone.id, formData);
      } else {
        await createZone(formData);
      }

      await loadZones(zoneTypes);

      setShowForm(false);
      setEditingZone(null);
    } catch (err) {
      setError(err.message || "Unable to save zone.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE ZONE
  // ==========================================

  async function handleDeleteZone(id) {
    if (!id) {
      setError("Zone ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this zone?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to delete zone."
        );
      }

      setZones((previous) =>
        previous.filter(
          (row) => String(row.id) !== String(id)
        )
      );
    } catch (err) {
      setError(
        err.message || "Unable to delete zone."
      );
    }
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  function handleCloseForm() {
    if (saving) return;

    setShowForm(false);
    setEditingZone(null);
    setError("");
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="zone-page">
      <section className="zone-section">

        <h2 className="zone-heading">
          Warehouse Management
        </h2>

        {/* TOOLBAR */}

        <div className="zone-toolbar">

          <div className="zone-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search zone..."
            />
          </div>

          <Button
            type="button"
            className={`zone-filter-btn ${
              showFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
          >
            <SlidersHorizontal size={16} />
            Filter
          </Button>

          <Button
            type="button"
            className="zone-add-btn"
            onClick={handleOpenZoneForm}
            disabled={loadingOptions}
          >
            {loadingOptions ? "Loading..." : "+ Add Zone"}
          </Button>

        </div>

        {/* FILTER PANEL */}

        {showFilters && (
          <div className="zone-filter-panel">

            {FILTER_FIELDS.map(({ key, label }) => (
              <div
                className="zone-filter-field"
                key={key}
              >
                <label htmlFor={`filter-${key}`}>
                  {label}
                </label>

                <input
                  id={`filter-${key}`}
                  type="text"
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

        {/* ERROR MESSAGE */}

        {error && (
          <p
            className="zone-message"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* ZONE TABLE */}

        {loading ? (
          <p className="zone-message">
            Loading zones...
          </p>
        ) : (
          <StorageTable
            warehouses={filteredZones}
            columns={COLUMNS}
            onEdit={handleEditZone}
            onDelete={handleDeleteZone}
            showSerial
            emptyMessage="No zones found"
          />
        )}

        {/* ADD / EDIT ZONE FORM */}

        {showForm && (
          <ZoneForm
            key={editingZone?.id ?? "new-zone"}
            warehouses={warehouses}
            zoneTypes={zoneTypes}
            initialData={editingZone}
            onSave={handleSaveZone}
            onClose={handleCloseForm}
            saving={saving || loadingOptions}
          />
        )}

      </section>
    </main>
  );
}

export default Zone;