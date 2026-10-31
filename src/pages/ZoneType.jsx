
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import ZoneTypeForm from "../component/ZoneTypeForm.jsx";

import "../styles/ZoneType.css";

const API_URL = "http://localhost:5000/api/zone-types";

const COLUMNS = [
  { key: "zoneTypeCode", label: "Zone Type Code", editable: true },
  { key: "zoneTypeName", label: "Zone Type Name", editable: true },
  { key: "storageType", label: "Storage Type", editable: true },
  { key: "status", label: "Status", editable: false },
];

const FILTER_FIELDS = [
  { key: "zoneTypeName", label: "Zone Type Name" },
  { key: "zoneTypeCode", label: "Zone Type Code" },
  { key: "storageType", label: "Storage Type" },
];

function normalizeZoneType(row) {
  const customAttributes =
    row.custom_attributes ?? row.customAttributes ?? {};

  const storageType =
    row.storageType ?? row.storage_type ?? "";

  return {
    ...row,

    id: row.id ?? row.zone_type_id ?? row.zoneTypeId ?? row._id,

    zoneTypeCode:
      row.zoneTypeCode ??
      row.typeCode ??
      row.zone_type_code ??
      row.code ??
      "",

    numericCode:
      row.numericCode ??
      row.code_int ??
      "",

    zoneTypeName:
      row.zoneTypeName ??
      row.name ??
      row.zone_type_name ??
      "",

    zonePurpose:
      row.zonePurpose ??
      row.zone_purpose ??
      "",

    storageType:
      typeof storageType === "string"
        ? storageType
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "",

    temperatureControl:
      row.temperatureControl ??
      row.temperature_controlled ??
      false,

    minTemp:
      row.minTemp ??
      row.temperature_min ??
      "",

    maxTemp:
      row.maxTemp ??
      row.temperature_max ??
      "",

    tempUnit:
      row.tempUnit ??
      row.temperature_unit ??
      "CELSIUS",

    humidityControl:
      row.humidityControl ??
      row.humidity_controlled ??
      false,

    minHumidity:
      row.minHumidity ??
      row.humidity_min ??
      "",

    maxHumidity:
      row.maxHumidity ??
      row.humidity_max ??
      "",

    description: row.description ?? "",

    status:
      row.status ??
      row.is_active ??
      row.active ??
      false,

    availableForSelection:
      customAttributes.available_for_selection ??
      row.availableForSelection ??
      true,
  };
}

function toApiZoneType(formData) {
  return {
    code: formData.zoneTypeCode?.trim(),

    code_int:
      formData.numericCode === "" || formData.numericCode == null
        ? null
        : Number(formData.numericCode),

    name: formData.zoneTypeName?.trim(),

    description: formData.description ?? "",

    zone_purpose: formData.zonePurpose,

    // Convert the UI label into the format expected by PostgreSQL.
    storage_type: formData.storageType
      ?.trim()
      .toUpperCase()
      .replace(/\s+/g, "_"),

    temperature_controlled: Boolean(formData.temperatureControl),

    temperature_min: formData.temperatureControl
      ? Number(formData.minTemp)
      : null,

    temperature_max: formData.temperatureControl
      ? Number(formData.maxTemp)
      : null,

    temperature_unit: formData.tempUnit
      ?.trim()
      .toUpperCase(),

    humidity_controlled: Boolean(formData.humidityControl),

    humidity_min: formData.humidityControl
      ? Number(formData.minHumidity)
      : null,

    humidity_max: formData.humidityControl
      ? Number(formData.maxHumidity)
      : null,

    is_active: Boolean(formData.status),

    custom_attributes: {
      available_for_selection: Boolean(
        formData.availableForSelection
      ),
    },
  };
}

function getZoneTypeRows(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.zoneTypes)) {
    return result.zoneTypes;
  }

  if (Array.isArray(result?.zone_types)) {
    return result.zone_types;
  }

  throw new Error("Invalid zone type data.");
}

function getErrorMessage(result, fallback) {
  if (typeof result?.error === "string") {
    return result.error;
  }

  if (typeof result?.message === "string") {
    return result.message;
  }

  return fallback;
}

function ZoneType() {
  const [zoneTypes, setZoneTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    zoneTypeName: "",
    zoneTypeCode: "",
    storageType: "",
  });

  async function loadZoneTypes(signal) {
    const response = await fetch(API_URL, { signal });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.success === false) {
      throw new Error(
        getErrorMessage(result, "Unable to load zone type data.")
      );
    }

    const rows = getZoneTypeRows(result);

    setZoneTypes(rows.map(normalizeZoneType));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setError("");
        await loadZoneTypes(controller.signal);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load zone types."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, []);

  const filteredZoneTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return zoneTypes.filter((row) => {
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
  }, [zoneTypes, search, filters]);

  function clearFilters() {
    setSearch("");

    setFilters({
      zoneTypeName: "",
      zoneTypeCode: "",
      storageType: "",
    });
  }

  async function saveZoneType(formData) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = toApiZoneType(formData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.success === false) {
        throw new Error(
          getErrorMessage(result, "Unable to save zone type.")
        );
      }

      await loadZoneTypes();

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to save zone type.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateZoneType(id, updatedRow) {
    if (id == null || id === "") {
      throw new Error("Zone type ID is missing.");
    }

    setError("");

    const existingRow = zoneTypes.find(
      (row) => String(row.id) === String(id)
    );

    const mergedFormData = {
      ...existingRow,
      ...updatedRow,

      zoneTypeCode:
        updatedRow.zoneTypeCode ??
        existingRow?.zoneTypeCode ??
        "",

      zoneTypeName:
        updatedRow.zoneTypeName ??
        existingRow?.zoneTypeName ??
        "",

      storageType:
        updatedRow.storageType ??
        existingRow?.storageType ??
        "AMBIENT",
    };

    const payload = toApiZoneType(mergedFormData);

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

    if (!response.ok || result?.success === false) {
      throw new Error(
        getErrorMessage(result, "Unable to update zone type.")
      );
    }

    await loadZoneTypes();
  }

async function handleDeleteZoneType(id) {
  if (!id) {
    setError("Zone Type ID is missing.");
    return;
  }

  // Ask for confirmation before deleting.
  const confirmed = window.confirm(
    "Are you sure you want to delete this zone type?"
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
        getErrorMessage(result, "Unable to delete zone type.")
      );
    }

    // Remove the successfully deleted record from the table.
    setZoneTypes((previous) =>
      previous.filter((row) => String(row.id) !== String(id))
    );
  } catch (err) {
    setError(err.message || "Unable to delete zone type.");
  }
}


  return (
    <main className="zone-type-page">
      <section className="zone-type-section">
        <h2 className="zone-type-heading">
          Warehouse Management
        </h2>

        <div className="zone-type-toolbar">
          <div className="zone-type-search">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search zone type..."
            />
          </div>

          <Button
            type="button"
            className={`zone-type-filter-btn ${
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
            className="zone-type-add-btn"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            + Add Zone Type
          </Button>
        </div>

        {showFilters && (
          <div className="zone-type-filter-panel">
            {FILTER_FIELDS.map(({ key, label }) => (
              <div
                className="zone-type-filter-field"
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

        {error && (
          <div className="zone-type-message" role="alert">
            <span>{error}</span>

            <Button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError("");

                try {
                  await loadZoneTypes();
                } catch (err) {
                  setError(
                    err.message || "Unable to load zone types."
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <p className="zone-type-message">
            Loading zone types...
          </p>
        ) : (
  
<StorageTable
  warehouses={filteredZoneTypes}
  columns={COLUMNS}
  onUpdate={handleUpdateZoneType}
  onDelete={handleDeleteZoneType}
  showSerial
  emptyMessage="No zone types found"
/>


        )}

        {showForm && (
          <ZoneTypeForm
            onSave={saveZoneType}
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

export default ZoneType;
