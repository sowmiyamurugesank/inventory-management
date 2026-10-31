
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
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

import "../styles/IncomingStock.css";

const API_URL = "http://localhost:5000/api/incoming-stock";
const ITEMS_PER_PAGE = 10;

const incomingStockColumns = [
  { key: "date", label: "Date", editable: false },
  { key: "product", label: "Product", editable: false },
  { key: "supplier", label: "Supplier", editable: false },
  { key: "quantity", label: "Quantity", editable: false },
  { key: "warehouse", label: "Warehouse", editable: false },
  { key: "invoiceNo", label: "Invoice No.", editable: false },
  { key: "stockType", label: "Stock Type", editable: false },
  { key: "status", label: "Status", editable: false },
];

function getValue(item, keys, fallback = "") {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return item[key];
    }
  }

  return fallback;
}

function getStockType(item) {
  return getValue(item, ["stockType", "receivingType", "type"], "-");
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
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        const records = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.incomingStock)
              ? result.incomingStock
              : [];

        setData(records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load incoming stock.");
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

  const todayString = new Date().toLocaleDateString("en-CA");

  const totalReceived = useMemo(() => {
    return data.reduce((total, item) => {
      return (
        total +
        (Number(getValue(item, ["quantity", "receivedQuantity", "qty"], 0)) || 0)
      );
    }, 0);
  }, [data]);

  const receivedToday = useMemo(() => {
    return data
      .filter((item) => {
        const itemDate = String(
          getValue(item, ["date", "receivedDate", "createdAt"])
        ).slice(0, 10);

        return itemDate === todayString;
      })
      .reduce((total, item) => {
        return (
          total +
          (Number(getValue(item, ["quantity", "receivedQuantity", "qty"], 0)) || 0)
        );
      }, 0);
  }, [data, todayString]);

  const products = useMemo(
    () => [
      ...new Set(
        data
          .map((item) =>
            getValue(item, ["product", "productName", "name"])
          )
          .filter(Boolean)
      ),
    ],
    [data]
  );

  const suppliers = useMemo(
    () => [
      ...new Set(
        data
          .map((item) =>
            getValue(item, ["supplier", "supplierName", "vendor"])
          )
          .filter(Boolean)
      ),
    ],
    [data]
  );

  const warehouses = useMemo(
    () => [
      ...new Set(
        data
          .map((item) =>
            getValue(item, ["warehouse", "warehouseName", "location"])
          )
          .filter(Boolean)
      ),
    ],
    [data]
  );

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = String(
        getValue(item, ["date", "receivedDate", "createdAt"])
      ).slice(0, 10);

      const itemProduct = getValue(item, ["product", "productName", "name"]);
      const itemSupplier = getValue(item, ["supplier", "supplierName", "vendor"]);
      const itemWarehouse = getValue(
        item,
        ["warehouse", "warehouseName", "location"]
      );
      const itemQuantity = getValue(
        item,
        ["quantity", "receivedQuantity", "qty"]
      );
      const itemInvoice = getValue(
        item,
        ["invoiceNo", "invoice", "invoiceNumber"]
      );
      const itemStatus = getValue(item, ["status"], "Received");
      const itemType = getStockType(item);

      const searchableValues = [
        itemDate,
        itemProduct,
        itemSupplier,
        itemQuantity,
        itemWarehouse,
        itemInvoice,
        itemStatus,
        itemType,
      ];

      const searchText = search.trim().toLowerCase();

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(searchText)
      );

      return (
        matchesSearch &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate) &&
        (!product || itemProduct === product) &&
        (!supplier || itemSupplier === supplier) &&
        (!warehouse || itemWarehouse === warehouse) &&
        (!stockType || itemType.toLowerCase() === stockType.toLowerCase())
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

    date: formatDate(
      getValue(item, ["date", "receivedDate", "createdAt"])
    ),

    product: getValue(item, ["product", "productName", "name"], "-"),

    supplier: getValue(item, ["supplier", "supplierName", "vendor"], "-"),

    quantity: Number(
      getValue(item, ["quantity", "receivedQuantity", "qty"], 0)
    ),

    warehouse: getValue(
      item,
      ["warehouse", "warehouseName", "location"],
      "-"
    ),

    invoiceNo: getValue(
      item,
      ["invoiceNo", "invoice", "invoiceNumber"],
      "-"
    ),

    stockType: getStockType(item),

    status: getValue(item, ["status"], "Received"),

    originalRecord: item,
  }));

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

  function handleView(row) {
    setSelectedRecord(row.originalRecord);
  }

  function closeModal() {
    setSelectedRecord(null);
  }

  return (
    <div className="incoming-stock-page">
      <div className="incoming-stock-summary">
        <StatCard
          title="Total Received"
          value={totalReceived.toLocaleString("en-IN")}
          icon={<Package/>}
        />

        <StatCard
          title="Received Today"
          value={receivedToday.toLocaleString("en-IN")}
          icon={<CheckCircle/>}
        />
      </div>

      <div className="incoming-stock-toolbar">
        <div className="incoming-search-box">
          <Search/>

          <input
            type="text"
            placeholder="Search product, supplier, invoice..."
            value={search}
            onChange={(event) =>
              changeFilter(setSearch, event.target.value)
            }
          />
        </div>

        <Button
          className={`incoming-filter-button ${
            showFilters ? "filter-active" : ""
          }`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter/>
          Filters

          <ChevronDown
            className={showFilters ? "filter-chevron-open" : ""}
          />
        </Button>
      </div>

      {showFilters && (
        <div className="incoming-filter-panel">
          <div className="incoming-filter-field">
            <label htmlFor="incoming-from-date">From Date</label>

            <div className="incoming-date-input">
              <CalendarDays/>

              <input
                id="incoming-from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) =>
                  changeFilter(setFromDate, event.target.value)
                }
              />
            </div>
          </div>

          <div className="incoming-filter-field">
            <label htmlFor="incoming-to-date">To Date</label>

            <div className="incoming-date-input">
              <CalendarDays/>

              <input
                id="incoming-to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) =>
                  changeFilter(setToDate, event.target.value)
                }
              />
            </div>
          </div>

          <div className="incoming-filter-field">
            <label htmlFor="incoming-product">Product</label>

            <select
              id="incoming-product"
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

          <div className="incoming-filter-field">
            <label htmlFor="incoming-supplier">Supplier</label>

            <select
              id="incoming-supplier"
              value={supplier}
              onChange={(event) =>
                changeFilter(setSupplier, event.target.value)
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

          <div className="incoming-filter-field">
            <label htmlFor="incoming-stock-type">Stock Type</label>

            <select
              id="incoming-stock-type"
              value={stockType}
              onChange={(event) =>
                changeFilter(setStockType, event.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="Direct">Direct</option>
              <option value="Indirect">Indirect</option>
            </select>
          </div>

          <Button
            className="incoming-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw/>
            Reset
          </Button>
        </div>
      )}

      <div className="incoming-stock-table-card">
        <StorageTable
          warehouses={tableData}
          columns={incomingStockColumns}
          onView={handleView}
          emptyMessage={
            loading
              ? "Loading incoming stock..."
              : error || "No incoming stock records found."
          }
        />

        {!loading && !error && (
          <div className="incoming-stock-footer">
            <span className="pagination-info">
              Showing{" "}
              {filteredData.length === 0 ? 0 : startIndex + 1}
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
          className="incoming-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="incoming-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incoming-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="incoming-modal-header">
              <div>
                <h2 id="incoming-details-title">
                  Incoming Stock Details
                </h2>

                <p>Stock transaction information</p>
              </div>

              <Button
                className="incoming-modal-close"
                onClick={closeModal}
                aria-label="Close details"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="incoming-details-grid">
              <div className="incoming-detail-item">
                <span>Date</span>
                <strong>
                  {formatDate(
                    getValue(selectedRecord, [
                      "date",
                      "receivedDate",
                      "createdAt",
                    ])
                  )}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Product</span>
                <strong>
                  {getValue(
                    selectedRecord,
                    ["product", "productName", "name"],
                    "-"
                  )}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Supplier</span>
                <strong>
                  {getValue(
                    selectedRecord,
                    ["supplier", "supplierName", "vendor"],
                    "-"
                  )}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Quantity</span>
                <strong>
                  {Number(
                    getValue(
                      selectedRecord,
                      ["quantity", "receivedQuantity", "qty"],
                      0
                    )
                  ) || 0}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Warehouse</span>
                <strong>
                  {getValue(
                    selectedRecord,
                    ["warehouse", "warehouseName", "location"],
                    "-"
                  )}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Invoice Number</span>
                <strong>
                  {getValue(
                    selectedRecord,
                    ["invoiceNo", "invoice", "invoiceNumber"],
                    "-"
                  )}
                </strong>
              </div>

              <div className="incoming-detail-item">
                <span>Stock Type</span>
                <strong>{getStockType(selectedRecord)}</strong>
              </div>

              <div className="incoming-detail-item">
                <span>Status</span>
                <strong>
                  {getValue(selectedRecord, ["status"], "Received")}
                </strong>
              </div>
            </div>

            <div className="incoming-modal-footer">
              <Button
                className="incoming-modal-done"
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

export default IncomingStock;
