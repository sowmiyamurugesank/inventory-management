
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import WarehouseTabs from "../component/WarehouseTabs.jsx";
import ZoneTypeForm from "../component/ZoneTypeForm.jsx";

import "../styles/ZoneType.css";

const API_URL = "http://localhost:5000/api/zone-types";

const TABS = [
  "Warehouse",
  "Warehouse Type",
  "Zone",
  "Zone Type",
];

const COLUMNS = [
  { key: "zoneTypeName", label: "Zone Type Name" },
  { key: "zoneTypeCode", label: "Zone Type Code" },
  { key: "storageType", label: "Storage Type" },
  { key: "status", label: "Status" },
];

const FILTER_FIELDS = [
  { key: "zoneTypeName", label: "Zone Type Name" },
  { key: "zoneTypeCode", label: "Zone Type Code" },
  { key: "storageType", label: "Storage Type" },
];

function normalizeZoneType(row) {
  return {
    ...row,
    zoneTypeName:
      row.zoneTypeName ?? row.name ?? row.zone_type_name ?? "",
    zoneTypeCode:
      row.zoneTypeCode ?? row.typeCode ?? row.zone_type_code ?? "",
    storageType: row.storageType ?? row.storage_type ?? "",
    status: row.status ?? row.active ?? true,
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
        setLoading(true);
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
          String(row[key] ?? "").toLowerCase().includes(query)
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
  <main className="zone-type-page">
    <section className="zone-type-section">
      <button
        type="button"
        className="zone-type-back-arrow"
        onClick={() => navigate("/storage")}
        aria-label="Back to Storage"
        title="Back to Storage"
      >
        <ArrowLeft/>
      </button>

      <h2 className="zone-type-heading">
        Warehouse Management
      </h2>

        <WarehouseTabs
          tabs={TABS}
          activeTab={3}
          setActiveTab={handleTabChange}
        />

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
            onClick={() => setShowFilters((value) => !value)}
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
              <div className="zone-type-filter-field" key={key}>
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

            <Button type="button" onClick={clearFilters}>
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
