
import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import "../styles/ZoneForm.css";

const INITIAL_FORM = {
  zoneCode: "",
  zoneName: "",
  zoneType: "",
  floorLevel: 0,
  maxCapacity: "",
  capacityUnit: "Units",
  allowPicking: true,
  allowReceiving: true,
  requireInspection: true,
};

const ZONE_TYPES = [
  "Storage",
  "Receiving",
  "Picking",
  "Packing",
  "Dispatch",
  "Returns",
  "Quarantine",
];

const CAPACITY_UNITS = [
  "Units",
  "Pallets",
  "Kilograms",
  "Cubic meters",
  "Boxes",
];

function ZoneForm({ onSave, onClose, saving = false }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [error, setError] = useState("");

  // Escape key press pannina modal close aagum
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCheckboxToggle(name) {
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
        floorLevel: Number(form.floorLevel),
        maxCapacity:
          form.maxCapacity === ""
            ? null
            : Number(form.maxCapacity),
      });
    } catch (err) {
      setError(err.message || "Unable to save zone.");
    }
  }

  return (
    <div
      className="zone-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <form
        className="zone-modal"
        onSubmit={handleSubmit}
      >
        <div className="zone-modal-header">
          <div>
            <h3>Zone Details</h3>
          </div>

          <button
            type="button"
            className="zone-close-btn"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="zone-form-body">
          <div className="zone-form-grid">
            <div className="zone-field">
              <label htmlFor="zoneCode">
                Zone Code <span>*</span>
              </label>

              <input
                id="zoneCode"
                name="zoneCode"
                type="text"
                placeholder="e.g. A-01"
                value={form.zoneCode}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            <div className="zone-field">
              <label htmlFor="zoneName">
                Zone Name <span>*</span>
              </label>

              <input
                id="zoneName"
                name="zoneName"
                type="text"
                placeholder="e.g. Storage A"
                value={form.zoneName}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            <div className="zone-field">
              <label htmlFor="zoneType">
                Zone Type <span>*</span>
              </label>

              <select
                id="zoneType"
                name="zoneType"
                value={form.zoneType}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="" disabled>
                  Select zone type
                </option>

                {ZONE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="zone-field">
              <label htmlFor="floorLevel">
                Floor Level
              </label>

              <input
                id="floorLevel"
                name="floorLevel"
                type="number"
                step="1"
                value={form.floorLevel}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="zone-field">
              <label htmlFor="maxCapacity">
                Maximum Capacity
              </label>

              <input
                id="maxCapacity"
                name="maxCapacity"
                type="number"
                min="0"
                step="any"
                placeholder="Enter maximum capacity"
                value={form.maxCapacity}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="zone-field">
              <label htmlFor="capacityUnit">
                Capacity Unit
              </label>

              <select
                id="capacityUnit"
                name="capacityUnit"
                value={form.capacityUnit}
                onChange={handleChange}
                disabled={saving}
              >
                {CAPACITY_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="zone-options">
            <h4>Zone Options</h4>

            <label className="zone-checkbox">
              <input
                type="checkbox"
                checked={form.allowPicking}
                onChange={() =>
                  handleCheckboxToggle("allowPicking")
                }
                disabled={saving}
              />
              <span>Allow picking</span>
            </label>

            <label className="zone-checkbox">
              <input
                type="checkbox"
                checked={form.allowReceiving}
                onChange={() =>
                  handleCheckboxToggle("allowReceiving")
                }
                disabled={saving}
              />
              <span>Allow receiving</span>
            </label>

            <label className="zone-checkbox">
              <input
                type="checkbox"
                checked={form.requireInspection}
                onChange={() =>
                  handleCheckboxToggle("requireInspection")
                }
                disabled={saving}
              />
              <span>Require inspection</span>
            </label>
          </div>
        </div>

        {error && (
          <p className="zone-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="zone-modal-actions">
          <Button
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ZoneForm;
