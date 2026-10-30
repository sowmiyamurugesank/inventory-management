import { useEffect, useRef, useState } from "react";
import "../styles/StorageTable.css";

function StorageTable({
  warehouses = [],
  columns = [],
  onView,
  viewLabel = "View",
  onEdit,
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
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);
  const originalRef = useRef(null);
  const latestDraftRef = useRef({});
  const savingRef = useRef(false);

  // Check whether any action is available.
  const hasActions = Boolean(
    onEdit || onView || onDelete || onUpdate || onDamage
  );

  const totalColumns =
    columns.length +
    (showSerial ? 1 : 0) +
    (hasActions ? 1 : 0);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // -----------------------------------
  // INLINE EDIT - Used by Warehouse
  // -----------------------------------

  function startEdit(row) {
    if (savingRef.current) return;

    clearTimeout(timerRef.current);

    const rowId = row.id ?? row._id;

    originalRef.current = { ...row };

    const initialDraft = { ...row };

    for (const column of columns) {
      if (column.editKey) {
        initialDraft[column.key] =
          row[column.editKey] ??
          row.custom_attributes?.[column.editKey] ??
          "";
      }
    }

    latestDraftRef.current = initialDraft;

    setEditingId(rowId);
    setDraft(initialDraft);
    setSaveStatus("");
    setSaveError("");
  }

  // -----------------------------------
  // SAVE INLINE EDIT
  // -----------------------------------

  async function saveRow(rowId, updatedDraft) {
    if (!onUpdate || savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    setSaveStatus("saving");
    setSaveError("");

    try {
      await onUpdate(rowId, updatedDraft);

      originalRef.current = { ...updatedDraft };

      setSaveStatus("saved");

      return true;
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error.message || "Unable to save changes.");

      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  // -----------------------------------
  // HANDLE INLINE INPUT CHANGE
  // -----------------------------------

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

  // -----------------------------------
  // CANCEL INLINE EDIT
  // -----------------------------------

  function cancelEdit() {
    if (savingRef.current) return;

    clearTimeout(timerRef.current);

    const original = originalRef.current || {};

    latestDraftRef.current = { ...original };

    setDraft({ ...original });
    setEditingId(null);
    setSaveStatus("");
    setSaveError("");
  }

  // -----------------------------------
  // KEYBOARD EVENTS
  // -----------------------------------

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }

    if (event.key === "Enter" && event.target.tagName === "INPUT") {
      event.preventDefault();
      finishEdit();
    }
  }

  // -----------------------------------
  // FINISH INLINE EDIT
  // -----------------------------------

  async function finishEdit() {
    if (savingRef.current) return;

    clearTimeout(timerRef.current);

    const rowId = editingId;
    const currentDraft = latestDraftRef.current;

    if (
      JSON.stringify(currentDraft) !==
      JSON.stringify(originalRef.current)
    ) {
      const saved = await saveRow(rowId, currentDraft);

      if (!saved) return;
    }

    setEditingId(null);
    setSaveStatus("");
    setSaveError("");
  }

  // -----------------------------------
  // RENDER TABLE
  // -----------------------------------

  return (
    <div className="storage-table-container">
      <table className="storage-table">
        <thead>
          <tr>
            {showSerial && <th>S.No</th>}

            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
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
                  {showSerial && (
                    <td>{index + 1}</td>
                  )}

                  {/* TABLE DATA */}

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
                            disabled={saveStatus === "saving"}
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

                  {/* ACTIONS */}

                  {hasActions && (
                    <td>
                      <div className="warehouse-actions">

                        {/* FULL FORM EDIT - Used by Zone */}

                        {onEdit && (
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </button>
                        )}

                        {/* INLINE EDIT - Used by Warehouse */}

                        {!onEdit && onUpdate && (
                          isEditing ? (
                            <button
                              type="button"
                              className="view-btn"
                              onClick={finishEdit}
                              disabled={saveStatus === "saving"}
                            >
                              {saveStatus === "saving"
                                ? "Saving..."
                                : "Done"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="view-btn"
                              onClick={() => startEdit(row)}
                              disabled={isSaving}
                            >
                              Edit
                            </button>
                          )
                        )}

                        {/* VIEW */}

                        {onView && (
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => onView(row)}
                          >
                            {viewLabel}
                          </button>
                        )}

                        {/* DAMAGE REPORT */}

                        {onDamage && (
                          <button
                            type="button"
                            className="damage-btn"
                            onClick={() => onDamage(row)}
                          >
                            Report Damage
                          </button>
                        )}

                        {/* DELETE */}

                        {onDelete && (
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => onDelete(rowId)}
                            disabled={isSaving}
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* INLINE SAVE STATUS */}

                      {isEditing && (
                        <div
                          className="inline-save-status"
                          role="status"
                        >
                          {saveStatus === "pending" &&
                            "Unsaved changes"}

                          {saveStatus === "saving" &&
                            "Saving..."}

                          {saveStatus === "saved" &&
                            "Saved"}

                          {saveStatus === "error" &&
                            saveError}
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