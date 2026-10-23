import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import WarehouseTabs from "./WarehouseTabs.jsx";
import AttributeField from "./Atom/AttributeField.jsx";
import Checkbox from "./Checkbox.jsx";
import Toggle from "./Toggle.jsx";
import Button from "./Button.jsx";

import "../styles/AddWarehouse.css";

const warehouseTabs = [
  "Warehouse Type",
  "Details",
  "Address",
  "Capacity",
  "Hours",
  "Zone Type",
  "Zones",
];

const facilityCategories = ["General Warehouse","Distribution Center","Cold Storage",]
   .map((value) => ({ label: value, value }));

const warehouseTypes = ["General","Distribution","Cold Storage","Raw Materials","Finished Goods",]
   .map((value) => ({ label: value, value }));

const zonePurposes = ["Receiving","Storage","Picking","Packing","Dispatch",]
   .map((value) => ({ label: value, value }));

const storageTypes = ["Ambient","Refrigerated","Frozen","Hazardous",]
   .map((value) => ({ label: value, value }));

const capacityOptions = ["Pallets","Units","Boxes","Cubic Meters","Square Feet",]
    .map((value) => ({ label: value, value }));

const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",];

const fields = {
 warehouseType: [
  { name: "typeCode", label: "Type Code", required: true, placeholder: "Enter type code" },
  { name: "typeNumericCode", label: "Numeric Code", type: "number", placeholder: "Enter numeric code" },
  { name: "typeName", label: "Warehouse Type Name", required: true, placeholder: "Enter warehouse type name" },
  { name: "facilityCategory", label: "Facility Category", type: "select", required: true, options: facilityCategories, placeholder: "Select facility category" },
],

zoneType: [
  { name: "zoneTypeCode", label: "Zone Type Code", required: true, placeholder: "Enter zone type code" },
  { name: "zoneTypeNumericCode", label: "Numeric Code", type: "number", placeholder: "Enter numeric code" },
  { name: "zoneTypeName", label: "Zone Type Name", required: true, placeholder: "Enter zone type name" },
  { name: "zonePurpose", label: "Zone Purpose", type: "select", required: true, options: zonePurposes, placeholder: "Select zone purpose" },
  { name: "storageType", label: "Storage Type", type: "select", required: true, options: storageTypes, placeholder: "Select storage type" },
],

details: [
  { name: "name", label: "Warehouse Name", required: true, placeholder: "Enter warehouse name" },
  { name: "code", label: "Warehouse Code", required: true, placeholder: "e.g. WH-001" },
  { name: "warehouseType", label: "Warehouse Type", type: "select", required: true, options: warehouseTypes, placeholder: "Select warehouse type" },
  { name: "managerName", label: "Warehouse Manager", placeholder: "Enter manager name" },
  { name: "contactNumber", label: "Contact Number", type: "tel", placeholder: "Enter contact number" },
  { name: "email", label: "Email Address", type: "email", placeholder: "Enter email address" },
],

address: [
  { name: "locationCode", label: "Location Code", required: true, placeholder: "Enter location code" },
  { name: "addressLine1", label: "Address Line 1", required: true, placeholder: "Enter address line 1" },
  { name: "addressLine2", label: "Address Line 2", placeholder: "Enter address line 2" },
  { name: "city", label: "City", required: true, placeholder: "Enter city" },
  { name: "state", label: "State", required: true, placeholder: "Enter state" },
  { name: "country", label: "Country", required: true, placeholder: "Enter country" },
  { name: "postalCode", label: "Postal Code", required: true, placeholder: "Enter postal code" },
],

capacity: [
  { name: "totalCapacity", label: "Total Capacity", type: "number", required: true, placeholder: "Enter total capacity" },
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
  typeCode: "",
  typeNumericCode: "",
  typeName: "",
  facilityCategory: "",
  typeDescription: "",
  typeActive: true,
  typeAvailable: true,

  zoneTypeCode: "",
  zoneTypeNumericCode: "",
  zoneTypeName: "",
  zonePurpose: "Storage",
  storageType: "Ambient",
  zoneTypeDescription: "",
  temperatureControl: false,
  minimumTemperature: "-18",
  maximumTemperature: "-10",
  temperatureUnit: "Celsius",
  humidityControl: false,
  minimumHumidity: "30",
  maximumHumidity: "60",
  specialHandling: false,
  zoneTypeActive: true,
  zoneTypeAvailable: true,

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
  workingDays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ],

  zones: [emptyZone()],
};

function AddWarehouse({ onClose, onSave, saving = false }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(initialForm);

  function changeField(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function changeValue(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (activeTab < warehouseTabs.length - 1) {
      setActiveTab((prev) => prev + 1);
      return;
    }

    onSave({
      ...form,
      typeNumericCode: Number(form.typeNumericCode) || 0,
      zoneTypeNumericCode: Number(form.zoneTypeNumericCode) || 0,
      minimumTemperature: Number(form.minimumTemperature),
      maximumTemperature: Number(form.maximumTemperature),
      minimumHumidity: Number(form.minimumHumidity),
      maximumHumidity: Number(form.maximumHumidity),
      totalCapacity: Number(form.totalCapacity) || 0,
      zones: form.zones.map((zone) => ({
        ...zone,
        floorLevel: Number(zone.floorLevel) || 0,
        maximumCapacity: Number(zone.maximumCapacity) || 0,
      })),
    });
  }

  const zoneFields =  [
  { name: "zoneCode", label: "Zone Code", required: true, placeholder: "Enter zone code" },
  { name: "zoneName", label: "Zone Name", required: true, placeholder: "Enter zone name" },
  { name: "zoneType", label: "Zone Type", type: "select", required: true, options: zonePurposes },
  { name: "floorLevel", label: "Floor Level", type: "number", placeholder: "Enter floor level" },
  { name: "maximumCapacity", label: "Maximum Capacity", type: "number", required: true, placeholder: "Enter maximum capacity" },
  { name: "capacityUnit", label: "Capacity Unit", type: "select", required: true, options: capacityOptions },
  ];

  return (
    <section className="warehouse-modal">
      <header className="warehouse-modal-header">
        <h2>Add Warehouse</h2>
        <Button type="button" onClick={onClose} disabled={saving}>
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
              <h3>Warehouse Type Details</h3>

              <div className="warehouse-form-grid">
                {renderFields(fields.warehouseType)}

                <div className="warehouse-description-field">
                  {renderFields([
                    {name: "typeDescription",label: "Description",type: "textarea",placeholder: "Enter description",},
                  ])}
                </div>
              </div>

              <div className="warehouse-active-row">
                <div>
                  <strong>Active</strong>
                  <p>Enable or disable this warehouse type.</p>
                </div>
                <Toggle
                  checked={form.typeActive}
                  onChange={(value) => changeValue("typeActive", value)}
                  disabled={saving}
                />
              </div>

              <div className="warehouse-active-row">
                <div>
                  <strong>Available for Selection</strong>
                  <p>Allow this type to be selected in forms.</p>
                </div>
                <Toggle
                  checked={form.typeAvailable}
                  onChange={(value) => changeValue("typeAvailable", value)}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="warehouse-tab-content">
              <h3>Warehouse Details</h3>
              <div className="warehouse-form-grid">
                {renderFields(fields.details)}
                <div className="warehouse-description-field">
                  {renderFields([
                    {name: "description",label: "Description",type: "textarea",placeholder: "Enter description",},
                  ])}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
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
                  onChange={(value) => changeValue("active", value)}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="warehouse-tab-content">
              <h3>Warehouse Capacity</h3>
              <div className="warehouse-form-grid">
                {renderFields(fields.capacity)}
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="warehouse-tab-content">
              <h3>Operating Hours</h3>
              <div className="warehouse-form-grid">
                {renderFields(fields.hours)}
              </div>

              <h3 className="warehouse-subheading">Working Days</h3>

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

          {activeTab === 5 && (
            <div className="warehouse-tab-content">
              <h3>Zone Type Details</h3>

              <div className="warehouse-form-grid">
                {renderFields(fields.zoneType)}
              </div>

              <div className="zone-control-section">
                <div className="zone-control-heading">
                  <h3>Temperature Control</h3>
                  <Toggle
                    checked={form.temperatureControl}
                    onChange={(value) =>
                      changeValue("temperatureControl", value)
                    }
                    disabled={saving}
                  />
                </div>

                {form.temperatureControl && (
                  <>
                    <div className="warehouse-form-grid zone-control-grid">
                      <AttributeField
                        field={{name: "minimumTemperature",label: "Minimum Temperature",type: "number",
                        }}
                        value={form.minimumTemperature}
                        onChange={changeField}
                        disabled={saving}
                      />

                      <AttributeField
                        field={{name: "maximumTemperature",label: "Maximum Temperature",type: "number",
                        }}
                        value={form.maximumTemperature}
                        onChange={changeField}
                        disabled={saving}
                      />
                    </div>

                    <div className="zone-unit-group">
                      <span>Temperature Unit</span>

                      {["Celsius", "Fahrenheit"].map((unit) => (
                        <label key={unit}>
                          <input
                            type="radio"
                            name="temperatureUnit"
                            value={unit}
                            checked={form.temperatureUnit === unit}
                            onChange={changeField}
                            disabled={saving}
                          />
                          {unit === "Celsius"
                            ? "Celsius (°C)"
                            : "Fahrenheit (°F)"}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="zone-control-section">
                <div className="zone-control-heading">
                  <h3>Humidity Control</h3>
                  <Toggle
                    checked={form.humidityControl}
                    onChange={(value) =>
                      changeValue("humidityControl", value)
                    }
                    disabled={saving}
                  />
                </div>

                {form.humidityControl && (
                  <div className="warehouse-form-grid zone-control-grid">
                    <AttributeField
                      field={{name: "minimumHumidity",label: "Minimum Humidity (%)",type: "number",
                      }}
                      value={form.minimumHumidity}
                      onChange={changeField}
                      disabled={saving}
                    />

                    <AttributeField
                      field={{name: "maximumHumidity",label: "Maximum Humidity (%)",type: "number",
                      }}
                      value={form.maximumHumidity}
                      onChange={changeField}
                      disabled={saving}
                    />
                  </div>
                )}
              </div>

              <div className="zone-control-section">
                <div className="zone-control-heading">
                  <h3>Handling &amp; Operational Defaults</h3>
                  <Toggle
                    checked={form.specialHandling}
                    onChange={(value) =>
                      changeValue("specialHandling", value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="warehouse-active-row">
                <div>
                  <strong>Active</strong>
                  <p>Enable or disable this zone type.</p>
                </div>
                <Toggle
                  checked={form.zoneTypeActive}
                  onChange={(value) =>
                    changeValue("zoneTypeActive", value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="warehouse-active-row">
                <div>
                  <strong>Available for Selection</strong>
                  <p>Allow this zone type to be selected in forms.</p>
                </div>
                <Toggle
                  checked={form.zoneTypeAvailable}
                  onChange={(value) =>
                    changeValue("zoneTypeAvailable", value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="warehouse-description-field zone-description-bottom">
                {renderFields([
                  {name: "zoneTypeDescription",label: "Description",type: "textarea",placeholder: "Enter zone type description",},
                ])}
              </div>
            </div>
          )}

          {activeTab === 6 && (
            <div className="warehouse-tab-content">
              <div className="warehouse-zones-heading">
                <h3>Warehouse Zones</h3>

                <Button
                  type="button"
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

              {form.zones.map((zone, index) => (
                <div className="warehouse-zone-card" key={index}>
                  <div className="warehouse-zone-title">
                    <h4>Zone {index + 1}</h4>

                    {form.zones.length > 1 && (
                      <Button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            zones: prev.zones.filter(
                              (_, i) => i !== index
                            ),
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
                        changeZone(
                          index,
                          event.target.name,
                          event.target.value
                        )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="warehouse-modal-footer">
          <span>
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
                onClick={() => setActiveTab((prev) => prev - 1)}
                disabled={saving}
              >
                Previous
              </Button>
            )}

            {activeTab < warehouseTabs.length - 1 ? (
              <Button type="submit" disabled={saving}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Warehouse"}
              </Button>
            )}
          </div>
        </footer>
      </form>
    </section>
  );
}
export default AddWarehouse;