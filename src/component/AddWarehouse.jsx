
import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";
import WarehouseTabs from "./WarehouseTabs.jsx";
import AttributeField from "./Atom/AttributeField.jsx";
import Checkbox from "./Checkbox.jsx";
import Toggle from "./Toggle.jsx";
import Button from "./Button.jsx";

import "../styles/AddWarehouse.css";

const warehouseTabs = [
  "Details",
  "Address",
  "Capacity",
  "Hours",
  "Zones",
];

const tabsCount = warehouseTabs.length;

const capacityOptions = ["Pallets", "Units", "Boxes", "Cubic Meters", "Square Feet"]
  .map((value) => ({ label: value, value }));

const warehouseTypes = ["General", "Distribution", "Cold Storage", "Raw Materials", "Finished Goods"]
  .map((value) => ({ label: value, value }));

const zoneTypes = ["Receiving", "Storage", "Picking", "Packing", "Dispatch"]
  .map((value) => ({ label: value, value }));

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fields = {
  details: [
    { name: "name", label: "Warehouse Name", required: true, placeholder: "Enter warehouse name" },
    { name: "code", label: "Warehouse Code", required: true, placeholder: "e.g. WH-001" },
    { name: "warehouseType", label: "Warehouse Type", type: "select", required: true, options: warehouseTypes },
    { name: "managerName", label: "Warehouse Manager", placeholder: "Enter manager name" },
    { name: "contactNumber", label: "Contact Number", type: "tel", placeholder: "Enter contact number" },
    { name: "email", label: "Email Address", type: "email", placeholder: "Enter email address" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
  ],
  address: [
    { name: "locationCode", label: "Location Code", required: true },
    { name: "addressLine1", label: "Address Line 1", required: true },
    { name: "addressLine2", label: "Address Line 2" },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "country", label: "Country", required: true },
    { name: "postalCode", label: "Postal Code", required: true },
  ],
  capacity: [
    { name: "totalCapacity", label: "Total Capacity", type: "number", required: true },
    { name: "capacityUnit", label: "Capacity Unit", type: "select", required: true, options: capacityOptions },
  ],
  hours: [
    { name: "openingTime", label: "Opening Time", type: "time", required: true },
    { name: "closingTime", label: "Closing Time", type: "time", required: true },
  ],
};

const emptyZone = () => ({
  zoneCode: "",
  zoneName: "",
  zoneType: "",
  floorLevel: "",
  maximumCapacity: "",
  capacityUnit: "Pallets",
});

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
  capacityUnit: "Pallets",
  openingTime: "09:00",
  closingTime: "18:00",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  zones: [emptyZone()],
};

function AddWarehouse({ onClose, onSave, saving = false }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(initialForm);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function changeZone(index, name, value) {
    setForm((prev) => ({
      ...prev,
      zones: prev.zones.map((zone, i) =>
        i === index ? { ...zone, [name]: value } : zone
      ),
    }));
  }

  function changeDay(day, checked) {
    setForm((prev) => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, day]
        : prev.workingDays.filter((item) => item !== day),
    }));
  }

  function renderFields(list, values = form, handler = changeField) {
    return list.map((field) => (
      <AttributeField
        key={field.name}
        field={field}
        value={values[field.name]}
        onChange={handler}
        disabled={saving}
      />
    ));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (activeTab < tabsCount - 1) {
      setActiveTab((prev) => prev + 1);
      return;
    }

    onSave({
      ...form,
      totalCapacity: Number(form.totalCapacity) || 0,
      zones: form.zones.map((zone) => ({
        ...zone,
        floorLevel: Number(zone.floorLevel) || 0,
        maximumCapacity: Number(zone.maximumCapacity) || 0,
      })),
    });
  }

  return (
    <section className="warehouse-modal">
      <header className="warehouse-modal-header">
        <h2>Add Warehouse</h2>
        <Button onClick={onClose} disabled={saving} aria-label="Close">
          ×
        </Button>
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
            </div>
          )}

          {activeTab === 1 && (
            <div className="warehouse-tab-content">
              <h3>Warehouse Address</h3>
              <div className="warehouse-form-grid">
                {renderFields(fields.address)}
              </div>

              <div className="warehouse-active-row">
                <div>
                  <strong>Active</strong>
                  <p>Enable or disable this warehouse.</p>
                </div>
                <Toggle
                  checked={form.active}
                  disabled={saving}
                  onChange={(active) =>
                    setForm((prev) => ({ ...prev, active }))
                  }
                />
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

              <h3>Working Days</h3>
              <div className="warehouse-day-options">
                {weekdays.map((day) => (
                  <Checkbox
                    key={day}
                    label={day}
                    checked={form.workingDays.includes(day)}
                    disabled={saving}
                    onChange={(checked) => changeDay(day, checked)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="warehouse-tab-content">
              <div className="warehouse-zones-heading">
                <h3>Warehouse Zones</h3>
                <Button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      zones: [...prev.zones, emptyZone()],
                    }))
                  }
                  disabled={saving}
                >
                  <Plus size={16} /> Add Zone
                </Button>
              </div>

              {form.zones.map((zone, index) => {
                const zoneFields = [
                  { name: "zoneCode", label: "Zone Code", required: true },
                  { name: "zoneName", label: "Zone Name", required: true },
                  { name: "zoneType", label: "Zone Type", type: "select", required: true, options: zoneTypes },
                  { name: "floorLevel", label: "Floor Level", type: "number" },
                  { name: "maximumCapacity", label: "Maximum Capacity", type: "number", required: true },
                  { name: "capacityUnit", label: "Capacity Unit", type: "select", required: true, options: capacityOptions },
                ];

                return (
                  <div className="warehouse-zone-card" key={index}>
                    <div className="warehouse-zone-title">
                      <h4>Zone {index + 1}</h4>

                      {form.zones.length > 1 && (
                        <Button
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              zones: prev.zones.filter((_, i) => i !== index),
                            }))
                          }
                          disabled={saving}
                        >
                          <Trash2 size={16} /> Remove
                        </Button>
                      )}
                    </div>

                    <div className="warehouse-form-grid">
                      {renderFields(
                        zoneFields,
                        zone,
                        (event) =>
                          changeZone(index, event.target.name, event.target.value)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="warehouse-modal-footer">
          <span>Step {activeTab + 1} of {tabsCount}</span>

          <div className="warehouse-footer-actions">
            <Button onClick={onClose} disabled={saving}>Cancel</Button>

            {activeTab > 0 && (
              <Button
                onClick={() => setActiveTab((prev) => prev - 1)}
                disabled={saving}
              >
                Previous
              </Button>
            )}

            <Button type="submit" disabled={saving}>
              {activeTab < tabsCount - 1
                ? "Next"
                : saving
                  ? "Saving..."
                  : "Save Warehouse"}
            </Button>
          </div>
        </footer>
      </form>
    </section>
  );
}

export default AddWarehouse;