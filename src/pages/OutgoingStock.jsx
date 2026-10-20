
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  RotateCcw,
  X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import "../styles/OutgoingStock.css";

const API_URL = "http://localhost:5000/api/outgoing-stock";
const ITEMS_PER_PAGE = 15;

const STATUS_OPTIONS = [
  "PENDING",
  "IN_PROGRESS",
  "DISPATCHED",
  "COMPLETED",
  "RETURN",
  "CANCELLED",
];

function getCustomer(item) {
  return item.customer || item.party || item.customerName || "";
}

function getProduct(item) {
  return item.product || item.productName || "";
}

function getDate(item) {
  return item.date || item.dispatchDate || item.createdAt || "";
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

function getStatusClass(status) {
  return String(status || "PENDING")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function OutgoingStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("");
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
          throw new Error("Unable to load outgoing stock.");
        }

        const result = await response.json();

        if (Array.isArray(result)) {
          setData(result);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else {
          throw new Error("Unexpected data format from backend.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load outgoing stock."
          );
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
    () => [...new Set(data.map(getProduct).filter(Boolean))],
    [data]
  );

  const customers = useMemo(
    () => [...new Set(data.map(getCustomer).filter(Boolean))],
    [data]
  );

  const filteredData = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return data.filter((item) => {
      const itemProduct = getProduct(item);
      const itemCustomer = getCustomer(item);
      const itemStatus = String(item.status || "PENDING").toUpperCase();
      const itemDate = String(getDate(item)).slice(0, 10);

      const matchesSearch = [
        getDate(item),
        itemProduct,
        itemCustomer,
        item.quantity,
        item.warehouse,
        item.invoiceNo,
        item.invoice,
        itemStatus,
        item.remarks,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(searchText)
      );

      return (
        matchesSearch &&
        (!product || itemProduct === product) &&
        (!customer || itemCustomer === customer) &&
        (!date || itemDate === date) &&
        (!status || itemStatus === status)
      );
    });
  }, [data, search, product, customer, date, status]);

  const totalPages = Math.ceil(
    filteredData.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const pendingCount = data.filter(
    (item) => String(item.status || "").toUpperCase() === "PENDING"
  ).length;

  const inProgressCount = data.filter(
    (item) =>
      String(item.status || "").toUpperCase() === "IN_PROGRESS"
  ).length;

  const completedCount = data.filter(
    (item) =>
      String(item.status || "").toUpperCase() === "COMPLETED"
  ).length;

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setProduct("");
    setCustomer("");
    setDate("");
    setStatus("");
    setPage(1);
  }

  return (
    <div className="outgoing-stock-page">
      <div className="outgoing-stock-heading">
        <div>
          <h1>Outgoing Stock</h1>
          <p>Track outgoing products and delivery status</p>
        </div>
      </div>

      <div className="outgoing-stock-summary">
        <StatCard
          title="Total Outgoing"
          value={data.length.toLocaleString("en-IN")}
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
          icon={<Truck />}
        />

        <StatCard
          title="Completed"
          value={completedCount.toLocaleString("en-IN")}
          icon={<CheckCircle />}
        />
      </div>

      <div className="outgoing-stock-toolbar">
        <div className="outgoing-search-box">
          <Search className="outgoing-search-icon" />

          <input
            type="text"
            placeholder="Search product, customer, invoice..."
            value={search}
            onChange={(e) =>
              changeFilter(setSearch, e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="outgoing-clear-search"
              onClick={() => changeFilter(setSearch, "")}
              aria-label="Clear search"
            >
              <X className="outgoing-small-icon" />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`outgoing-filter-button ${
            showFilters ? "filter-active" : ""
          }`}
          onClick={() => setShowFilters((current) => !current)}
          aria-expanded={showFilters}
        >
          <Filter className="outgoing-filter-icon" />
          Filters
          {showFilters ? (
            <X className="outgoing-small-icon" />
          ) : (
            <ChevronDown className="outgoing-small-icon" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="outgoing-filter-panel">
          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-product">Product</label>

            <select
              id="outgoing-product"
              value={product}
              onChange={(e) =>
                changeFilter(setProduct, e.target.value)
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
            <label htmlFor="outgoing-customer">
              Customer / Party
            </label>

            <select
              id="outgoing-customer"
              value={customer}
              onChange={(e) =>
                changeFilter(setCustomer, e.target.value)
              }
            >
              <option value="">All Customers / Parties</option>
              {customers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-date">Date</label>

            <div className="outgoing-date-input">
              <CalendarDays className="outgoing-date-icon" />

              <input
                id="outgoing-date"
                type="date"
                value={date}
                onChange={(e) =>
                  changeFilter(setDate, e.target.value)
                }
              />
            </div>
          </div>

          <div className="outgoing-filter-field">
            <label htmlFor="outgoing-status">Status</label>

            <select
              id="outgoing-status"
              value={status}
              onChange={(e) =>
                changeFilter(setStatus, e.target.value)
              }
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="outgoing-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw className="outgoing-small-icon" />
            Reset Filters
          </button>
        </div>
      )}

      <div className="outgoing-stock-table-card">
        <div className="outgoing-table-wrapper">
          <table className="outgoing-stock-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Customer / Party</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Invoice No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="outgoing-table-message">
                    Loading outgoing stock...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="outgoing-table-message">
                    {error}
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="outgoing-table-message">
                    No outgoing stock records found.
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => {
                  const itemStatus = String(
                    item.status || "PENDING"
                  ).toUpperCase();

                  return (
                    <tr
                      key={
                        item.id ??
                        item._id ??
                        `${item.invoiceNo || "outgoing"}-${startIndex + index}`
                      }
                    >
                      <td>{formatDate(getDate(item))}</td>

                      <td className="outgoing-product-cell">
                        {getProduct(item) || "-"}
                      </td>

                      <td>{getCustomer(item) || "-"}</td>

                      <td className="outgoing-quantity-cell">
                        {Number(item.quantity) || 0}
                      </td>

                      <td>{item.warehouse || "-"}</td>

                      <td>{item.invoiceNo || item.invoice || "-"}</td>

                      <td>
                        <span
                          className={`outgoing-status-badge ${getStatusClass(
                            itemStatus
                          )}`}
                        >
                          {itemStatus.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="outgoing-view-button"
                          onClick={() => setSelectedRecord(item)}
                          aria-label="View outgoing stock details"
                          title="View details"
                        >
                          <Eye className="outgoing-action-icon" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && (
          <div className="outgoing-stock-footer">
            <span className="outgoing-pagination-info">
              Showing{" "}
              {filteredData.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredData.length
              )}{" "}
              of {filteredData.length} records
            </span>

            <div className="outgoing-pagination">
              <button
                type="button"
                className="outgoing-pagination-button"
                disabled={safePage === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                aria-label="Previous page"
              >
                <ChevronLeft className="outgoing-page-icon" />
              </button>

              <span className="outgoing-pagination-current">
                {safePage}
              </span>

              <span className="outgoing-pagination-total">
                of {Math.max(totalPages, 1)}
              </span>

              <button
                type="button"
                className="outgoing-pagination-button"
                disabled={totalPages === 0 || safePage >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                aria-label="Next page"
              >
                <ChevronRight className="outgoing-page-icon" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div
          className="outgoing-modal-overlay"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="outgoing-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outgoing-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="outgoing-modal-header">
              <div>
                <h2 id="outgoing-details-title">
                  Outgoing Stock Details
                </h2>
                <p>Stock transaction information</p>
              </div>

              <button
                type="button"
                className="outgoing-modal-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
              >
                <X className="outgoing-modal-close-icon" />
              </button>
            </div>

            <div className="outgoing-details-grid">
              {[
                ["Date", formatDate(getDate(selectedRecord))],
                ["Product", getProduct(selectedRecord)],
                ["Customer / Party", getCustomer(selectedRecord)],
                ["Quantity", selectedRecord.quantity],
                ["Warehouse", selectedRecord.warehouse],
                [
                  "Invoice Number",
                  selectedRecord.invoiceNo || selectedRecord.invoice,
                ],
                ["Status", selectedRecord.status],
                ["Remarks", selectedRecord.remarks],
              ].map(([label, value]) => (
                <div className="outgoing-detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? "-"}</strong>
                </div>
              ))}
            </div>

            <div className="outgoing-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutgoingStock;
