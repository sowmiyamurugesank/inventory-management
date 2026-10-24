
import "../styles/StorageTable.css";

function StorageTable({
  warehouses = [],
  columns = [],
  onView,
  onDelete,
  showSerial = false,
  emptyMessage = "No records found",
}) {
  const hasActions = Boolean(onView || onDelete);
  const totalColumns =
    columns.length + (showSerial ? 1 : 0) + (hasActions ? 1 : 0);

  return (
    <div className="storage-table-container">
      <table className="storage-table">
        <thead>
          <tr>
            {showSerial && <th>S.No</th>}

            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}

            {hasActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={Math.max(totalColumns, 1)} className="empty-message">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            warehouses.map((row, index) => {
              const rowId = row.id ?? row._id ?? index;

              return (
                <tr key={rowId}>
                  {showSerial && <td>{index + 1}</td>}

                  {columns.map((column) => {
                    const value = row[column.key];

                    return (
                      <td key={column.key}>
                        {column.key === "status" ? (
                          <span
                            className={`warehouse-status ${
                              String(value).toLowerCase() === "active" ||
                              value === true
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {value === true
                              ? "Active"
                              : value === false
                                ? "Inactive"
                                : value ?? "-"}
                          </span>
                        ) : (
                          value ?? "-"
                        )}
                      </td>
                    );
                  })}

                  {hasActions && (
                    <td>
                      <div className="warehouse-actions">
                        {onView && (
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => onView(row)}
                          >
                            View
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => onDelete(rowId)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StorageTable;
