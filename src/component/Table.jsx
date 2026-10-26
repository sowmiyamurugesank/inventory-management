
import { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Pagination from "./Pagination";
import Badge from "../component/Atom/Badge";
import "../styles/Table.css";

function Table({
  data = [],
  columns = [],
  onUpdate,
  onEdit,
  onDelete,
  onView,
  itemsPerPage = 15,
  type = "stock",
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [activeFilter, setActiveFilter] = useState("search");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const getStatus = (item) => {
    if (item.quantity === undefined || item.quantity === null) return "-";

    const quantity = Number(item.quantity) || 0;

    if (quantity <= 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";
    return "In Stock";
  };

  const getItemStatus = (item) => {
    if (type === "stock") return getStatus(item);
    return item.status || "Unknown";
  };

  const getBadgeVariant = (value) => {
    const normalized = String(value || "").toLowerCase().trim();

    if (
      ["passed", "accepted", "completed", "inspected", "received", "closed"].includes(
        normalized
      )
    ) {
      return "success";
    }

    if (
      ["pending", "awaiting inspection", "partially received"].includes(
        normalized
      )
    ) {
      return "warning";
    }

    if (
      ["failed", "rejected", "cancelled", "canceled"].includes(normalized)
    ) {
      return "danger";
    }

    return "default";
  };

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...Array.from(
      new Set(data.map((item) => item.category).filter(Boolean))
    ).map((name) => ({ label: name, value: name })),
  ];

  const statusValues =
    type === "stock"
      ? ["In Stock", "Low Stock", "Out of Stock"]
      : [...new Set(data.map((item) => item.status).filter(Boolean))];

  const statusOptions = [
    { label: "All Status", value: "all" },
    ...statusValues.map((value) => ({ label: value, value })),
  ];

  const searchData = data.filter((item) => {
    const searchText = search.toLowerCase().trim();

    return columns.some((column) => {
      const value =
        column.key === "status" ? getItemStatus(item) : item[column.key];

      return String(value ?? "").toLowerCase().includes(searchText);
    });
  });

  const categoryData = data.filter(
    (item) => category === "all" || item.category === category
  );

  const statusData = data.filter(
    (item) => status === "all" || getItemStatus(item) === status
  );

  const filteredData =
    activeFilter === "search"
      ? searchData
      : activeFilter === "category"
        ? categoryData
        : statusData;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageData = filteredData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const startEditing = (item, column) => {
    if (!column.editable || !onUpdate) return;

    setEditingCell({ id: item.id, key: column.key });
    setEditValue(item[column.key] ?? "");
  };

  const saveCell = (item, column) => {
    if (!onUpdate || !editingCell) return;

    const value =
      column.type === "number" && editValue !== ""
        ? Number(editValue)
        : editValue;

    if (String(item[column.key] ?? "") === String(value)) {
      setEditingCell(null);
      return;
    }

    onUpdate({ ...item, [column.key]: value });
    setEditingCell(null);
  };

  const formatCellValue = (item, column) => {
    const value =
      column.key === "status" ? getItemStatus(item) : item[column.key];

    if (value === undefined || value === null || value === "") return "-";

    if (column.format === "currency") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(value) || 0);
    }

    if (column.format === "date" && value) {
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("en-IN");
    }

    return String(value);
  };

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <input
          type="text"
          className="table-search"
          placeholder="Search..."
          value={search}
          onFocus={() => {
            setActiveFilter("search");
            setCurrentPage(1);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveFilter("search");
            setCurrentPage(1);
          }}
        />

        <Dropdown
          options={categoryOptions}
          value={category}
          isOpen={openDropdown === "category"}
          onToggle={(open) => setOpenDropdown(open ? "category" : null)}
          onChange={(value) => {
            setCategory(value);
            setActiveFilter("category");
            setCurrentPage(1);
            setOpenDropdown(null);
          }}
          placeholder="All Categories"
        />

        <Dropdown
          options={statusOptions}
          value={status}
          isOpen={openDropdown === "status"}
          onToggle={(open) => setOpenDropdown(open ? "status" : null)}
          onChange={(value) => {
            setStatus(value);
            setActiveFilter("status");
            setCurrentPage(1);
            setOpenDropdown(null);
          }}
          placeholder="All Status"
        />
      </div>

      <div className="table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {(onView || onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {pageData.length > 0 ? (
              pageData.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => {
                    const isEditing =
                      editingCell?.id === item.id &&
                      editingCell?.key === column.key;

                    const isStatusColumn =
                      column.key === "status" ||
                      column.key === "inspectionStatus";

                    const cellValue =
                      column.key === "status"
                        ? getItemStatus(item)
                        : item[column.key];

                    return (
                      <td key={column.key}>
                        {isEditing ? (
                          <input
                            className="cell-input"
                            type={column.type || "text"}
                            step={column.step}
                            min={column.type === "number" ? 0 : undefined}
                            value={editValue}
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveCell(item, column)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveCell(item, column);
                              }
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                          />
                        ) : type === "receipt" && isStatusColumn ? (
                          <Badge variant={getBadgeVariant(cellValue)}>
                            {cellValue || "-"}
                          </Badge>
                        ) : isStatusColumn ? (
                          <span
                            className={`status-badge ${String(cellValue)
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {cellValue || "-"}
                          </span>
                        ) : (
                          <span
                            className={column.editable ? "editable-cell" : ""}
                            onDoubleClick={() => startEditing(item, column)}
                            title={
                              column.editable ? "Double-click to edit" : ""
                            }
                          >
                            {formatCellValue(item, column)}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {(onView || onEdit || onDelete) && (
                    <td>
                      <div className="table-actions">
                        {onView && (
                          <Button onClick={() => onView(item)} title="View">
                            <Eye size={16} />
                          </Button>
                        )}
                        {onEdit && (
                          <Button onClick={() => onEdit(item)} title="Edit">
                            <Pencil size={16} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            onClick={() => onDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length + ((onView || onEdit || onDelete) ? 1 : 0)
                  }
                  className="empty-table"
                >
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>
          Showing{" "}
          {filteredData.length === 0
            ? 0
            : (safePage - 1) * itemsPerPage + 1}
          {" - "}
          {Math.min(safePage * itemsPerPage, filteredData.length)}
          {" of "}
          {filteredData.length} records
        </span>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Table;
