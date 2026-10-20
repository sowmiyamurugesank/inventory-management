import { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";

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
  const [activeFilter, setActiveFilter] = useState("search");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const getStatus = (item) => {
    if (item.quantity === undefined || item.quantity === null) {
      return "";
    }

    if (Number(item.quantity) === 0) {
      return "Out of Stock";
    }

    if (Number(item.quantity) <=5) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...Array.from(
      new Set(data.map((item) => item.category).filter(Boolean))
    ).map((name) => ({
      label: name,
      value: name,
    })),
  ];

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "In Stock", value: "In Stock" },
    { label: "Low Stock", value: "Low Stock" },
    { label: "Out of Stock", value: "Out of Stock" },
  ];

  const searchData = data.filter((item) => {
    const searchText = search.toLowerCase().trim();

    return columns.some((column) => {
      const value =
        column.key === "status"
          ? getStatus(item)
          : item[column.key];

      return String(value ?? "")
        .toLowerCase()
        .includes(searchText);
    });
  });

  const categoryData = data.filter((item) => {
    return category === "all" || item.category === category;
  });

  const statusData = data.filter((item) => {
    return status === "all" || getStatus(item) === status;
  });

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

    setEditingCell({
      id: item.id,
      key: column.key,
    });

    setEditValue(item[column.key] ?? "");
  };

  const saveCell = (item, column) => {
    if (!onUpdate) return;

    const updatedItem = {
      ...item,
      [column.key]:
        column.type === "number" && editValue !== ""
          ? Number(editValue)
          : editValue,
    };

    onUpdate(updatedItem);
    setEditingCell(null);
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
          onToggle={(open) =>
            setOpenDropdown(open ? "category" : null)
          }
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
          onToggle={(open) =>
            setOpenDropdown(open ? "status" : null)
          }
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

              {(onEdit || onDelete) && <th>Actions</th>}
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
                                saveCell(item, column);
                              }

                              if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                          />
                        ) : column.key === "status" ? (
                          <span
                            className={`status-badge ${getStatus(item)
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {getStatus(item)}
                          </span>
                        ) : (
                          <span
                            onDoubleClick={() =>
                              startEditing(item, column)
                            }
                          >
                            {cellValue ?? "-"}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {(onEdit || onDelete) && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <Button onClick={() => onEdit(item)}>
                            <Pencil size={16} />
                          </Button>
                        )}

                        {onDelete && (
                          <Button onClick={() => onDelete(item.id)}>
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
                    columns.length +1
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