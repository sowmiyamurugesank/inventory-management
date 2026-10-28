
import { useRef, useState } from "react";
import "../styles/StorageTable.css";

function StorageTable({
  warehouses = [],
  columns = [],
  onView,
  onDelete,
  onUpdate,
  onDamage,
  showSerial = false,
  emptyMessage = "No records found",
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");

  const timerRef = useRef(null);
  const originalRef = useRef(null);
  const latestDraftRef = useRef({});

  const hasActions = Boolean(
    onView || onDelete || onUpdate || onDamage
  );

  const totalColumns =
    columns.length + (showSerial ? 1 : 0) + (hasActions ? 1 : 0);

  function startEdit(row) {
    clearTimeout(timerRef.current);

    const rowId = row.id ?? row._id;

    setEditingId(rowId);
    setDraft({ ...row });
    originalRef.current = { ...row };
    latestDraftRef.current = { ...row };

    setSaveStatus("");
    setSaveError("");
  }

  async function saveRow(rowId, updatedRow) {
    if (!onUpdate) return;

    setSaveStatus("saving");
    setSaveError("");

    try {
      await onUpdate(rowId, updatedRow);

      originalRef.current = { ...updatedRow };
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error.message || "Unable to save changes.");
    }
  }

  function handleChange(key, value) {
    const updatedDraft = {
      ...latestDraftRef.current,
      [key]: value,
    };

    latestDraftRef.current = updatedDraft;
    setDraft(updatedDraft);
    setSaveStatus("pending");
    setSaveError("");

    clearTimeout(timerRef.current);

    const rowId = editingId;

    timerRef.current = setTimeout(() => {
      saveRow(rowId, updatedDraft);
    }, 800);
  }

  function cancelEdit() {
    clearTimeout(timerRef.current);

    const original = originalRef.current || {};

    latestDraftRef.current = { ...original };
    setDraft({ ...original });
    setEditingId(null);
    setSaveStatus("");
    setSaveError("");
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  function finishEdit() {
    clearTimeout(timerRef.current);

    const rowId = editingId;
    const currentDraft = latestDraftRef.current;

    if (
      JSON.stringify(currentDraft) !==
      JSON.stringify(originalRef.current)
    ) {
      saveRow(rowId, currentDraft);
    }

    setEditingId(null);
  }

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
              <td
                colSpan={Math.max(totalColumns, 1)}
                className="empty-message"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            warehouses.map((row, index) => {
              const rowId = row.id ?? row._id ?? index;
              const isEditing = editingId === rowId;

              return (
                <tr key={rowId}>
                  {showSerial && <td>{index + 1}</td>}

                  {columns.map((column) => {
                    const value = isEditing
                      ? draft[column.key]
                      : row[column.key];

                    return (
                      <td key={column.key}>
                        {isEditing && column.editable !== false ? (
                          <input
                            className="storage-inline-input"
                            type={column.type || "text"}
                            value={value ?? ""}
                            onChange={(event) =>
                              handleChange(
                                column.key,
                                event.target.value
                              )
                            }
                            onKeyDown={handleKeyDown}
                            aria-label={`Edit ${column.label}`}
                          />
                        ) : column.key === "status" ? (
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
                        {onUpdate &&
                          (isEditing ? (
                            <button
                              type="button"
                              className="view-btn"
                              onClick={finishEdit}
                            >
                              Done
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="view-btn"
                              onClick={() => startEdit(row)}
                            >
                              Edit
                            </button>
                          ))}

                        {onView && (
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => onView(row)}
                          >
                            View
                          </button>
                        )}

                        {onDamage && (
                          <button
                            type="button"
                            className="damage-btn"
                            onClick={() => onDamage(row)}
                          >
                            Report Damage
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

                      {isEditing && (
                        <div className="inline-save-status">
                          {saveStatus === "pending" && "Unsaved changes"}
                          {saveStatus === "saving" && "Saving..."}
                          {saveStatus === "saved" && "Saved"}
                          {saveStatus === "error" && saveError}
                        </div>
                      )}
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
