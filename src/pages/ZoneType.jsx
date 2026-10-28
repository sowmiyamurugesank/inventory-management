
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

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
  return {
    ...row,
    zoneTypeCode:
      row.zoneTypeCode ??
      row.typeCode ??
      row.zone_type_code ??
      "",
    zoneTypeName:
      row.zoneTypeName ??
      row.name ??
      row.zone_type_name ??
      "",
    storageType:
      row.storageType ??
      row.storage_type ??
      "",
    status: row.status ?? row.active ?? "",
  };
}

function ZoneType() {
  const navigate = useNavigate();

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

  async function loadZoneTypes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load zone type data.");
    }

    const data = await response.json();

    const rows = Array.isArray(data)
      ? data
      : data.zoneTypes ?? data.zone_types;

    if (!Array.isArray(rows)) {
      throw new Error("Invalid zone type data.");
    }

    setZoneTypes(rows.map(normalizeZoneType));
  }

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setError("");
        await loadZoneTypes();
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load zone types.");
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
          result.message || "Unable to save zone type."
        );
      }

      await loadZoneTypes();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
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

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoneTypeCode: updatedRow.zoneTypeCode,
          zoneTypeName: updatedRow.zoneTypeName,
          storageType: updatedRow.storageType,
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to update zone type."
      );
    }

    const updatedRecord =
      result.zoneType ?? result.zone_type ?? result;

    setZoneTypes((previous) =>
      previous.map((row) =>
        String(row.id ?? row._id) === String(id)
          ? normalizeZoneType({
              ...row,
              ...updatedRecord,
              zoneTypeCode:
                updatedRecord.zoneTypeCode ??
                updatedRecord.typeCode ??
                updatedRecord.zone_type_code ??
                updatedRow.zoneTypeCode,
              zoneTypeName:
                updatedRecord.zoneTypeName ??
                updatedRecord.name ??
                updatedRecord.zone_type_name ??
                updatedRow.zoneTypeName,
              storageType:
                updatedRecord.storageType ??
                updatedRecord.storage_type ??
                updatedRow.storageType,
            })
          : row
      )
    );
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
          <p className="zone-type-message" role="alert">
            {error}
          </p>
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
