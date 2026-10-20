
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  RotateCcw,
  X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import "../styles/IncomingStock.css";


const API_URL = "http://localhost:5000/api/incoming-stock";

function getStockType(item) {
  return item.stockType || item.receivingType || item.type || "";
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

function IncomingStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [product, setProduct] = useState("");
  const [supplier, setSupplier] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [stockType, setStockType] = useState("");

  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchIncomingStock() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`
          );
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
            "Unable to load incoming stock. Check your backend URL and server."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchIncomingStock();

    return () => controller.abort();
  }, []);

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const totalReceived = data.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const receivedToday = data
    .filter(
      (item) => String(item.date || "").slice(0, 10) === todayString
    )
    .reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );

  const products = useMemo(
    () => [
      ...new Set(data.map((item) => item.product).filter(Boolean)),
    ],
    [data]
  );

  const suppliers = useMemo(
    () => [
      ...new Set(data.map((item) => item.supplier).filter(Boolean)),
    ],
    [data]
  );

  const warehouses = useMemo(
    () => [
      ...new Set(data.map((item) => item.warehouse).filter(Boolean)),
    ],
    [data]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchText = search.trim().toLowerCase();

      const searchableValues = [
        item.date,
        item.product,
        item.supplier,
        item.quantity,
        item.warehouse,
        item.invoiceNo,
        item.invoice,
        item.status,
        getStockType(item),
      ];

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(searchText)
      );

      const itemDate = String(item.date || "").slice(0, 10);

      const matchesFromDate = !fromDate || itemDate >= fromDate;
      const matchesToDate = !toDate || itemDate <= toDate;
      const matchesProduct = !product || item.product === product;
      const matchesSupplier = !supplier || item.supplier === supplier;
      const matchesWarehouse = !warehouse || item.warehouse === warehouse;

      const matchesStockType =
        !stockType ||
        getStockType(item).toLowerCase() === stockType.toLowerCase();

      return (
        matchesSearch &&
        matchesFromDate &&
        matchesToDate &&
        matchesProduct &&
        matchesSupplier &&
        matchesWarehouse &&
        matchesStockType
      );
    });
  }, [
    data,
    search,
    fromDate,
    toDate,
    product,
    supplier,
    warehouse,
    stockType,
  ]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * itemsPerPage;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  function resetFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setProduct("");
    setSupplier("");
    setWarehouse("");
    setStockType("");
    setPage(1);
  }

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="incoming-stock-page">
      <div className="incoming-stock-heading">
        <div>
          <h1>Incoming Stock</h1>
          <p>Manage stock received from suppliers</p>
        </div>
      </div>

      <div className="incoming-stock-summary">
        <StatCard
          title="Total Received"
          value={totalReceived.toLocaleString("en-IN")}
          icon={<Package size={22} />}
        />

        <StatCard
          title="Received Today"
          value={receivedToday.toLocaleString("en-IN")}
          icon={<CheckCircle size={22} />}
        />
      </div>

      <div className="incoming-stock-toolbar">
        <div className="incoming-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search product, supplier, invoice..."
            value={search}
            onChange={(e) => changeFilter(setSearch, e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`incoming-filter-button ${
            showFilters ? "filter-active" : ""
          }`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter size={17} />
          Filters
          <ChevronDown
            size={16}
            className={showFilters ? "filter-chevron-open" : ""}
          />
        </button>
      </div>

      {showFilters && (
        <div className="incoming-filter-panel">
          <div className="incoming-filter-field">
            <label htmlFor="incoming-from-date">From Date</label>

            <div className="incoming-date-input">
              <CalendarDays size={16} />

              <input
                id="incoming-from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) =>
                  changeFilter(setFromDate, e.target.value)
                }
              />
            </div>
          </div>

          <div className="incoming-filter-field">
            <label htmlFor="incoming-to-date">To Date</label>

            <div className="incoming-date-input">
              <CalendarDays size={16} />

              <input
                id="incoming-to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) =>
                  changeFilter(setToDate, e.target.value)
                }
              />
            </div>
          </div>

          <div className="incoming-filter-field">
            <label htmlFor="incoming-product">Product</label>

            <select
              id="incoming-product"
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

          <div className="incoming-filter-field">
            <label htmlFor="incoming-supplier">Supplier</label>

            <select
              id="incoming-supplier"
              value={supplier}
              onChange={(e) =>
                changeFilter(setSupplier, e.target.value)
              }
            >
              <option value="">All Suppliers</option>

              {suppliers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="incoming-filter-field">
            <label htmlFor="incoming-warehouse">Warehouse</label>

            <select
              id="incoming-warehouse"
              value={warehouse}
              onChange={(e) =>
                changeFilter(setWarehouse, e.target.value)
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

          <div className="incoming-filter-field">
            <label htmlFor="incoming-stock-type">Stock Type</label>

            <select
              id="incoming-stock-type"
              value={stockType}
              onChange={(e) =>
                changeFilter(setStockType, e.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="Direct">Direct</option>
              <option value="Indirect">Indirect</option>
            </select>
          </div>

          <button
            type="button"
            className="incoming-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      )}

      <div className="incoming-stock-table-card">
        <div className="incoming-table-wrapper">
          <table className="incoming-stock-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Invoice No.</th>
                <th>Stock Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="incoming-table-message">
                    Loading incoming stock...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="incoming-table-message">
                    {error}
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="incoming-table-message">
                    No incoming stock records found.
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => {
                  const status = item.status || "Received";
                  const type = getStockType(item);

                  return (
                    <tr
                      key={
                        item.id ??
                        item._id ??
                        `${item.invoiceNo || item.invoice || "stock"}-${startIndex + index}`
                      }
                    >
                      <td>{formatDate(item.date)}</td>

                      <td className="incoming-product-cell">
                        {item.product || "-"}
                      </td>

                      <td>{item.supplier || "-"}</td>

                      <td className="incoming-quantity-cell">
                        +{Number(item.quantity) || 0}
                      </td>

                      <td>{item.warehouse || "-"}</td>

                      <td>{item.invoiceNo || item.invoice || "-"}</td>

                      <td>
                        {type ? (
                          <span
                            className={`incoming-type-badge ${type.toLowerCase()}`}
                          >
                            {type}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <span
                          className={`incoming-status-badge ${String(status)
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="incoming-actions-cell">
                        <button
                          type="button"
                          className="incoming-view-button"
                          onClick={() => setSelectedRecord(item)}
                        >
                          View
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
          <div className="incoming-stock-footer">
            <span className="pagination-info">
              Showing {filteredData.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
              {" of "}
              {filteredData.length} records
            </span>

            <div className="incoming-pagination">
              <button
                type="button"
                className="pagination-btn"
                disabled={safePage === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                aria-label="Previous page"
              >
                <ChevronLeft className="pagination-icon" />
              </button>

              <span className="pagination-current">{safePage}</span>

              <button
                type="button"
                className="pagination-btn"
                disabled={totalPages === 0 || safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                aria-label="Next page"
              >
                <ChevronRight className="pagination-icon" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div
          className="incoming-modal-overlay"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="incoming-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incoming-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="incoming-modal-header">
              <div>
                <h2 id="incoming-details-title">
                  Incoming Stock Details
                </h2>
                <p>Stock transaction information</p>
              </div>

              <button
                type="button"
                className="incoming-modal-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="incoming-details-grid">
              <div className="incoming-detail-item">
                <span>Date</span>
                <strong>{formatDate(selectedRecord.date)}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Product</span>
                <strong>{selectedRecord.product || "-"}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Supplier</span>
                <strong>{selectedRecord.supplier || "-"}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Quantity</span>
                <strong>{Number(selectedRecord.quantity) || 0}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Warehouse</span>
                <strong>{selectedRecord.warehouse || "-"}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Invoice Number</span>
                <strong>
                  {selectedRecord.invoiceNo ||
                    selectedRecord.invoice ||
                    "-"}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Stock Type</span>
                <strong>{getStockType(selectedRecord) || "-"}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Status</span>
                <strong>{selectedRecord.status || "Received"}</strong>
              </div>
            </div>

            <div className="incoming-modal-footer">
              <button
                type="button"
                className="incoming-modal-done"
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

export default IncomingStock;
