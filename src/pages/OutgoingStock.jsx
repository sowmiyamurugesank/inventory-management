
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronDown,
  Package,
  Clock,
  CheckCircle,
  RotateCcw,
  X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import StorageTable from "../component/StorageTable.jsx";
import Pagination from "../component/Pagination.jsx";
import Button from "../component/Button.jsx";

import "../styles/OutgoingStock.css";

const API_URL = "http://localhost:5000/api/outgoing-stock";
const ITEMS_PER_PAGE = 10;

const outgoingStockColumns = [
  { key: "date", label: "Date", editable: false },
  { key: "product", label: "Product", editable: false },
  { key: "customer", label: "Customer / Party", editable: false },
  { key: "quantity", label: "Quantity", editable: false },
  { key: "warehouse", label: "Warehouse", editable: false },
  { key: "invoiceNo", label: "Invoice No.", editable: false },
  { key: "status", label: "Status", editable: false },
];

function getValue(record, keys, fallback = "") {
  for (const key of keys) {
    if (
      record?.[key] !== undefined &&
      record?.[key] !== null &&
      record?.[key] !== ""
    ) {
      return record[key];
    }
  }

  return fallback;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function OutgoingStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [date, setDate] = useState("");
  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOutgoingStock() {
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
            : Array.isArray(result.outgoingStock)
              ? result.outgoingStock
              : [];

        setData(records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load outgoing stock.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchOutgoingStock();

    return () => controller.abort();
  }, []);

  const products = useMemo(
    () => [
      ...new Set(
        data
          .map((record) =>
            getValue(record, ["product", "productName", "name"])
          )
          .filter(Boolean)
      ),
    ],
    [data]
  );

  const customers = useMemo(
    () => [
      ...new Set(
        data
          .map((record) =>
            getValue(record, [
              "customer",
              "customerName",
              "party",
              "partyName",
            ])
          )
          .filter(Boolean)
      ),
    ],
    [data]
  );

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const recordDate = String(
        getValue(record, ["date", "outgoingDate", "createdAt"])
      ).slice(0, 10);

      const recordProduct = getValue(record, [
        "product",
        "productName",
        "name",
      ]);

      const recordCustomer = getValue(record, [
        "customer",
        "customerName",
        "party",
        "partyName",
      ]);

      const recordQuantity = getValue(record, [
        "quantity",
        "outgoingQuantity",
        "qty",
      ]);

      const recordWarehouse = getValue(record, [
        "warehouse",
        "warehouseName",
        "location",
      ]);

      const recordInvoice = getValue(record, [
        "invoiceNo",
        "invoice",
        "invoiceNumber",
      ]);

      const recordStatus = getValue(record, ["status"], "Pending");

      const searchableValues = [
        recordDate,
        recordProduct,
        recordCustomer,
        recordQuantity,
        recordWarehouse,
        recordInvoice,
        recordStatus,
      ];

      const searchText = search.trim().toLowerCase();

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(searchText)
      );

      return (
        matchesSearch &&
        (!date || recordDate === date) &&
        (!product || recordProduct === product) &&
        (!customer || recordCustomer === customer) &&
        (!status ||
          String(recordStatus).toLowerCase() === status.toLowerCase())
      );
    });
  }, [data, search, date, product, customer, status]);

  const totalOutgoing = useMemo(() => {
    return data.reduce((total, record) => {
      return (
        total +
        (Number(
          getValue(record, ["quantity", "outgoingQuantity", "qty"], 0)
        ) || 0)
      );
    }, 0);
  }, [data]);

  const pendingCount = data
    .filter(
      (record) =>
        String(getValue(record, ["status"])).toLowerCase() === "pending"
    )
    .reduce(
      (total, record) =>
        total +
        (Number(
          getValue(record, ["quantity", "outgoingQuantity", "qty"], 0)
        ) || 0),
      0
    );

  const inProgressCount = data
    .filter(
      (record) =>
        String(getValue(record, ["status"])).toLowerCase() === "in progress"
    )
    .reduce(
      (total, record) =>
        total +
        (Number(
          getValue(record, ["quantity", "outgoingQuantity", "qty"], 0)
        ) || 0),
      0
    );

  const completedCount = data
    .filter(
      (record) =>
        String(getValue(record, ["status"])).toLowerCase() === "completed"
    )
    .reduce(
      (total, record) =>
        total +
        (Number(
          getValue(record, ["quantity", "outgoingQuantity", "qty"], 0)
        ) || 0),
      0
    );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const tableData = currentData.map((record, index) => ({
    ...record,
    id: record.id ?? record._id ?? `${startIndex + index}`,
    date: formatDate(
      getValue(record, ["date", "outgoingDate", "createdAt"])
    ),
    product: getValue(record, ["product", "productName", "name"], "-"),
    customer: getValue(
      record,
      ["customer", "customerName", "party", "partyName"],
      "-"
    ),
    quantity: Number(
      getValue(record, ["quantity", "outgoingQuantity", "qty"], 0)
    ),
    warehouse: getValue(
      record,
      ["warehouse", "warehouseName", "location"],
      "-"
    ),
    invoiceNo: getValue(
      record,
      ["invoiceNo", "invoice", "invoiceNumber"],
      "-"
    ),
    status: getValue(record, ["status"], "Pending"),
    originalRecord: record,
  }));

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setDate("");
    setProduct("");
    setCustomer("");
    setStatus("");
    setPage(1);
  }

  function handleView(row) {
    setSelectedRecord(row.originalRecord);
  }

  function closeModal() {
    setSelectedRecord(null);
  }

  return (
    <div className="outgoing-stock-page">
      <div className="outgoing-stock-summary">
        <StatCard
          title="Total Outgoing"
          value={totalOutgoing.toLocaleString("en-IN")}
          icon={<Package />}
        />

        <StatCard
          title="Pending"
          value={pendingCount.toLocaleString("en-IN")}
          icon={<Clock />}
        />

        <StatCard
          title="In Progress"
          value={inProgressCount.toLocaleString("en-IN")}
          icon={<RotateCcw />}
        />

        <StatCard
          title="Completed"
          value={completedCount.toLocaleString("en-IN")}
          icon={<CheckCircle />}
        />
      </div>

      <div className="outgoing-stock-toolbar">
        <div className="outgoing-search-box">
          <Search />

          <input
            type="text"
            placeholder="Search product, customer, invoice..."
            value={search}
            onChange={(event) =>
              changeFilter(setSearch, event.target.value)
            }
          />
        </div>

        <Button
          className={`outgoing-filter-button ${
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
        <div className="outgoing-filter-panel">
          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-date">Date</label>

            <div className="outgoing-date-input">
              <CalendarDays size={16} />

              <input
                id="outgoing-date"
                type="date"
                value={date}
                onChange={(event) =>
                  changeFilter(setDate, event.target.value)
                }
              />
            </div>
          </div>

          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-product">Product</label>

            <select
              id="outgoing-product"
              value={product}
              onChange={(event) =>
                changeFilter(setProduct, event.target.value)
              }
            >
              <option value="">All Products</option>
              {products.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-customer">Customer</label>

            <select
              id="outgoing-customer"
              value={customer}
              onChange={(event) =>
                changeFilter(setCustomer, event.target.value)
              }
            >
              <option value="">All Customers</option>
              {customers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-status">Status</label>

            <select
              id="outgoing-status"
              value={status}
              onChange={(event) =>
                changeFilter(setStatus, event.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="outgoing-reset-wrapper">
            <Button
              className="outgoing-reset-button"
              onClick={resetFilters}
            >
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
        </div>
      )}

      <div className="outgoing-stock-table-card">
        <StorageTable
          warehouses={tableData}
          columns={outgoingStockColumns}
          onView={handleView}
          emptyMessage={
            loading
              ? "Loading outgoing stock..."
              : error || "No outgoing stock records found."
          }
        />

        {!loading && !error && (
          <div className="outgoing-stock-footer">
            <span className="pagination-info">
              Showing {filteredData.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredData.length
              )}
              {" of "}
              {filteredData.length} records
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
          className="outgoing-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="outgoing-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outgoing-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="outgoing-modal-header">
              <h2 id="outgoing-details-title">
                Outgoing Stock Details
              </h2>

              <Button
                className="outgoing-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="outgoing-details-grid">
              {outgoingStockColumns.map((column) => {
                const value = getValue(
                  selectedRecord,
                  [column.key],
                  "-"
                );

                return (
                  <div
                    className="outgoing-detail-item"
                    key={column.key}
                  >
                    <span>{column.label}</span>
                    <strong>
                      {column.key === "date"
                        ? formatDate(value)
                        : value}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="outgoing-modal-footer">
              <Button
                className="outgoing-modal-done"
                onClick={closeModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutgoingStock;