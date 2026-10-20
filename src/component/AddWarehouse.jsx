
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import "../styles/AddWarehouse.css";

const tabs = ["Details", "Address", "Capacity", "Hours", "Zones"];

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
  zones: [
    {
      zoneCode: "",
      zoneName: "",
      zoneType: "",
      floorLevel: "",
      maximumCapacity: "",
      capacityUnit: "Pallets",
    },
  ],
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

function AddWarehouse({ onClose, onSave, saving = false }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleDayChange(day) {
    setForm((previous) => ({
      ...previous,
      workingDays: previous.workingDays.includes(day)
        ? previous.workingDays.filter((item) => item !== day)
        : [...previous.workingDays, day],
    }));
  }

  function handleZoneChange(index, field, value) {
    setForm((previous) => ({
      ...previous,
      zones: previous.zones.map((zone, zoneIndex) =>
        zoneIndex === index
          ? { ...zone, [field]: value }
          : zone
      ),
    }));
  }

  function addZone() {
    setForm((previous) => ({
      ...previous,
      zones: [
        ...previous.zones,
        {
          zoneCode: "",
          zoneName: "",
          zoneType: "",
          floorLevel: "",
          maximumCapacity: "",
          capacityUnit: "Pallets",
        },
      ],
    }));
  }

  function removeZone(index) {
    setForm((previous) => ({
      ...previous,
      zones: previous.zones.filter(
        (_, zoneIndex) => zoneIndex !== index
      ),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (activeTab < tabs.length - 1) {
      setActiveTab((previous) => previous + 1);
      return;
    }

    onSave({
      ...form,
      totalCapacity: Number(form.totalCapacity) || 0,
      zones: form.zones.map((zone) => ({
        ...zone,
        maximumCapacity: Number(zone.maximumCapacity) || 0,
        floorLevel: Number(zone.floorLevel) || 0,
      })),
    });
  }

  function goNext() {
    setActiveTab((previous) =>
      Math.min(previous + 1, tabs.length - 1)
    );
  }

  function goPrevious() {
    setActiveTab((previous) =>
      Math.max(previous - 1, 0)
    );
  }

  return (
    <div
      className="warehouse-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        className="warehouse-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-modal-title"
      >
        <header className="warehouse-modal-header">
          <div>
            <h2 id="warehouse-modal-title">
              Add Warehouse
            </h2>
            <p>
              Create a warehouse and configure its location
              and operations.
            </p>
          </div>

          <button
            type="button"
            className="warehouse-close-btn"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <nav className="warehouse-tabs" aria-label="Warehouse form steps">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`warehouse-tab ${
                activeTab === index ? "active" : ""
              } ${activeTab > index ? "completed" : ""}`}
              onClick={() => setActiveTab(index)}
              disabled={saving}
            >
            <span>{tab}</span>
            </button>
          ))}
        </nav>

        <form
          className="warehouse-form"
          onSubmit={handleSubmit}
        >
          <div className="warehouse-modal-body">
            {activeTab === 0 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Details</h3>
                <p className="warehouse-section-description">
                  Enter the basic information for this warehouse.
                </p>

                <div className="warehouse-form-grid">
                  <label className="warehouse-field">
                    Warehouse Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter warehouse name"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Warehouse Code *
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g. WH-001"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Warehouse Type *
                    <select
                      name="warehouseType"
                      value={form.warehouseType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="General">General</option>
                      <option value="Distribution">Distribution</option>
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Finished Goods">Finished Goods</option>
                    </select>
                  </label>

                  <label className="warehouse-field">
                    Warehouse Manager
                    <input
                      name="managerName"
                      value={form.managerName}
                      onChange={handleChange}
                      placeholder="Enter manager name"
                    />
                  </label>

                  <label className="warehouse-field">
                    Contact Number
                    <input
                      type="tel"
                      name="contactNumber"
                      value={form.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                  </label>

                  <label className="warehouse-field">
                    Email Address
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </label>

                  <label className="warehouse-field warehouse-full-width">
                    Description
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter warehouse description"
                      rows={3}
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Address</h3>
                <p className="warehouse-section-description">
                  Add the complete address and location details.
                </p>

                <div className="warehouse-form-grid">
                  <label className="warehouse-field">
                    Location Code *
                    <input
                      name="locationCode"
                      value={form.locationCode}
                      onChange={handleChange}
                      placeholder="e.g. LOC-001"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Address Line 1 *
                    <input
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={handleChange}
                      placeholder="Street address"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Address Line 2
                    <input
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, area, etc."
                    />
                  </label>

                  <label className="warehouse-field">
                    City *
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    State *
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Country *
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Enter country"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Postal Code *
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                      required
                    />
                  </label>
                </div>

                <div className="warehouse-active-row">
                  <div>
                    <strong>Active</strong>
                    <p>
                      Enable or disable this warehouse.
                    </p>
                  </div>

                  <label className="warehouse-switch">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          active: event.target.checked,
                        }))
                      }
                    />
                    <span className="warehouse-switch-slider" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="warehouse-tab-content">
                <h3>Warehouse Capacity</h3>
                <p className="warehouse-section-description">
                  Set the total storage capacity.
                </p>

                <div className="warehouse-form-grid">
                  <label className="warehouse-field">
                    Total Capacity *
                    <input
                      type="number"
                      name="totalCapacity"
                      min="0"
                      value={form.totalCapacity}
                      onChange={handleChange}
                      placeholder="Enter total capacity"
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Capacity Unit *
                    <select
                      name="capacityUnit"
                      value={form.capacityUnit}
                      onChange={handleChange}
                      required
                    >
                      <option value="Pallets">Pallets</option>
                      <option value="Units">Units</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Cubic Meters">Cubic Meters</option>
                      <option value="Square Feet">Square Feet</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="warehouse-tab-content">
                <h3>Operating Hours</h3>
                <p className="warehouse-section-description">
                  Configure working hours and working days.
                </p>

                <div className="warehouse-form-grid">
                  <label className="warehouse-field">
                    Opening Time *
                    <input
                      type="time"
                      name="openingTime"
                      value={form.openingTime}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="warehouse-field">
                    Closing Time *
                    <input
                      type="time"
                      name="closingTime"
                      value={form.closingTime}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="warehouse-working-days">
                  <h4>Working Days</h4>
                  <div className="warehouse-day-options">
                    {weekdays.map((day) => (
                      <label
                        key={day}
                        className={`warehouse-day-option ${
                          form.workingDays.includes(day)
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.workingDays.includes(day)}
                          onChange={() => handleDayChange(day)}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="warehouse-tab-content">
                <div className="warehouse-zones-heading">
                  <div>
                    <h3>Warehouse Zones</h3>
                    <p className="warehouse-section-description">
                      Add and configure zones inside the warehouse.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="warehouse-secondary-btn"
                    onClick={addZone}
                  >
                    <Plus size={16} />
                    Add Zone
                  </button>
                </div>

                {form.zones.map((zone, index) => (
                  <div className="warehouse-zone-card" key={index}>
                    <div className="warehouse-zone-title">
                      <h4>Zone {index + 1}</h4>

                      {form.zones.length > 1 && (
                        <button
                          type="button"
                          className="warehouse-remove-zone"
                          onClick={() => removeZone(index)}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="warehouse-form-grid">
                      <label className="warehouse-field">
                        Zone Code *
                        <input
                          value={zone.zoneCode}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "zoneCode",
                              event.target.value
                            )
                          }
                          placeholder="e.g. Z-001"
                          required
                        />
                      </label>

                      <label className="warehouse-field">
                        Zone Name *
                        <input
                          value={zone.zoneName}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "zoneName",
                              event.target.value
                            )
                          }
                          placeholder="Enter zone name"
                          required
                        />
                      </label>

                      <label className="warehouse-field">
                        Zone Type *
                        <select
                          value={zone.zoneType}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "zoneType",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="">Select zone type</option>
                          <option value="Receiving">Receiving</option>
                          <option value="Storage">Storage</option>
                          <option value="Picking">Picking</option>
                          <option value="Packing">Packing</option>
                          <option value="Dispatch">Dispatch</option>
                        </select>
                      </label>

                      <label className="warehouse-field">
                        Floor Level
                        <input
                          type="number"
                          value={zone.floorLevel}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "floorLevel",
                              event.target.value
                            )
                          }
                          placeholder="e.g. 1"
                        />
                      </label>

                      <label className="warehouse-field">
                        Maximum Capacity *
                        <input
                          type="number"
                          min="0"
                          value={zone.maximumCapacity}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "maximumCapacity",
                              event.target.value
                            )
                          }
                          placeholder="Enter capacity"
                          required
                        />
                      </label>

                      <label className="warehouse-field">
                        Capacity Unit *
                        <select
                          value={zone.capacityUnit}
                          onChange={(event) =>
                            handleZoneChange(
                              index,
                              "capacityUnit",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="Pallets">Pallets</option>
                          <option value="Units">Units</option>
                          <option value="Boxes">Boxes</option>
                          <option value="Cubic Meters">Cubic Meters</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="warehouse-modal-footer">
            <div className="warehouse-step-count">
              Step {activeTab + 1} of {tabs.length}
            </div>

            <div className="warehouse-footer-actions">
              <button
                type="button"
                className="warehouse-cancel-btn"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              {activeTab > 0 && (
                <button
                  type="button"
                  className="warehouse-previous-btn"
                  onClick={goPrevious}
                  disabled={saving}
                >
                  Previous
                </button>
              )}

              {activeTab < tabs.length - 1 ? (
                <button
                  type="button"
                  className="warehouse-next-btn"
                  onClick={goNext}
                  disabled={saving}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="warehouse-next-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Warehouse"}
                </button>
              )}
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default AddWarehouse;
