
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

import StorageTable from "../component/StorageTable.jsx";
import SearchBox from "../component/SearchBox.jsx";
import Button from "../component/Button.jsx";
import Pagination from "../component/Pagination.jsx";
import AisleForm from "../component/AisleForm.jsx";

import "../styles/Aisle.css";

const API_URL = "http://localhost:5000/api/aisles";
const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  { key: "code", label: "Aisle Code", editable: false },
  { key: "name", label: "Aisle Name", editable: false },
  { key: "warehouse", label: "Warehouse", editable: false },
  { key: "zone", label: "Zone", editable: false },
  { key: "sequence", label: "Sequence", editable: false },
  { key: "aisleType", label: "Aisle Type", editable: false },
  { key: "length", label: "Length", editable: false },
  { key: "width", label: "Width", editable: false },
  { key: "height", label: "Height", editable: false },
  { key: "dimensionUnit", label: "Unit", editable: false },
  { key: "rackCapacity", label: "Rack Capacity", editable: false },
  { key: "status", label: "Status", editable: false },
];

function getAisleList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.aisles)) return result.aisles;
  if (Array.isArray(result?.data)) return result.data;

  throw new Error("The aisle API response does not contain an aisle list.");
}

function normalizeAisle(aisle) {
  return {
    ...aisle,
    id: aisle.id ?? aisle.aisle_id ?? aisle._id,
    code: aisle.code ?? aisle.aisle_code ?? aisle.aisleCode ?? "",
    name: aisle.name ?? aisle.aisle_name ?? aisle.aisleName ?? "",
    warehouse:
      aisle.warehouse ??
      aisle.warehouse_name ??
      aisle.warehouse_code ??
      "",
    zone:
      aisle.zone ??
      aisle.zone_name ??
      aisle.zone_code ??
      aisle.zone_id ??
      "",
    sequence: aisle.sequence ?? aisle.aisle_sequence ?? "-",
    aisleType: aisle.aisleType ?? aisle.aisle_type ?? aisle.type ?? "-",
    length: aisle.length ?? "-",
    width: aisle.width ?? "-",
    height: aisle.height ?? "-",
    dimensionUnit:
      aisle.dimensionUnit ??
      aisle.dimension_unit ??
      aisle.unit ??
      "-",
    rackCapacity: aisle.rackCapacity ?? aisle.rack_capacity ?? "-",
    status: String(aisle.status ?? "active").toLowerCase(),
  };
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function Aisle({ onEditAisle }) {
  const [aisles, setAisles] = useState([]);
  const [showAisleForm, setShowAisleForm] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [aisleTypeFilter, setAisleTypeFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchAisles(signal) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, signal ? { signal } : {});

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Unable to fetch aisles (${response.status}).`
        );
      }

      setAisles(getAisleList(result).map(normalizeAisle));
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load aisles.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchAisles(controller.signal);

    return () => controller.abort();
  }, []);

  const warehouseOptions = useMemo(
    () =>
      [...new Set(
        aisles
          .map((aisle) => aisle.warehouse)
          .filter((value) => value && value !== "-")
      )],
    [aisles]
  );

  const zoneOptions = useMemo(
    () =>
      [...new Set(
        aisles
          .map((aisle) => aisle.zone)
          .filter((value) => value && value !== "-")
      )],
    [aisles]
  );

  const aisleTypeOptions = useMemo(
    () =>
      [...new Set(
        aisles
          .map((aisle) => aisle.aisleType)
          .filter((value) => value && value !== "-")
      )],
    [aisles]
  );

  const filteredAisles = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return aisles.filter((aisle) => {
      const searchableValues = [
        aisle.code,
        aisle.name,
        aisle.warehouse,
        aisle.zone,
        aisle.sequence,
        aisle.aisleType,
        aisle.status,
      ];

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "all" ||
        String(aisle.status).toLowerCase() === statusFilter;

      const matchesWarehouse =
        warehouseFilter === "all" ||
        aisle.warehouse === warehouseFilter;

      const matchesZone =
        zoneFilter === "all" ||
        aisle.zone === zoneFilter;

      const matchesAisleType =
        aisleTypeFilter === "all" ||
        aisle.aisleType === aisleTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesWarehouse &&
        matchesZone &&
        matchesAisleType
      );
    });
  }, [
    aisles,
    search,
    statusFilter,
    warehouseFilter,
    zoneFilter,
    aisleTypeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAisles.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const paginatedAisles = filteredAisles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setZoneFilter("all");
    setAisleTypeFilter("all");
    setPage(1);
  }

  async function handleAisleSubmit(payload) {
    setError("");
    setSuccess("");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          `Unable to save aisle (${response.status}).`
      );
    }

    setShowAisleForm(false);
    setPage(1);
    setSuccess("Aisle saved successfully.");

    await fetchAisles();
  }

  async function handleDelete(id) {
    if (id === undefined || id === null || id === "") {
      setError("Cannot delete this aisle because its ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this aisle?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Unable to delete aisle (${response.status}).`
        );
      }

      setAisles((current) =>
        current.filter((aisle) => String(aisle.id) !== String(id))
      );

      setSuccess("Aisle deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete aisle.");
    }
  }

  async function handleEditSave(id, updatedAisle) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAisle),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Unable to update aisle (${response.status}).`
        );
      }

      const updatedRecord = result?.data ?? result?.aisle;

      if (updatedRecord && typeof updatedRecord === "object") {
        const normalized = normalizeAisle(updatedRecord);

        setAisles((current) =>
          current.map((aisle) =>
            String(aisle.id) === String(id)
              ? { ...aisle, ...normalized, id: aisle.id }
              : aisle
          )
        );
      } else {
        await fetchAisles();
      }

      setSuccess("Aisle updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update aisle.");
      throw err;
    }
  }

  return (
    <section className="aisle-page">
      {showAisleForm ? (
        <AisleForm
          onCancel={() => setShowAisleForm(false)}
          onSubmit={handleAisleSubmit}
        />
      ) : (
        <>
          <h2 className="aisle-heading">Aisle Management</h2>

          <div className="aisle-toolbar">
            <div className="aisle-search">
              <SearchBox
                value={search}
                onChange={handleSearch}
                placeholder="Search aisle..."
              />
            </div>

            <div className="aisle-toolbar-actions">
              <div className="aisle-filter-wrapper">
                <Button
                  type="button"
                  className="aisle-filter-button"
                  onClick={() => setShowFilters((current) => !current)}
                >
                  <SlidersHorizontal size={18} />
                  <span>Filters</span>
                  <ChevronDown
                    size={18}
                    className={showFilters ? "aisle-chevron-open" : ""}
                  />
                </Button>

                {showFilters && (
                  <div className="aisle-filter-panel">
                    <div className="aisle-filter-heading">
                      Filter Aisles
                    </div>

                    <div className="aisle-filter-field">
                      <label htmlFor="aisle-status-filter">Status</label>
                      <select
                        id="aisle-status-filter"
                        value={statusFilter}
                        onChange={(event) => {
                          setStatusFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="under_maintenance">
                          Under Maintenance
                        </option>
                      </select>
                    </div>

                    <div className="aisle-filter-field">
                      <label htmlFor="aisle-warehouse-filter">
                        Warehouse
                      </label>
                      <select
                        id="aisle-warehouse-filter"
                        value={warehouseFilter}
                        onChange={(event) => {
                          setWarehouseFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All Warehouses</option>
                        {warehouseOptions.map((warehouse) => (
                          <option key={warehouse} value={warehouse}>
                            {warehouse}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="aisle-filter-field">
                      <label htmlFor="aisle-zone-filter">Zone</label>
                      <select
                        id="aisle-zone-filter"
                        value={zoneFilter}
                        onChange={(event) => {
                          setZoneFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All Zones</option>
                        {zoneOptions.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="aisle-filter-field">
                      <label htmlFor="aisle-type-filter">Aisle Type</label>
                      <select
                        id="aisle-type-filter"
                        value={aisleTypeFilter}
                        onChange={(event) => {
                          setAisleTypeFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All Aisle Types</option>
                        {aisleTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      className="aisle-clear-button"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="button"
                className="aisle-add-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowAisleForm(true);
                }}
              >
                + Add Aisle
              </Button>
            </div>
          </div>

          {error && (
            <p className="aisle-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="aisle-success" role="status">
              {success}
            </p>
          )}

          {loading ? (
            <p className="aisle-message">Loading aisles...</p>
          ) : (
            <>
              <StorageTable
                warehouses={paginatedAisles}
                columns={COLUMNS}
                showSerial
                emptyMessage="No aisle records found"
                onView={(aisle) => {
                  if (onEditAisle) {
                    onEditAisle(aisle, "view");
                  } else {
                    window.alert(`${aisle.code} - ${aisle.name}`);
                  }
                }}
                onEdit={(aisle) => {
                  if (onEditAisle) {
                    onEditAisle(aisle, "edit");
                  }
                }}
                onDelete={handleDelete}
                onUpdate={handleEditSave}
              />

              <div className="aisle-footer">
                <span className="aisle-record-count">
                  Showing{" "}
                  {filteredAisles.length === 0 ? 0 : startIndex + 1}
                  {" - "}
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredAisles.length
                  )}
                  {" of "}
                  {filteredAisles.length} records
                </span>

                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Aisle;
