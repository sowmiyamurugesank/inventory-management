
import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import "../styles/ZoneTypeForm.css";

const INITIAL_FORM = {
  zoneTypeCode: "",
  numericCode: 0,
  zoneTypeName: "",
  zonePurpose: "",
  storageType: "Ambient",
  temperatureControl: false,
  minTemp: -18,
  maxTemp: -10,
  tempUnit: "Celsius (°C)",
  humidityControl: false,
  minHumidity: 30,
  maxHumidity: 60,
  status: true,
  availableForSelection: true,
  description: "",
};

const ZONE_PURPOSES = [
  "Storage",
  "Receiving",
  "Picking",
  "Packing",
  "Dispatch",
];

const STORAGE_TYPES = [
  "Ambient",
  "Refrigerated",
  "Frozen",
  "Hazardous",
];

const TEMP_UNITS = [
  "Celsius (°C)",
  "Fahrenheit (°F)",
];

function ZoneTypeForm({ onSave, onClose, saving = false }) {
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
        minTemp: Number(form.minTemp),
        maxTemp: Number(form.maxTemp),
        minHumidity: Number(form.minHumidity),
        maxHumidity: Number(form.maxHumidity),
      });
    } catch (err) {
      setError(err.message || "Unable to save zone type.");
    }
  }

  function renderToggle(name, label, description = "") {
    return (
      <div className="zone-type-toggle-row">
        <div className="zone-type-toggle-info">
          <label htmlFor={`toggle-${name}`}>
            {label}
          </label>

          {description && <p>{description}</p>}
        </div>

        <button
          id={`toggle-${name}`}
          type="button"
          role="switch"
          aria-checked={form[name]}
          className={`zone-type-toggle ${
            form[name] ? "is-on" : ""
          }`}
          onClick={() => handleToggle(name)}
          disabled={saving}
        >
          <span />
        </button>
      </div>
    );
  }

  return (
    <div
      className="zone-type-modal-backdrop"
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
        className="zone-type-modal"
        onSubmit={handleSubmit}
      >
        <div className="zone-type-modal-header">
          <div>
            <h3>Zone Type Details</h3>
          </div>

          <button
            type="button"
            className="zone-type-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="zone-type-form-body">
          <div className="zone-type-form-grid">
            <div className="zone-type-field">
              <label htmlFor="zoneTypeCode">
                Zone Type Code <span>*</span>
              </label>

              <input
                id="zoneTypeCode"
                name="zoneTypeCode"
                value={form.zoneTypeCode}
                onChange={handleChange}
                placeholder="Enter zone type code"
                required
                disabled={saving}
              />
            </div>

            <div className="zone-type-field">
              <label htmlFor="numericCode">
                Numeric Code
              </label>

              <input
                id="numericCode"
                name="numericCode"
                type="number"
                step="1"
                value={form.numericCode}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="zone-type-field">
              <label htmlFor="zoneTypeName">
                Zone Type Name <span>*</span>
              </label>

              <input
                id="zoneTypeName"
                name="zoneTypeName"
                value={form.zoneTypeName}
                onChange={handleChange}
                placeholder="Enter zone type name"
                required
                disabled={saving}
              />
            </div>

            <div className="zone-type-field">
              <label htmlFor="zonePurpose">
                Zone Purpose
              </label>

              <select
                id="zonePurpose"
                name="zonePurpose"
                value={form.zonePurpose}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">
                  Select zone purpose
                </option>

                {ZONE_PURPOSES.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>

            <div className="zone-type-field zone-type-full-width">
              <label htmlFor="storageType">
                Storage Type <span>*</span>
              </label>

              <select
                id="storageType"
                name="storageType"
                value={form.storageType}
                onChange={handleChange}
                required
                disabled={saving}
              >
                {STORAGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="zone-type-control-section">
            <div className="zone-type-section-heading">
              <h4>Temperature Control</h4>

              {renderToggle(
                "temperatureControl",
                "Enable temperature control"
              )}
            </div>

            {form.temperatureControl && (
              <div className="zone-type-form-grid zone-type-extra-fields">
                <div className="zone-type-field">
                  <label htmlFor="minTemp">
                    Minimum Temperature
                  </label>

                  <input
                    id="minTemp"
                    name="minTemp"
                    type="number"
                    value={form.minTemp}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="zone-type-field">
                  <label htmlFor="maxTemp">
                    Maximum Temperature
                  </label>

                  <input
                    id="maxTemp"
                    name="maxTemp"
                    type="number"
                    value={form.maxTemp}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="zone-type-field zone-type-full-width">
                  <label htmlFor="tempUnit">
                    Temperature Unit
                  </label>

                  <select
                    id="tempUnit"
                    name="tempUnit"
                    value={form.tempUnit}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {TEMP_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          <section className="zone-type-control-section">
            <div className="zone-type-section-heading">
              <h4>Humidity Control</h4>

              {renderToggle(
                "humidityControl",
                "Enable humidity control"
              )}
            </div>

            {form.humidityControl && (
              <div className="zone-type-form-grid zone-type-extra-fields">
                <div className="zone-type-field">
                  <label htmlFor="minHumidity">
                    Minimum Humidity (%)
                  </label>

                  <input
                    id="minHumidity"
                    name="minHumidity"
                    type="number"
                    min="0"
                    max="100"
                    value={form.minHumidity}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="zone-type-field">
                  <label htmlFor="maxHumidity">
                    Maximum Humidity (%)
                  </label>

                  <input
                    id="maxHumidity"
                    name="maxHumidity"
                    type="number"
                    min="0"
                    max="100"
                    value={form.maxHumidity}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="zone-type-control-section">
            <h4>General Settings</h4>

            {renderToggle(
              "status",
              "Active",
              "Enable or disable this zone type."
            )}

            {renderToggle(
              "availableForSelection",
              "Available for Selection",
              "Allow this zone type to be selected in forms."
            )}
          </section>

          <div className="zone-type-field zone-type-description">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter zone type description"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        {error && (
          <p className="zone-type-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="zone-type-modal-actions">
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

export default ZoneTypeForm;
