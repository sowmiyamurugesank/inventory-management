
import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import "../styles/ZoneForm.css";

const INITIAL_FORM = {
  warehouseId: "",
  warehouseZoneTypeId: "",
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

const CAPACITY_UNITS = [
  "Units",
  "Pallets",
  "Kilograms",
  "Cubic meters",
  "Boxes",
];

function ZoneForm({
  warehouses = [],
  zoneTypes = [],
  initialData = null,
  onSave,
  onClose,
  saving = false,
}) {
  const [form, setForm] = useState({ ...INITIAL_FORM });

  useEffect(() => {
  if (!initialData) {
    setForm({ ...INITIAL_FORM });
    return;
  }

  setForm({
    warehouseId: initialData.warehouse_id ?? "",

    warehouseZoneTypeId:
      initialData.warehouse_zone_type_id ?? "",

    zoneCode:
      initialData.code ??
      initialData.zoneCode ??
      "",

    zoneName:
      initialData.name ??
      initialData.zoneName ??
      "",

    zoneType:
      initialData.zoneType ??
      initialData.zone_type_name ??
      "",

    floorLevel:
      initialData.floor_level ?? 0,

    maxCapacity:
      initialData.maximum_capacity ?? "",

    capacityUnit:
      initialData.capacity_unit ?? "Units",

    allowPicking:
      initialData.is_pickable ?? true,

    allowReceiving:
      initialData.is_receivable ?? true,

    requireInspection:
      initialData.requires_inspection ?? true,
  });

  setError("");
}, [initialData]);
  const [error, setError] = useState("");

  // Close the modal when the Escape key is pressed.
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

  // Handle text inputs, number inputs, and select fields.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Handle checkbox changes.
  function handleCheckboxToggle(name) {
    setForm((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  }

  // Submit the form.
  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!form.warehouseId) {
      setError("Please select a warehouse.");
      return;
    }

    if (!form.warehouseZoneTypeId) {
      setError("Please select a zone type.");
      return;
    }

    if (!form.zoneCode.trim()) {
      setError("Zone code is required.");
      return;
    }

    if (!form.zoneName.trim()) {
      setError("Zone name is required.");
      return;
    }

    try {
      await onSave({
        ...form,
        zoneCode: form.zoneCode.trim(),
        zoneName: form.zoneName.trim(),
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
        {/* Modal Header */}
        <div className="zone-modal-header">
          <h3>Zone Details</h3>

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

        {/* Form Body */}
        <div className="zone-form-body">
          <div className="zone-form-grid">

            {/* Row 1: Zone Code */}
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

            {/* Row 1: Zone Name */}
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

            {/* Row 2: Warehouse */}
            <div className="zone-field">
              <label htmlFor="warehouseId">
                Warehouse <span>*</span>
              </label>

              <select
                id="warehouseId"
                name="warehouseId"
                value={form.warehouseId}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="" disabled>
                  Select warehouse
                </option>

                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                  >
                    {warehouse.name ??
                      warehouse.warehouse_name ??
                      warehouse.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Zone Type */}
            <div className="zone-field">
              <label htmlFor="warehouseZoneTypeId">
                Zone Type <span>*</span>
              </label>

              <select
                id="warehouseZoneTypeId"
                name="warehouseZoneTypeId"
                value={form.warehouseZoneTypeId}
                onChange={(event) => {
                  const selectedId = event.target.value;

                  const selectedType = zoneTypes.find(
                    (type) =>
                      String(type.id) === selectedId
                  );

                  setForm((previous) => ({
                    ...previous,
                    warehouseZoneTypeId: selectedId,
                    zoneType: selectedType?.name ?? "",
                  }));
                }}
                required
                disabled={saving}
              >
                <option value="" disabled>
                  Select zone type
                </option>

                {zoneTypes.map((type) => (
                  <option
                    key={type.id}
                    value={type.id}
                  >
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Floor Level */}
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

            {/* Row 3: Maximum Capacity */}
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

            {/* Row 4: Capacity Unit */}
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

          {/* Zone Options */}
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

        {/* Validation / API Error */}
        {error && (
          <p
            className="zone-form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Modal Footer */}
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

