
import { Trash2 } from "lucide-react";
import "../styles/StorageTable.css";

function StorageTable({ warehouses = [], onDelete }) {
  return (
    <div className="storage-table-container">
      <table className="storage-table">
        <thead>
          <tr>
            <th>Warehouse</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-message">
                No warehouses found
              </td>
            </tr>
          ) : (
            warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>
                  <div className="warehouse-name">
                    {warehouse.name || "-"}
                  </div>

                  <div className="warehouse-code">
                    {warehouse.code || "-"}
                  </div>
                </td>

                <td>{warehouse.location || "-"}</td>
                <td>{warehouse.capacity ?? "-"}</td>

                <td>
                  <span
                    className={`warehouse-status ${
                      warehouse.status?.toLowerCase() === "active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {warehouse.status || "Unknown"}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="delete-icon-btn"
                    onClick={() => onDelete?.(warehouse.id)}
                    aria-label={`Delete ${warehouse.name || "warehouse"}`}
                    title="Delete warehouse"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StorageTable;
