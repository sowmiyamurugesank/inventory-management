
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import ZoneForm from "../component/ZoneForm.jsx";

import "../styles/Zone.css";

const API_URL = "http://localhost:5000/api/zones";

const COLUMNS = [
  { key: "zoneCode", label: "Zone Code", editable: true },
  { key: "name", label: "Zone Name", editable: true },
  { key: "zoneType", label: "Zone Type", editable: true },
  { key: "status", label: "Status", editable: false },
];

const FILTER_FIELDS = [
  { key: "name", label: "Zone Name" },
  { key: "zoneCode", label: "Zone Code" },
  { key: "zoneType", label: "Zone Type" },
];

function normalizeZone(row) {
  return {
    ...row,
    id: row.id ?? row._id,
    name: row.name ?? row.zoneName ?? row.zone_name ?? "",
    zoneCode: row.zoneCode ?? row.zone_code ?? row.code ?? "",
    zoneType: row.zoneType ?? row.zone_type ?? "",
    status: row.status ?? "Active",
  };
}

function Zone() {
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    zoneCode: "",
    zoneType: "",
  });

  async function loadZones() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load zone data.");
    }

    const data = await response.json();
    const rows = Array.isArray(data)
      ? data
      : data.zones ?? data.data;

    if (!Array.isArray(rows)) {
      throw new Error("Invalid zone data.");
    }

    setZones(rows.map(normalizeZone));
  }

  useEffect(() => {
    let active = true;

    async function fetchZones() {
      try {
        setLoading(true);
        setError("");
        await loadZones();
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load zone data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchZones();

    return () => {
      active = false;
    };
  }, []);

  const filteredZones = useMemo(() => {
    const query = search.trim().toLowerCase();

    return zones.filter((row) => {
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
  }, [zones, search, filters]);

  function clearFilters() {
    setSearch("");
    setFilters({
      name: "",
      zoneCode: "",
      zoneType: "",
    });
  }

  async function saveZone(formData) {
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
        throw new Error(result.message || "Unable to save zone.");
      }

      await loadZones();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateZone(id, updatedRow) {
    if (id == null || id === "") {
      throw new Error("Zone ID is missing.");
    }

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoneCode: updatedRow.zoneCode,
          name: updatedRow.name,
          zoneType: updatedRow.zoneType,
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to update zone.");
    }

    const updatedRecord = result.zone ?? result.data ?? result;

    setZones((previous) =>
      previous.map((row) => {
        const rowId = row.id ?? row._id;
        const responseId = updatedRecord.id ?? updatedRecord._id ?? id;

        if (String(rowId) !== String(responseId)) {
          return row;
        }

        return normalizeZone({
          ...row,
          ...updatedRecord,
          ...updatedRow,
          id: rowId,
        });
      })
    );
  }

  return (
    <main className="zone-page">
      <section className="zone-section">
        <h2 className="zone-heading">Warehouse Management</h2>

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
            className={`zone-filter-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters((previous) => !previous)}
          >
            <SlidersHorizontal size={16} />
            Filter
          </Button>

          <Button
            type="button"
            className="zone-add-btn"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            + Add Zone
          </Button>
        </div>

        {showFilters && (
          <div className="zone-filter-panel">
            {FILTER_FIELDS.map(({ key, label }) => (
              <div className="zone-filter-field" key={key}>
                <label htmlFor={`filter-${key}`}>{label}</label>

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
          <p className="zone-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="zone-message">Loading zones...</p>
        ) : (
          <StorageTable
            warehouses={filteredZones}
            columns={COLUMNS}
            onUpdate={handleUpdateZone}
            showSerial
            emptyMessage="No zones found"
          />
        )}

        {showForm && (
          <ZoneForm
            onSave={saveZone}
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

export default Zone;
