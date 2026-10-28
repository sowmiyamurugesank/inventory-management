
import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  CalendarDays,
  ChevronDown,
  Package,
  IndianRupee,
  ClipboardCheck,
  CheckCircle,
  RotateCcw,
  X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import StorageTable from "../component/StorageTable.jsx";
import Pagination from "../component/Pagination.jsx";
import Button from "../component/Button.jsx";
import SearchBox from "../component/SearchBox.jsx";

import "../styles/DamagedGoods.css";

const API_URL = "http://localhost:5000/api/damagedgoods";
const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  { key: "reportNo", label: "Report No.", editable: false },
  { key: "itemName", label: "Item Name", editable: false },
  { key: "warehouse", label: "Warehouse", editable: false },
  { key: "damageDate", label: "Damage Date", editable: false },
  { key: "damageType", label: "Damage Type", editable: false },
  { key: "severity", label: "Severity", editable: false },
  { key: "damagedQty", label: "Damaged Qty", editable: false },
  { key: "damageValue", label: "Damage Value", editable: false },
  { key: "inspectionStatus", label: "Inspection Status", editable: false },
  { key: "disposition", label: "Disposition", editable: false },
  { key: "resolutionStatus", label: "Resolution Status", editable: false },
];

function getValue(item, keys, fallback = "") {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item[key] !== null &&
      item[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
}

function getReportNo(item) {
  return getValue(
    item,
    ["reportNo", "reportNumber", "damageReportNo", "referenceNo"],
    "-"
  );
}

function getItemName(item) {
  const value = getValue(
    item,
    ["itemName", "productName", "product", "item"],
    "-"
  );

  if (typeof value === "object" && value !== null) {
    return value.itemName || value.productName || value.name || "-";
  }

  return value;
}

function getWarehouse(item) {
  const value = getValue(
    item,
    ["warehouse", "warehouseName", "location"],
    "-"
  );

  if (typeof value === "object" && value !== null) {
    return value.warehouseName || value.name || value.locationName || "-";
  }

  return value;
}

function getDamageDate(item) {
  return getValue(item, [
    "damageDate",
    "date",
    "reportedDate",
    "createdAt",
  ]);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function getDamageType(item) {
  return getValue(item, ["damageType", "type"], "-");
}

function getSeverity(item) {
  return getValue(item, ["severity", "damageSeverity"], "-");
}

function getDamagedQty(item) {
  return (
    Number(
      getValue(
        item,
        ["damagedQty", "damagedQuantity", "quantity", "qty"],
        0
      )
    ) || 0
  );
}

function getDamageValue(item) {
  const directValue = getValue(
    item,
    ["damageValue", "totalDamageValue", "lossValue", "amount"]
  );

  if (directValue !== "") {
    return Number(directValue) || 0;
  }

  const unitPrice =
    Number(getValue(item, ["unitPrice", "price", "cost"], 0)) || 0;

  return getDamagedQty(item) * unitPrice;
}

function getInspectionStatus(item) {
  return getValue(item, ["inspectionStatus", "inspection"], "Pending");
}

function getDisposition(item) {
  return getValue(item, ["disposition", "damageDisposition"], "-");
}

function getResolutionStatus(item) {
  return getValue(item, ["resolutionStatus", "status"], "Pending");
}

function DamagedGoods() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [damageType, setDamageType] = useState("");
  const [severity, setSeverity] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState("");

  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDamagedGoods() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server status: ${response.status}`);
        }

        const result = await response.json();

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : result.damagedGoods;

        if (!Array.isArray(list)) {
          throw new Error("Invalid damaged goods data.");
        }

        setData(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load damaged goods."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDamagedGoods();

    return () => controller.abort();
  }, []);

  const totalDamagedQty = useMemo(
    () => data.reduce((total, item) => total + getDamagedQty(item), 0),
    [data]
  );

  const totalDamageValue = useMemo(
    () => data.reduce((total, item) => total + getDamageValue(item), 0),
    [data]
  );

  const pendingInspection = useMemo(
    () =>
      data.filter((item) =>
        ["pending", "pending inspection", "not inspected"].includes(
          String(getInspectionStatus(item)).toLowerCase()
        )
      ).length,
    [data]
  );

  const resolvedReports = useMemo(
    () =>
      data.filter((item) =>
        ["resolved", "completed", "closed"].includes(
          String(getResolutionStatus(item)).toLowerCase()
        )
      ).length,
    [data]
  );

  const warehouses = useMemo(
    () => [...new Set(data.map(getWarehouse).filter((item) => item !== "-"))],
    [data]
  );

  const damageTypes = useMemo(
    () => [...new Set(data.map(getDamageType).filter((item) => item !== "-"))],
    [data]
  );

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const rawDate = getDamageDate(item);
      const itemDate = rawDate ? String(rawDate).slice(0, 10) : "";

      const searchableValues = [
        getReportNo(item),
        getItemName(item),
        getWarehouse(item),
        itemDate,
        getDamageType(item),
        getSeverity(item),
        getDamagedQty(item),
        getDamageValue(item),
        getInspectionStatus(item),
        getDisposition(item),
        getResolutionStatus(item),
      ];

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );

      return (
        matchesSearch &&
        (!fromDate || (itemDate && itemDate >= fromDate)) &&
        (!toDate || (itemDate && itemDate <= toDate)) &&
        (!warehouse || getWarehouse(item) === warehouse) &&
        (!damageType || getDamageType(item) === damageType) &&
        (!severity || getSeverity(item) === severity) &&
        (!inspectionStatus ||
          String(getInspectionStatus(item)).toLowerCase() ===
            inspectionStatus.toLowerCase()) &&
        (!resolutionStatus ||
          String(getResolutionStatus(item)).toLowerCase() ===
            resolutionStatus.toLowerCase())
      );
    });
  }, [
    data,
    search,
    fromDate,
    toDate,
    warehouse,
    damageType,
    severity,
    inspectionStatus,
    resolutionStatus,
  ]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const tableData = currentData.map((item, index) => ({
    ...item,
    id: item.id ?? item._id ?? `${startIndex + index}`,
    reportNo: getReportNo(item),
    itemName: getItemName(item),
    warehouse: getWarehouse(item),
    damageDate: formatDate(getDamageDate(item)),
    damageType: getDamageType(item),
    severity: getSeverity(item),
    damagedQty: getDamagedQty(item),
    damageValue: formatCurrency(getDamageValue(item)),
    inspectionStatus: getInspectionStatus(item),
    disposition: getDisposition(item),
    resolutionStatus: getResolutionStatus(item),
    originalRecord: item,
  }));

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setWarehouse("");
    setDamageType("");
    setSeverity("");
    setInspectionStatus("");
    setResolutionStatus("");
    setPage(1);
  }

  function handleView(record) {
    setSelectedRecord(record.originalRecord ?? record);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
  }

  return (
    <main className="damaged-goods-page">
      <section className="damaged-goods-summary">
        <StatCard
          title="Total Damaged Qty"
          value={totalDamagedQty.toLocaleString("en-IN")}
          icon={<Package/>}
        />

        <StatCard
          title="Total Damage Value"
          value={formatCurrency(totalDamageValue)}
          icon={<IndianRupee/>}
        />

        <StatCard
          title="Pending Inspection"
          value={pendingInspection.toLocaleString("en-IN")}
          icon={<ClipboardCheck/>}
        />

        <StatCard
          title="Resolved Reports"
          value={resolvedReports.toLocaleString("en-IN")}
          icon={<CheckCircle/>}
        />
      </section>

      <section className="damaged-goods-toolbar">
        <SearchBox
          value={search}
          onChange={(value) => changeFilter(setSearch, value)}
          placeholder="Search report, item, warehouse..."
        />

        <Button
          type="button"
          className={`damaged-filter-button ${
            showFilters ? "filter-active" : ""
          }`}
          onClick={() => setShowFilters((previous) => !previous)}
        >
          <Filter size={17} />
          Filters
          <ChevronDown
            size={16}
            className={showFilters ? "filter-chevron-open" : ""}
          />
        </Button>
      </section>

      {showFilters && (
        <section className="damaged-filter-panel">
          <div className="damaged-filter-field">
            <label htmlFor="damaged-from-date">From Date</label>
            <div className="damaged-date-input">
              <CalendarDays size={16} />
              <input
                id="damaged-from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) =>
                  changeFilter(setFromDate, event.target.value)
                }
              />
            </div>
          </div>

          <div className="damaged-filter-field">
            <label htmlFor="damaged-to-date">To Date</label>
            <div className="damaged-date-input">
              <CalendarDays size={16} />
              <input
                id="damaged-to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) =>
                  changeFilter(setToDate, event.target.value)
                }
              />
            </div>
          </div>

          <div className="damaged-filter-field">
            <label htmlFor="damaged-warehouse">Warehouse</label>
            <select
              id="damaged-warehouse"
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

          <div className="damaged-filter-field">
            <label htmlFor="damaged-type">Damage Type</label>
            <select
              id="damaged-type"
              value={damageType}
              onChange={(event) =>
                changeFilter(setDamageType, event.target.value)
              }
            >
              <option value="">All Damage Types</option>
              {damageTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="damaged-filter-field">
            <label htmlFor="damaged-severity">Severity</label>
            <select
              id="damaged-severity"
              value={severity}
              onChange={(event) =>
                changeFilter(setSeverity, event.target.value)
              }
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="damaged-filter-field">
            <label htmlFor="damaged-inspection">
              Inspection Status
            </label>
            <select
              id="damaged-inspection"
              value={inspectionStatus}
              onChange={(event) =>
                changeFilter(setInspectionStatus, event.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Inspected">Inspected</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="damaged-filter-field">
            <label htmlFor="damaged-resolution">
              Resolution Status
            </label>
            <select
              id="damaged-resolution"
              value={resolutionStatus}
              onChange={(event) =>
                changeFilter(setResolutionStatus, event.target.value)
              }
            >
              <option value="">All Resolutions</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <Button
            type="button"
            className="damaged-reset-button"
            onClick={clearFilters}
          >
            <RotateCcw size={15} />
            Clear
          </Button>
        </section>
      )}

      {error && (
        <p className="damaged-message" role="alert">
          {error}
        </p>
      )}

      <section className="damaged-goods-table-card">
        {loading ? (
          <p className="damaged-message">Loading damaged goods...</p>
        ) : (
          <StorageTable
            warehouses={tableData}
            columns={COLUMNS}
            onView={handleView}
            emptyMessage="No damaged goods records found."
          />
        )}

        {!loading && !error && (
          <div className="damaged-goods-footer">
            <span className="pagination-info">
              Showing {filteredData.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
              {" of "}
              {filteredData.length} records
            </span>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {selectedRecord && (
        <div
          className="damaged-modal-overlay"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="damaged-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="damaged-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="damaged-modal-header">
              <div>
                <h2 id="damaged-details-title">
                  Damage Report Details
                </h2>
                <p>{getReportNo(selectedRecord)}</p>
              </div>

              <Button
                type="button"
                className="damaged-modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="damaged-details-grid">
              {COLUMNS.map((column) => {
                let value;

                switch (column.key) {
                  case "reportNo":
                    value = getReportNo(selectedRecord);
                    break;
                  case "itemName":
                    value = getItemName(selectedRecord);
                    break;
                  case "warehouse":
                    value = getWarehouse(selectedRecord);
                    break;
                  case "damageDate":
                    value = formatDate(getDamageDate(selectedRecord));
                    break;
                  case "damageType":
                    value = getDamageType(selectedRecord);
                    break;
                  case "severity":
                    value = getSeverity(selectedRecord);
                    break;
                  case "damagedQty":
                    value = getDamagedQty(selectedRecord);
                    break;
                  case "damageValue":
                    value = formatCurrency(getDamageValue(selectedRecord));
                    break;
                  case "inspectionStatus":
                    value = getInspectionStatus(selectedRecord);
                    break;
                  case "disposition":
                    value = getDisposition(selectedRecord);
                    break;
                  case "resolutionStatus":
                    value = getResolutionStatus(selectedRecord);
                    break;
                  default:
                    value = "-";
                }

                return (
                  <div className="damaged-detail-item" key={column.key}>
                    <span>{column.label}</span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>

            <div className="damaged-modal-footer">
              <Button
                type="button"
                className="damaged-modal-done"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DamagedGoods;
