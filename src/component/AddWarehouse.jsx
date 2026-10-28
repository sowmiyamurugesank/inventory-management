
import { useEffect, useState } from "react";
import { Ruler, Box } from "lucide-react";

import WarehouseTabs from "./WarehouseTabs.jsx";
import AttributeField from "./Atom/AttributeField.jsx";
import Button from "./Button.jsx";
import StatCard from "../StatCard.jsx";

import "../styles/AddWarehouse.css";

const warehouseTabs = ["Details", "Address", "Capacity", "Hours"];

const warehouseTypes = [
  "General",
  "Distribution",
  "Cold Storage",
  "Raw Materials",
  "Finished Goods",
].map((value) => ({ label: value, value }));

const capacityOptions = [
  "Sacks",
  "Pallets",
  "Units",
  "Boxes",
  "Cubic Meters",
  "Square Feet",
].map((value) => ({ label: value, value }));

const dimensionUnits = [
  { label: "Metres (m)", value: "Meters", symbol: "m" },
  { label: "Feet (ft)", value: "Feet", symbol: "ft" },
  { label: "Centimetres (cm)", value: "Centimeters", symbol: "cm" },
  { label: "Inches (in)", value: "Inches", symbol: "in" },
];

const unitToMeters = {
  Meters: 1,
  Feet: 0.3048,
  Centimeters: 0.01,
  Inches: 0.0254,
};

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const fields = {
  details: [
    {
      name: "name",
      label: "Warehouse Name",
      required: true,
      placeholder: "Enter warehouse name",
    },
    {
      name: "code",
      label: "Warehouse Code",
      required: true,
      placeholder: "e.g. WH-001",
    },
    {
      name: "warehouseType",
      label: "Warehouse Type",
      type: "select",
      required: true,
      options: warehouseTypes,
      placeholder: "Select warehouse type",
    },
    {
      name: "managerName",
      label: "Warehouse Manager",
      placeholder: "Enter manager name",
    },
    {
      name: "contactNumber",
      label: "Contact Number",
      type: "tel",
      placeholder: "Enter contact number",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
    },
  ],

  address: [
    {
      name: "locationCode",
      label: "Location Code",
      required: true,
      placeholder: "Enter location code",
    },
    {
      name: "addressLine1",
      label: "Address Line 1",
      required: true,
      placeholder: "Enter address",
    },
    {
      name: "addressLine2",
      label: "Address Line 2",
      placeholder: "Enter address line 2",
    },
    {
      name: "city",
      label: "City",
      required: true,
      placeholder: "Enter city",
    },
    {
      name: "state",
      label: "State",
      required: true,
      placeholder: "Enter state",
    },
    {
      name: "country",
      label: "Country",
      required: true,
      placeholder: "Enter country",
    },
    {
      name: "postalCode",
      label: "Postal Code",
      required: true,
      placeholder: "Enter postal code",
    },
  ],

  capacity: [
    {
      name: "totalCapacity",
      label: "Total Capacity",
      type: "number",
      required: true,
      placeholder: "Enter total capacity",
    },
    {
      name: "capacityUnit",
      label: "Capacity Unit",
      type: "select",
      required: true,
      options: capacityOptions,
      placeholder: "Select capacity unit",
    },
  ],

  hours: [
    {
      name: "openingTime",
      label: "Opening Time",
      type: "time",
      required: true,
    },
    {
      name: "closingTime",
      label: "Closing Time",
      type: "time",
      required: true,
    },
  ],
};

const initialForm = {
  name: "",
  code: "",
  warehouseType: "",
  managerName: "",
  contactNumber: "",
  email: "",
  description: "",
  locationCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  active: true,
  totalCapacity: "",
  capacityUnit: "Sacks",
  openingTime: "09:00",
  closingTime: "18:00",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  length: "50",
  width: "30",
  height: "10",
  dimensionUnit: "Meters",
};

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
}

function AddWarehouse({ onClose, onSave, saving = false }) {
  const [activeTab, setActiveTab] = useState(0);

  const [form, setForm] = useState({
    ...initialForm,
    workingDays: [...initialForm.workingDays],
  });

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

  const selectedUnit = dimensionUnits.find(
    (unit) => unit.value === form.dimensionUnit
  );

  const length = Number(form.length) || 0;
  const width = Number(form.width) || 0;
  const height = Number(form.height) || 0;

  const floorArea = length * width;
  const buildingVolume = length * width * height;

  const floorAreaSqFt =
    (floorArea * Math.pow(unitToMeters[form.dimensionUnit], 2)) /
    0.092903;

  const buildingVolumeCuFt =
    (buildingVolume * Math.pow(unitToMeters[form.dimensionUnit], 3)) /
    0.0283168;

  function changeField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function changeDay(day, checked) {
    setForm((previous) => ({
      ...previous,
      workingDays: checked
        ? previous.workingDays.includes(day)
          ? previous.workingDays
          : [...previous.workingDays, day]
        : previous.workingDays.filter((item) => item !== day),
    }));
  }

  function renderFields(fieldList) {
    return fieldList.map((field) => (
      <AttributeField
        key={field.name}
        field={field}
        value={form[field.name]}
        onChange={changeField}
        disabled={saving}
      />
    ));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (activeTab < warehouseTabs.length - 1) {
      setActiveTab((previous) => previous + 1);
      return;
    }

    onSave({
      ...form,
      totalCapacity: Number(form.totalCapacity) || 0,
      length,
      width,
      height,
      floorArea,
      floorAreaSqFt,
      buildingVolume,
      buildingVolumeCuFt,
    });
  }

  function closeModal(event) {
    if (event.target === event.currentTarget && !saving) {
      onClose();
    }
  }

  return (
    <div
      className="warehouse-modal-overlay"
      onMouseDown={closeModal}
    >
      <section
        className="warehouse-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-modal-title"
      >
        <header className="warehouse-modal-header">
          <h2 id="warehouse-modal-title">Add Warehouse</h2>

          <button
            type="button"
            className="warehouse-close-btn"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <WarehouseTabs
          tabs={warehouseTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          disabled={saving}
        />

        <form className="warehouse-form" onSubmit={handleSubmit}>
          <div className="warehouse-modal-body">
            {activeTab === 0 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Details</h3>

                <div className="warehouse-form-grid">
                  {renderFields(fields.details)}
                </div>

                <section className="warehouse-physical-dimensions">
                  <div className="warehouse-dimensions-header">
                    <div className="warehouse-dimensions-icon">
                      <Ruler />
                    </div>

                    <div>
                      <h3>Physical Dimensions</h3>
                    </div>
                  </div>

                  <div className="warehouse-unit-section">
                    <label
                      className="warehouse-unit-label"
                      htmlFor="warehouse-dimension-unit"
                    >
                      Dimension Unit <span>*</span>
                    </label>

                    <select
                      id="warehouse-dimension-unit"
                      className="warehouse-dimension-unit-select"
                      name="dimensionUnit"
                      value={form.dimensionUnit}
                      onChange={changeField}
                      disabled={saving}
                    >
                      {dimensionUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>

                    <p className="warehouse-unit-hint">
                      Use the same unit for length, width and height.
                    </p>
                  </div>

                  <div className="warehouse-dimensions-input-grid">
                    {["length", "width", "height"].map((dimension) => (
                      <div
                        key={dimension}
                        className="warehouse-dimension-field"
                      >
                        <label htmlFor={`warehouse-${dimension}`}>
                          {dimension.charAt(0).toUpperCase() +
                            dimension.slice(1)}{" "}
                          ({selectedUnit?.symbol})
                        </label>

                        <input
                          id={`warehouse-${dimension}`}
                          type="number"
                          name={dimension}
                          value={form[dimension]}
                          onChange={changeField}
                          placeholder="0.000"
                          min="0"
                          step="any"
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="warehouse-calculated-section">
                    <h3>Calculated Measurements</h3>

                    <div className="warehouse-measurement-cards">
                      <StatCard
                        title="Floor Area"
                        value={`${formatNumber(floorArea)} ${selectedUnit?.symbol}²`}
                        subtitle={`${formatNumber(floorAreaSqFt)} sq ft`}
                        icon={<Ruler />}
                      />

                      <StatCard
                        title="Building Volume"
                        value={`${formatNumber(buildingVolume)} ${selectedUnit?.symbol}³`}
                        subtitle={`${formatNumber(buildingVolumeCuFt)} cu ft`}
                        icon={<Box />}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 1 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Address</h3>

                <div className="warehouse-form-grid">
                  {renderFields(fields.address)}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Capacity</h3>

                <div className="warehouse-form-grid">
                  {renderFields(fields.capacity)}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="warehouse-tab-content">
                <h3>Operating Hours</h3>

                <div className="warehouse-form-grid">
                  {renderFields(fields.hours)}
                </div>

                <h3 className="warehouse-subheading">
                  Working Days
                </h3>

                <div className="warehouse-day-options">
                  {weekdays.map((day) => (
                    <label
                      key={day}
                      className="warehouse-day-option"
                    >
                      <input
                        type="checkbox"
                        checked={form.workingDays.includes(day)}
                        disabled={saving}
                        onChange={(event) =>
                          changeDay(day, event.target.checked)
                        }
                      />

                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="warehouse-modal-footer">
            <span className="warehouse-step-count">
              Step {activeTab + 1} of {warehouseTabs.length}
            </span>

            <div className="warehouse-footer-actions">
              <Button
                type="button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>

              {activeTab > 0 && (
                <Button
                  type="button"
                  onClick={() =>
                    setActiveTab((previous) => previous - 1)
                  }
                  disabled={saving}
                >
                  Previous
                </Button>
              )}

              <Button type="submit" disabled={saving}>
                {activeTab < warehouseTabs.length - 1
                  ? "Next"
                  : saving
                    ? "Saving..."
                    : "Save Warehouse"}
              </Button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default AddWarehouse;
