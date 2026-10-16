
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import Button from "./Button";
import Dropdown from "./Dropdown";
import Pagination from "./Pagination";
import "../styles/Table.css";

function Table({
  data = [],
  columns = [],
  onUpdate,
  onEdit,
  onDelete,
  itemsPerPage = 15,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Calculate stock status automatically
  const getStatus = (item) => {
    if (item.quantity === undefined || item.quantity === null) {
      return "";
    }

    const quantity = Number(item.quantity);

    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";

    return "In Stock";
  };

  // Category dropdown options
  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...Array.from(
      new Set(data.map((item) => item.category).filter(Boolean))
    ).map((name) => ({
      label: name,
      value: name,
    })),
  ];

  // Status dropdown options
  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "In Stock", value: "In Stock" },
    { label: "Low Stock", value: "Low Stock" },
    { label: "Out of Stock", value: "Out of Stock" },
  ];

  // Search + Category + Status filters work together
  const filteredData = data.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch = columns.some((column) => {
      const value =
        column.key === "status"
          ? getStatus(item)
          : item[column.key];

      return String(value ?? "")
        .toLowerCase()
        .includes(searchText);
    });

    const matchesCategory =
      category === "all" || item.category === category;

    const matchesStatus =
      status === "all" || getStatus(item) === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const pageData = filteredData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  // Start inline editing
  const startEditing = (item, column) => {
    if (!column.editable || !onUpdate || column.key === "status") {
      return;
    }

    setEditingCell({
      id: item.id,
      key: column.key,
    });

    setEditValue(item[column.key] ?? "");
  };

  // Save edited cell
  const saveCell = (item, column) => {
    if (!onUpdate || !editingCell) return;

    const updatedItem = {
      ...item,
      [column.key]:
        column.type === "number"
          ? editValue === ""
            ? ""
            : Number(editValue)
          : editValue,
    };

    setEditingCell(null);
    onUpdate(updatedItem);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div className="table-container">
      {/* Search and Filters */}
      <div className="table-toolbar">
        <input
          type="text"
          className="table-search"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {data.some((item) => item.category) && (
          <Dropdown
            options={categoryOptions}
            value={category}
            onChange={(value) => {
              setCategory(value);
              setCurrentPage(1);
            }}
            placeholder="All Categories"
          />
        )}

        {data.some(
          (item) => item.quantity !== undefined && item.quantity !== null
        ) && (
          <Dropdown
            options={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            placeholder="All Status"
          />
        )}
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th>S.No</th>

              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}

              {(onEdit || onDelete) && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {pageData.length > 0 ? (
              pageData.map((item, index) => (
                <tr key={item.id ?? index}>
                  {/* Serial Number */}
                  <td>
                    {(safePage - 1) * itemsPerPage + index + 1}
                  </td>

                  {columns.map((column) => {
                    const isEditing =
                      editingCell?.id === item.id &&
                      editingCell?.key === column.key;

                    const cellValue =
                      column.key === "status"
                        ? getStatus(item)
                        : item[column.key];

                    return (
                      <td key={column.key}>
                        {isEditing ? (
                          <input
                            className="cell-input"
                            type={column.type || "text"}
                            step={column.step}
                            value={editValue}
                            autoFocus
                            onChange={(e) =>
                              setEditValue(e.target.value)
                            }
                            onBlur={() => saveCell(item, column)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }

                              if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                          />
                        ) : column.key === "status" ? (
                          <span
                            className={`status-badge ${getStatus(item)
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {getStatus(item) || "-"}
                          </span>
                        ) : (
                          <span
                            onDoubleClick={() =>
                              startEditing(item, column)
                            }
                            className={
                              column.editable && onUpdate
                                ? "editable-cell"
                                : ""
                            }
                          >
                            {cellValue ?? "-"}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Edit and Delete Actions */}
                  {(onEdit || onDelete) && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <Button
                            type="button"
                            className="edit-button"
                            onClick={() => onEdit(item)}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            type="button"
                            className="delete-button"
                            onClick={() => onDelete(item.id)}
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
                    1 + columns.length + (onEdit || onDelete ? 1 : 0)
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

      {/* Footer and Pagination */}
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
