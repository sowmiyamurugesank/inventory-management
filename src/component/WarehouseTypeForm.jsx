
import { useState } from "react";
import Button from "./Button.jsx";
import "../styles/WarehouseTypeForm.css";

const INITIAL_FORM = {
  typeCode: "",
  numericCode: "",
  warehouseType: "",
  category: "",
  description: "",
  status: true,
  availableForSelection: true,
};

const CATEGORIES = [
  "General Warehouse",
  "Distribution Center",
  "Cold Storage",
  "Raw Materials",
  "Finished Goods",
];

function WarehouseTypeForm({ onSave, onClose, saving = false }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleToggle(name) {
    setForm((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");

    try {
      await onSave({
        ...form,
        numericCode: Number(form.numericCode),
      });
    } catch (err) {
      setError(err.message || "Unable to save warehouse type.");
    }
  }

  return (
    <div
      className="warehouse-type-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <form
        className="warehouse-type-modal"
        onSubmit={handleSubmit}
      >
        <div className="warehouse-type-modal-header">
          <div>
            <h3>Warehouse Type Details</h3>
          </div>

          <button
            type="button"
            className="warehouse-type-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="warehouse-type-form-body">
          <div className="warehouse-type-form-grid">
            <div className="warehouse-type-field">
              <label htmlFor="typeCode">
                Type Code <span>*</span>
              </label>

              <input
                id="typeCode"
                name="typeCode"
                type="text"
                placeholder="Enter type code"
                value={form.typeCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="warehouse-type-field">
              <label htmlFor="numericCode">
                Numeric Code <span>*</span>
              </label>

              <input
                id="numericCode"
                name="numericCode"
                type="number"
                min="0"
                step="1"
                placeholder="Enter numeric code"
                value={form.numericCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="warehouse-type-field">
              <label htmlFor="warehouseType">
                Warehouse Type Name <span>*</span>
              </label>

              <input
                id="warehouseType"
                name="warehouseType"
                type="text"
                placeholder="Enter warehouse type name"
                value={form.warehouseType}
                onChange={handleChange}
                required
              />
            </div>

            <div className="warehouse-type-field">
              <label htmlFor="category">
                Facility Category <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select facility category
                </option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="warehouse-type-field warehouse-type-full-width">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                placeholder="Enter warehouse type description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="warehouse-type-toggle-section">
            <div className="warehouse-type-toggle-row">
              <div>
                <label htmlFor="status-toggle">Active</label>
                <p>Enable or disable this warehouse type</p>
              </div>

              <button
                id="status-toggle"
                type="button"
                className={`warehouse-type-toggle ${
                  form.status ? "is-on" : ""
                }`}
                role="switch"
                aria-checked={form.status}
                onClick={() => handleToggle("status")}
                disabled={saving}
              >
                <span />
              </button>
            </div>

            <div className="warehouse-type-toggle-row">
              <div>
                <label htmlFor="selection-toggle">
                  Available for Selection
                </label>

                <p>
                  Allow this type to be selected when creating a warehouse
                </p>
              </div>

              <button
                id="selection-toggle"
                type="button"
                className={`warehouse-type-toggle ${
                  form.availableForSelection ? "is-on" : ""
                }`}
                role="switch"
                aria-checked={form.availableForSelection}
                onClick={() => handleToggle("availableForSelection")}
                disabled={saving}
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="warehouse-type-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="warehouse-type-modal-actions">
          <Button
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default WarehouseTypeForm;
