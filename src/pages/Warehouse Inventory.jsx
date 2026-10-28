
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Package,
  CheckCircle,
  RotateCcw,
  X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import StorageTable from "../component/StorageTable.jsx";
import Pagination from "../component/Pagination.jsx";
import Button from "../component/Button.jsx";
import ReportDamagedGoods from "../component/ReportDamagedGoods.jsx";

import "../styles/Warehouse Inventory.css";

const API_URL = "http://localhost:5000/api/warehouse-Inventory";
const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = "warehouseInventoryData";
const REPORTS_KEY = "damagedGoodsReports";

const inventoryColumns = [
  { key: "inventoryCode", label: "Inventory Code", editable: false },
  { key: "itemName", label: "Item Name", editable: false },
  { key: "warehouse", label: "Warehouse", editable: false },
  { key: "zone", label: "Zone", editable: false },
  { key: "onHand", label: "On Hand", editable: false },
  { key: "reserved", label: "Reserved", editable: false },
  { key: "available", label: "Available", editable: false },
  { key: "damaged", label: "Damaged", editable: false },
  { key: "reorderLevel", label: "Reorder Level", editable: false },
  { key: "status", label: "Status", editable: false },
  { key: "remark", label: "Remark", editable: false },
];

function readStoredData(key, fallback = null) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function getValue(item, keys, fallback = "-") {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null &&
      item?.[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
}

function WarehouseInventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [warehouse, setWarehouse] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDamageItem, setSelectedDamageItem] = useState(null);
  const [showDamageForm, setShowDamageForm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWarehouseInventory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        const records = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.inventory)
              ? result.inventory
              : null;

        if (!records) {
          throw new Error("Invalid inventory data received from backend.");
        }

        setData(records);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (err) {
        if (err.name !== "AbortError") {
          setData([]);
          setError(err.message || "Unable to fetch warehouse inventory.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWarehouseInventory();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loading, error]);

  const normalizedData = useMemo(
    () =>
      data.map((item, index) => {
        const onHand =
          Number(getValue(item, ["onHand", "quantity", "stock"], 0)) || 0;

        const reserved =
          Number(getValue(item, ["reserved", "reservedQuantity"], 0)) || 0;

        const availableValue = getValue(
          item,
          ["available", "availableQuantity"],
          null
        );

        const available =
          availableValue !== null
            ? Number(availableValue) || 0
            : Math.max(onHand - reserved, 0);

        const damaged =
          Number(getValue(item, ["damaged", "damagedQuantity"], 0)) || 0;

        const reorderLevel =
          Number(getValue(item, ["reorderLevel", "minimumStock"], 0)) || 0;

        return {
          ...item,
          id: String(item.id ?? item._id ?? index),
          inventoryCode: getValue(
            item,
            ["inventoryCode", "code"],
            `INV-${index + 1}`
          ),
          itemName: getValue(item, ["itemName", "productName", "product"]),
          warehouse: getValue(item, ["warehouse", "warehouseName"]),
          zone: getValue(item, ["zone", "zoneName"]),
          onHand,
          reserved,
          available,
          damaged,
          reorderLevel,
          status:
            onHand === 0
              ? "Out of Stock"
              : onHand <= reorderLevel
                ? "Low Stock"
                : "Available",
          remark: item.remark ?? (damaged > 0 ? "Damaged" : ""),
        };
      }),
    [data]
  );

  const totalOnHand = normalizedData.reduce(
    (total, item) => total + item.onHand,
    0
  );

  const totalAvailable = normalizedData.reduce(
    (total, item) => total + item.available,
    0
  );

  const lowStockCount = normalizedData.filter(
    (item) => item.onHand > 0 && item.onHand <= item.reorderLevel
  ).length;

  const warehouses = [
    ...new Set(
      normalizedData
        .map((item) => item.warehouse)
        .filter((value) => value && value !== "-")
    ),
  ];

  const zones = [
    ...new Set(
      normalizedData
        .map((item) => item.zone)
        .filter((value) => value && value !== "-")
    ),
  ];

  const filteredData = normalizedData.filter((item) => {
    const searchableValues = [
      item.inventoryCode,
      item.itemName,
      item.warehouse,
      item.zone,
      item.onHand,
      item.reserved,
      item.available,
      item.damaged,
      item.reorderLevel,
      item.status,
      item.remark,
    ];

    const searchText = search.trim().toLowerCase();

    const matchesSearch = searchableValues.some((value) =>
      String(value ?? "").toLowerCase().includes(searchText)
    );

    return (
      matchesSearch &&
      (!warehouse || item.warehouse === warehouse) &&
      (!zone || item.zone === zone) &&
      (!status || item.status === status)
    );
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setWarehouse("");
    setZone("");
    setStatus("");
    setPage(1);
  }

  function handleView(row) {
    setSelectedRecord(row);
  }

  function closeModal() {
    setSelectedRecord(null);
  }

  function handleDamage(row) {
    if (row.available <= 0) {
      window.alert("No available quantity to report as damaged.");
      return;
    }

    setSelectedDamageItem(row);
    setShowDamageForm(true);
  }

  function closeDamageForm() {
    setShowDamageForm(false);
    setSelectedDamageItem(null);
  }

  function handleDamageSubmit(form) {
    if (!selectedDamageItem) return;

    const damagedQty = Number(form.damagedQty ?? form.damagedQuantity);

    if (
      !Number.isFinite(damagedQty) ||
      damagedQty <= 0 ||
      damagedQty > selectedDamageItem.available
    ) {
      window.alert(
        `Enter a damaged quantity between 1 and ${selectedDamageItem.available}.`
      );
      return;
    }

    const updatedItem = {
      ...selectedDamageItem,
      onHand: Math.max(selectedDamageItem.onHand - damagedQty, 0),
      available: Math.max(selectedDamageItem.available - damagedQty, 0),
      damaged: selectedDamageItem.damaged + damagedQty,
    };

    const updatedData = data.map((item, index) => {
      const itemId = String(item.id ?? item._id ?? index);

      if (itemId !== String(selectedDamageItem.id)) {
        return item;
      }

      return {
        ...item,
        onHand: updatedItem.onHand,
        available: updatedItem.available,
        damaged: updatedItem.damaged,
        remark: "Damaged",
      };
    });

    const reportId = `DGR-${Date.now()}`;

    const report = {
      id: reportId,
      reportNo: reportId,
      inventoryId: selectedDamageItem.id,
      inventoryCode: selectedDamageItem.inventoryCode,
      productName: selectedDamageItem.itemName,
      itemName: selectedDamageItem.itemName,
      warehouse: selectedDamageItem.warehouse,
      zone: selectedDamageItem.zone,
      onHand: updatedItem.onHand,
      available: updatedItem.available,
      availableQuantity: updatedItem.available,
      damaged: updatedItem.damaged,
      damagedQty,
      damagedQuantity: damagedQty,
      damageType: form.damageType ?? "",
      severity: form.severity ?? "",
      reason: form.reason ?? "",
      remark: form.remark ?? "",
      disposition: form.disposition ?? "",
      damageDate: new Date().toISOString(),
      status: form.status ?? "Pending",
      inspectionStatus: form.inspectionStatus ?? "Pending",
      resolutionStatus: "Open",
      unitPrice: Number(
        selectedDamageItem.unitPrice ?? selectedDamageItem.price ?? 0
      ),
    };

    const existingReports = readStoredData(REPORTS_KEY, []);
    const safeReports = Array.isArray(existingReports)
      ? existingReports
      : [];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      localStorage.setItem(
        REPORTS_KEY,
        JSON.stringify([...safeReports, report])
      );

      setData(updatedData);
      closeDamageForm();

      window.dispatchEvent(new Event("damagedGoodsReportsUpdated"));
      window.alert("Damage quantity updated and report saved successfully!");
    } catch {
      window.alert("Unable to save the damage report in local storage.");
    }
  }

  return (
    <div className="warehouse-inventory-page">
      <div className="warehouse-inventory-summary">
        <StatCard
          title="Total On Hand"
          value={totalOnHand.toLocaleString("en-IN")}
          icon={<Package />}
        />

        <StatCard
          title="Total Available"
          value={totalAvailable.toLocaleString("en-IN")}
          icon={<CheckCircle />}
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount.toLocaleString("en-IN")}
          icon={<RotateCcw />}
        />
      </div>

      <div className="warehouse-inventory-toolbar">
        <div className="warehouse-inventory-search">
          <Search />
          <input
            type="text"
            placeholder="Search inventory code, item, warehouse..."
            value={search}
            onChange={(event) =>
              changeFilter(setSearch, event.target.value)
            }
          />
        </div>

        <Button
          className={`warehouse-inventory-filter-btn ${
            showFilters ? "filter-active" : ""
          }`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter />
          Filters
          <ChevronDown
            className={showFilters ? "filter-chevron-open" : ""}
          />
        </Button>
      </div>

      {showFilters && (
        <div className="warehouse-inventory-filter-panel">
          <div className="warehouse-inventory-filter-field">
            <label htmlFor="inventory-warehouse">Warehouse</label>
            <select
              id="inventory-warehouse"
              value={warehouse}
              onChange={(event) =>
                changeFilter(setWarehouse, event.target.value)
              }
            >
              <option value="">All Warehouses</option>
              {warehouses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="warehouse-inventory-filter-field">
            <label htmlFor="inventory-zone">Zone</label>
            <select
              id="inventory-zone"
              value={zone}
              onChange={(event) =>
                changeFilter(setZone, event.target.value)
              }
            >
              <option value="">All Zones</option>
              {zones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="warehouse-inventory-filter-field">
            <label htmlFor="inventory-status">Status</label>
            <select
              id="inventory-status"
              value={status}
              onChange={(event) =>
                changeFilter(setStatus, event.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <Button
            className="warehouse-inventory-reset-btn"
            onClick={resetFilters}
          >
            <RotateCcw />
            Reset
          </Button>
        </div>
      )}

      <div className="warehouse-inventory-table-card">
        <StorageTable
          warehouses={currentData}
          columns={inventoryColumns}
          onView={handleView}
          onDamage={handleDamage}
          emptyMessage={
            loading
              ? "Loading warehouse inventory..."
              : error
                ? "Unable to load warehouse inventory."
                : "No warehouse inventory records found."
          }
        />

        {error && (
          <p className="warehouse-inventory-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="warehouse-inventory-footer">
            <span className="pagination-info">
              Showing {filteredData.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredData.length
              )}{" "}
              of {filteredData.length} records
            </span>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {selectedRecord && (
        <div
          className="warehouse-inventory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="warehouse-inventory-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warehouse-inventory-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="warehouse-inventory-modal-header">
              <h2 id="warehouse-inventory-details-title">
                Warehouse Inventory Details
              </h2>

              <Button
                className="warehouse-inventory-modal-close"
                onClick={closeModal}
              >
                <X />
              </Button>
            </div>

            <div className="warehouse-inventory-details-grid">
              {inventoryColumns.map((column) => (
                <div
                  className="warehouse-inventory-detail-item"
                  key={column.key}
                >
                  <span>{column.label}</span>
                  <strong>
                    {getValue(selectedRecord, [column.key])}
                  </strong>
                </div>
              ))}
            </div>

            <div className="warehouse-inventory-modal-footer">
              <Button
                className="warehouse-inventory-modal-done"
                onClick={closeModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDamageForm && selectedDamageItem && (
        <ReportDamagedGoods
          record={selectedDamageItem}
          onClose={closeDamageForm}
          onSubmit={handleDamageSubmit}
        />
      )}
    </div>
  );
}

export default WarehouseInventory;
