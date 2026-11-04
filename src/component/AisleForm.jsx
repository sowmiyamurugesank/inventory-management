
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import FormField from "./Atom/FormField-LIE.jsx";
import SelectField from "./Atom/SelectField.jsx";
import Button from "./Button.jsx";
import "../styles/AisleForm.css";

const initialForm = {
  warehouseId: "WH-001",
  zoneId: "ZONE-001",
  aisleCode: "",
  aisleName: "",
  description: "",
  sequence: "1",
  aisleType: "STANDARD",
  length: "20",
  width: "3",
  height: "5",
  dimensionUnit: "METER",
  rackCapacity: "10",
  oneWayAisle: false,
  notes: "",
  status: "ACTIVE",
};

function AddAisle({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...initialData,
  }));

  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onCancel?.();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  function handleReset() {
    setForm({
      ...initialForm,
      ...initialData,
    });
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.warehouseId ||
      !form.zoneId ||
      !form.aisleCode.trim() ||
      !form.aisleName.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(Number(form.sequence)) ||
      Number(form.sequence) < 1 ||
      !Number.isFinite(Number(form.length)) ||
      Number(form.length) <= 0 ||
      !Number.isFinite(Number(form.width)) ||
      Number(form.width) <= 0 ||
      !Number.isFinite(Number(form.height)) ||
      Number(form.height) <= 0 ||
      !Number.isFinite(Number(form.rackCapacity)) ||
      Number(form.rackCapacity) < 0
    ) {
      setError(
        "Please enter valid sequence, dimensions and rack capacity."
      );
      return;
    }

    const payload = {
      ...form,
      sequence: Number(form.sequence),
      length: Number(form.length),
      width: Number(form.width),
      height: Number(form.height),
      rackCapacity: Number(form.rackCapacity),
    };

    onSubmit?.(payload);
  }

  return (
    <div
      className="aisle-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <div
        className="aisle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aisle-modal-title"
      >
        <div className="aisle-modal-header">
          <h2 id="aisle-modal-title">
            {initialData ? "Edit Aisle Details" : "Add Aisle"}
          </h2>

          <button
            type="button"
            className="aisle-modal-close"
            onClick={onCancel}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form className="aisle-form" onSubmit={handleSubmit}>
          <div className="aisle-modal-body">
            <section className="aisle-form-section">
              <h3>1. Warehouse Location</h3>

              <div className="aisle-form-grid">
                <SelectField
                  label="Warehouse"
                  name="warehouseId"
                  value={form.warehouseId}
                  onChange={handleChange}
                  options={[
                    {
                      value: "WH-001",
                      label: "WH-001 - Main Warehouse",
                    },
                    {
                      value: "WH-002",
                      label: "WH-002 - Branch Warehouse",
                    },
                  ]}
                  placeholder="Select Warehouse"
                  required
                />

                <SelectField
                  label="Warehouse Zone"
                  name="zoneId"
                  value={form.zoneId}
                  onChange={handleChange}
                  options={[
                    {
                      value: "ZONE-001",
                      label: "ZONE-001 - Storage Zone",
                    },
                    {
                      value: "ZONE-002",
                      label: "ZONE-002 - Picking Zone",
                    },
                    {
                      value: "ZONE-003",
                      label: "ZONE-003 - Receiving Zone",
                    },
                  ]}
                  placeholder="Select Zone"
                  required
                />
              </div>
            </section>

            <section className="aisle-form-section">
              <h3>2. Aisle Information</h3>

              <div className="aisle-form-grid">
                <FormField
                  label="Aisle Code"
                  name="aisleCode"
                  value={form.aisleCode}
                  onChange={handleChange}
                  placeholder="Enter aisle code"
                  required
                />

                <FormField
                  label="Aisle Name"
                  name="aisleName"
                  value={form.aisleName}
                  onChange={handleChange}
                  placeholder="Enter aisle name"
                  required
                />

                <FormField
                  label="Sequence"
                  name="sequence"
                  type="number"
                  value={form.sequence}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="Aisle Type"
                  name="aisleType"
                  value={form.aisleType}
                  onChange={handleChange}
                  options={[
                    { value: "STANDARD", label: "Standard" },
                    { value: "PICKING", label: "Picking" },
                    { value: "BULK", label: "Bulk Storage" },
                    { value: "AUTOMATED", label: "Automated" },
                  ]}
                  placeholder="Select Aisle Type"
                  required
                />

                <div className="aisle-form-full">
                  <FormField
                    label="Description"
                    name="description"
                    type="textarea"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter aisle description"
                  />
                </div>
              </div>
            </section>

            <section className="aisle-form-section">
              <h3>3. Aisle Dimensions</h3>

              <div className="aisle-form-grid">
                <FormField
                  label="Length"
                  name="length"
                  type="number"
                  value={form.length}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Width"
                  name="width"
                  type="number"
                  value={form.width}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Height"
                  name="height"
                  type="number"
                  value={form.height}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="Dimension Unit"
                  name="dimensionUnit"
                  value={form.dimensionUnit}
                  onChange={handleChange}
                  options={[
                    { value: "METER", label: "Meter" },
                    { value: "FEET", label: "Feet" },
                    { value: "CENTIMETER", label: "Centimeter" },
                    { value: "INCH", label: "Inch" },
                  ]}
                  placeholder="Select Unit"
                  required
                />
              </div>
            </section>

            <section className="aisle-form-section">
              <h3>4. Rack Configuration</h3>

              <div className="aisle-form-grid">
                <FormField
                  label="Rack Capacity"
                  name="rackCapacity"
                  type="number"
                  value={form.rackCapacity}
                  onChange={handleChange}
                  required
                />

                <label className="aisle-checkbox-row">
                  <span>
                    <strong>One Way Aisle</strong>
                    <small>
                      Restrict traffic to one direction.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    name="oneWayAisle"
                    checked={form.oneWayAisle}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </section>

            <section className="aisle-form-section">
              <h3>5. Additional Information</h3>

              <div className="aisle-form-grid">
                <div className="aisle-form-full">
                  <FormField
                    label="Notes"
                    name="notes"
                    type="textarea"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Enter additional notes"
                  />
                </div>

                <SelectField
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    {
                      value: "UNDER_MAINTENANCE",
                      label: "Under Maintenance",
                    },
                  ]}
                  placeholder="Select Status"
                  required
                />
              </div>
            </section>

            {error && (
              <p className="aisle-form-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="aisle-modal-footer">
              <div className="aisle-modal-footer-right">
            <div className="submit">
              <Button
                type="button"
                onClick={onCancel}
              >
                Cancel
              </Button>

              <Button type="submit">
                {initialData ? "Update" : "Save"}
              </Button>
            </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAisle;
