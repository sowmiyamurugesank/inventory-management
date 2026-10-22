
import { useState } from "react";
import { Trash2 } from "lucide-react";
import FormField from "./Atom/FormField-LIE.jsx";
import Textarea from "./Atom/Textarea.jsx";
import DatePicker from "./DatePicker.jsx";
import Dropdown from "./Dropdown.jsx";
import Toggle from "./Toggle.jsx";
import Button from "./Button.jsx";
import Checkbox from "./Checkbox.jsx";
import Label from "./Atom/Label.jsx";
import { itemSchema } from "../schema/itemSchema.js";
import "../styles/Productform.css";

const tabs = [
  "Product Information",
  "Pricing Information",
  "Incoming Stock",
  "Supplier & References",
  "Cost, Receipt & Expiry",
  "Additional Settings",
];

const dataTypes = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Decimal", value: "decimal" },
  { label: "Date", value: "date" },
  { label: "Boolean", value: "boolean" },
  { label: "Dropdown", value: "dropdown" },
  { label: "Textarea", value: "textarea" },
];

const initialValues = {
  itemCode: "",
  itemName: "",
  itemType: "PRODUCT",
  categoryId: "",
  description: "",
  brandName: "",
  manufacturer: "",
  manufacturerPartNumber: "",
  baseUnit: "PCS",
  purchaseCost: 0,
  sellingPrice: 0,
  mrp: 0,
  currency: "INR",
  initialItemStatus: "OUT_OF_STOCK",
  warehouseId: "",
  warehouseZoneId: "",
  incomingStockCode: "",
  incomingQuantity: "",
  quantityUnit: "PCS",
  incomingStockStatus: "PENDING",
  vendorId: "",
  vendorItemId: "",
  sourceDocumentType: "MANUAL",
  directEntry: true,
  quotationNumber: "",
  purchaseOrderNumber: "",
  goodsReceiptNumber: "",
  invoiceNumber: "",
  creditNoteNumber: "",
  paymentReferenceNumber: "",
  otherReferenceNumber: "",
  expiryDate: "",
  unitCost: 0,
  totalCost: 0,
  stockCurrency: "INR",
  receivedAt: "",
  notes: "",
  active: true,
  verified: false,
  stockVerified: false,
  itemAttributes: [],
  customAttributes: [],
};

const tabFields = [
  ["itemCode", "itemName", "itemType", "categoryId", "baseUnit"],
  ["purchaseCost", "sellingPrice", "mrp", "currency"],
  [
    "warehouseId",
    "warehouseZoneId",
    "incomingStockCode",
    "incomingQuantity",
    "quantityUnit",
    "incomingStockStatus",
    "receivedAt",
  ],
  [
    "vendorId",
    "vendorItemId",
    "sourceDocumentType",
    "quotationNumber",
    "purchaseOrderNumber",
    "goodsReceiptNumber",
    "invoiceNumber",
  ],
  [
    "unitCost",
    "totalCost",
    "stockCurrency",
    "expiryDate",
    "creditNoteNumber",
    "paymentReferenceNumber",
    "otherReferenceNumber",
  ],
  ["active", "verified", "stockVerified"],
];

const createAttribute = () => ({
  name: "",
  type: "text",
  value: "",
  required: false,
  options: "",
});

export default function ProductForm({
  initialData,
  onSave,
  onCancel,
  categories = [],
  warehouses = [],
  warehouseZones = [],
  vendors = [],
  units = ["PCS", "KG", "LITRE", "BOX"],
  statuses = ["PENDING", "RECEIVED", "CANCELLED"],
}) {
  const [tab, setTab] = useState(0);

  const [data, setData] = useState(() => ({
    ...initialValues,
    ...(initialData ?? {}),
    itemAttributes: initialData?.itemAttributes ?? [],
    customAttributes: initialData?.customAttributes ?? [],
  }));

  const [errors, setErrors] = useState({});

  const update = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    update(name, type === "checkbox" ? checked : value);
  };

  const updateAttribute = (listName, index, key, value) => {
    setData((prev) => ({
      ...prev,
      [listName]: prev[listName].map((attribute, i) =>
        i === index ? { ...attribute, [key]: value } : attribute
      ),
    }));
  };

  const addAttribute = (listName) => {
    setData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], createAttribute()],
    }));
  };

  const removeAttribute = (listName, index) => {
    setData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  const field = (
    name,
    label,
    type = "text",
    required = false,
    options = []
  ) => (
    <div className="product-form-field" key={name}>
      {type === "select" ? (
        <>
          <Label htmlFor={name} required={required} >
            {label}
          </Label>
          <Dropdown
            name={name}
            value={data[name] ?? ""}
            options={options}
            onChange={(value) =>
              update(name, value?.target ? value.target.value : value)
            }
          />
          {errors[name] && <p className="field-error">{errors[name]}</p>}
        </>
      ) : (
        <FormField
          name={name}
          label={label}
          type={type}
          value={data[name] ?? ""}
          onChange={change}
          required={required}
          placeholder={`Enter ${label}`}
          error={errors[name] ?? ""}
        />
      )}
    </div>
  );

  const dropdown = (name, label, options = [], required = false) => (
    <div className="product-form-field" key={name}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Dropdown
        name={name}
        value={data[name] ?? ""}
        options={options}
        onChange={(value) =>
          update(name, value?.target ? value.target.value : value)
        }
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  const textarea = (name, label, placeholder = "") => (
    <div className="product-form-field product-form-full" key={name}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        name={name}
        value={data[name] ?? ""}
        placeholder={placeholder}
        onChange={change}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  const date = (name, label, type = "date", required = false) => (
    <div className="product-form-field" key={name}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <DatePicker
        name={name}
        value={data[name] ?? ""}
        type={type}
        onChange={(value) =>
          update(name, value?.target ? value.target.value : value)
        }
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  const attributeValueField = (listName, attribute, index) => {
    const valueName = `${listName}-${index}-value`;

    if (attribute.type === "boolean") {
      return (
        <div className="product-attribute-field">
          <Label>Value</Label>
          <Dropdown
            name={valueName}
            value={attribute.value ?? ""}
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            onChange={(value) =>
              updateAttribute(
                listName,
                index,
                "value",
                value?.target ? value.target.value : value
              )
            }
          />
        </div>
      );
    }

    if (attribute.type === "dropdown") {
      const options = (attribute.options ?? "")
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean)
        .map((option) => ({ label: option, value: option }));

      return (
        <div className="product-attribute-field">
          <Label>Value</Label>
          <Dropdown
            name={valueName}
            value={attribute.value ?? ""}
            options={options}
            placeholder="Select value"
            onChange={(value) =>
              updateAttribute(
                listName,
                index,
                "value",
                value?.target ? value.target.value : value
              )
            }
          />
        </div>
      );
    }

    if (attribute.type === "textarea") {
      return (
        <div className="product-attribute-field">
          <Label>Value</Label>
          <Textarea
            name={valueName}
            value={attribute.value ?? ""}
            placeholder="Enter value"
            onChange={(e) =>
              updateAttribute(listName, index, "value", e.target.value)
            }
          />
        </div>
      );
    }

    return (
      <div className="product-attribute-field">
        <Label>Value</Label>
        <FormField
          name={valueName}
          label=""
          type={
            attribute.type === "number" || attribute.type === "decimal"
              ? "number"
              : attribute.type === "date"
                ? "date"
                : "text"
          }
          value={attribute.value ?? ""}
          placeholder="Enter value"
          onChange={(e) =>
            updateAttribute(listName, index, "value", e.target.value)
          }
          error=""
        />
      </div>
    );
  };

  const attributeSection = (title, listName) => (
    <section className="product-custom-attributes" key={listName}>
      <div className="product-attributes-header">
        <h3>{title}</h3>
        <Button type="button" onClick={() => addAttribute(listName)}>
          + Add Attributes
        </Button>
      </div>

      {data[listName].length === 0 ? (
        <p className="product-attributes-empty">
          No custom attributes added yet.
        </p>
      ) : (
        data[listName].map((attribute, index) => (
          <div className="product-attribute-row" key={`${listName}-${index}`}>
            <div className="product-attribute-field">
              <Label>Attribute Name</Label>
              <FormField
                name={`${listName}-${index}-name`}
                label=""
                value={attribute.name ?? ""}
                placeholder="e.g. Material Grade"
                onChange={(e) =>
                  updateAttribute(listName, index, "name", e.target.value)
                }
                error=""
              />
            </div>

            <div className="product-attribute-field">
              <Label>Data Type</Label>
              <Dropdown
                name={`${listName}-${index}-type`}
                value={attribute.type ?? "text"}
                options={dataTypes}
                onChange={(value) => {
                  const nextType = value?.target ? value.target.value : value;

                  setData((prev) => ({
                    ...prev,
                    [listName]: prev[listName].map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            type: nextType,
                            value: "",
                            options:
                              nextType === "dropdown" ? item.options : "",
                          }
                        : item
                    ),
                  }));
                }}
              />
            </div>

            {attribute.type === "dropdown" && (
              <div className="product-attribute-field product-attribute-options">
                <Label>Dropdown Options</Label>
                <FormField
                  name={`${listName}-${index}-options`}
                  label=""
                  value={attribute.options ?? ""}
                  placeholder="e.g. Small, Medium, Large"
                  onChange={(e) =>
                    updateAttribute(
                      listName,
                      index,
                      "options",
                      e.target.value
                    )
                  }
                  error=""
                />
              </div>
            )}

            {attributeValueField(listName, attribute, index)}

            <div className="product-attribute-actions">
              <Checkbox
                name={`${listName}-${index}-required`}
                label="Required"
                checked={Boolean(attribute.required)}
                onChange={(checked) =>
                  updateAttribute(listName, index, "required", checked)
                }
              />

              <button
                type="button"
                className="product-attribute-delete"
                onClick={() => removeAttribute(listName, index)}
                aria-label="Delete attribute"
                title="Delete attribute"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );

  const validateAndSave = () => {
    const result = itemSchema.safeParse(data);

    if (!result.success) {
      const nextErrors = {};

      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      });

      setErrors(nextErrors);

      const invalidTab = tabFields.findIndex((fields) =>
        result.error.issues.some((issue) => fields.includes(issue.path[0]))
      );

      if (invalidTab >= 0) {
        setTab(invalidTab);
      }

      return;
    }

    setErrors({});
    onSave?.(result.data);
  };

  return (
    <div className="product-form">
      <div className="product-form-tabs">
        {tabs.map((title, index) => (
          <button
            key={title}
            type="button"
            className={`product-form-tab ${tab === index ? "active" : ""}`}
            onClick={() => setTab(index)}
          >
            <span>{title}</span>
          </button>
        ))}
      </div>

      <div className="product-form-content">
        {tab === 0 && (
          <section className="product-form-grid">
            {field("itemCode", "Item Code", "text", true)}
            {field("itemName", "Item Name", "text", true)}
            {field("itemType", "Item Type", "select", true, [
              { label: "Product", value: "PRODUCT" },
              { label: "Service", value: "SERVICE" },
            ])}
            {dropdown("categoryId", "Category", categories)}
            {field("brandName", "Brand Name")}
            {field("manufacturer", "Manufacturer Name")}
            {field("manufacturerPartNumber", "Manufacturer Part Number")}
            {field(
              "baseUnit",
              "Base Unit",
              "select",
              true,
              units.map((unit) => ({ label: unit, value: unit }))
            )}
            {textarea(
              "description",
              "Description",
              "Enter product description..."
            )}
          </section>
        )}

        {tab === 1 && (
          <section className="product-form-grid">
            {field("purchaseCost", "Purchase Cost", "number", true)}
            {field("sellingPrice", "Selling Price", "number", true)}
            {field("mrp", "MRP", "number", true)}
            {field("currency", "Currency", "select", true, [
              { label: "INR", value: "INR" },
              { label: "USD", value: "USD" },
            ])}
          </section>
        )}

        {tab === 2 && (
          <section className="product-form-grid">
            {dropdown("warehouseId", "Warehouse", warehouses, true)}
            {dropdown("warehouseZoneId", "Warehouse Zone", warehouseZones, true)}
            {field("incomingStockCode", "Incoming Stock Code", "text", true)}
            {field("incomingQuantity", "Incoming Quantity", "number", true)}
            {field(
              "quantityUnit",
              "Quantity Unit",
              "select",
              true,
              units.map((unit) => ({ label: unit, value: unit }))
            )}
            {field(
              "incomingStockStatus",
              "Incoming Stock Status",
              "select",
              true,
              statuses.map((status) => ({ label: status, value: status }))
            )}
            {data.incomingStockStatus === "RECEIVED" &&
              date("receivedAt", "Received At", "datetime-local", true)}
          </section>
        )}

        {tab === 3 && (
          <section className="product-form-grid">
            {dropdown("vendorId", "Supplier", vendors)}
            {field("vendorItemId", "Supplier Item ID")}
            {field("sourceDocumentType", "Source Document Type", "select", false, [
              { label: "Manual", value: "MANUAL" },
              { label: "Quotation", value: "QUOTATION" },
              { label: "Purchase Order", value: "PURCHASE_ORDER" },
              { label: "Invoice", value: "INVOICE" },
            ])}

            <div className="product-form-field">
              <Label>Direct Entry</Label>
              <Toggle
                checked={data.directEntry}
                onChange={(value) => update("directEntry", value)}
              />
            </div>

            {field("quotationNumber", "Quotation Number")}
            {field("purchaseOrderNumber", "Purchase Order Number")}
            {field("goodsReceiptNumber", "Goods Receipt Number")}
            {field("invoiceNumber", "Invoice Number")}
          </section>
        )}

        {tab === 4 && (
          <section className="product-form-grid">
            {field("unitCost", "Unit Cost", "number")}
            {field("totalCost", "Total Cost", "number")}
            {field("stockCurrency", "Stock Currency", "select", false, [
              { label: "INR", value: "INR" },
              { label: "USD", value: "USD" },
            ])}
            {field("creditNoteNumber", "Credit Note Number")}
            {field("paymentReferenceNumber", "Payment Reference Number")}
            {field("otherReferenceNumber", "Other Reference Number")}
            {date("expiryDate", "Expiry Date")}
          </section>
        )}

        {tab === 5 && (
          <section className="product-additional-settings">
            <div className="product-setting-list">
              <div className="product-setting-item">
                <div>
                  <h3>Product Active</h3>
                  <p>Enable or disable this product in the inventory.</p>
                </div>
                <Toggle
                  checked={data.active}
                  onChange={(value) => update("active", value)}
                />
              </div>

              <div className="product-setting-item">
                <div>
                  <h3>Product Verified</h3>
                  <p>Indicates whether the product information has been verified.</p>
                </div>
                <Toggle
                  checked={data.verified}
                  onChange={(value) => update("verified", value)}
                />
              </div>

              <div className="product-setting-item">
                <div>
                  <h3>Stock Verified</h3>
                  <p>Indicates whether the stock information has been verified.</p>
                </div>
                <Toggle
                  checked={data.stockVerified}
                  onChange={(value) => update("stockVerified", value)}
                />
              </div>
            </div>

            <div className="product-custom-attributes-container">
              {attributeSection("Product Custom Attributes", "itemAttributes")}
              {attributeSection("Stock Custom Attributes", "customAttributes")}
            </div>
          </section>
        )}
      </div>

      <div className="product-form-actions">
        <Button
          type="button"
          onClick={onCancel}
          className="secondary-button"
        >
          Cancel
        </Button>

        <div className="product-form-navigation">
          {tab > 0 && (
            <Button
              type="button"
              className="form-nav-button"
              onClick={() => setTab((current) => current - 1)}
            >
              Previous
            </Button>
          )}

          {tab < tabs.length - 1 ? (
            <Button
              type="button"
              className="form-nav-button"
              onClick={() => setTab((current) => current + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="button" onClick={validateAndSave}>
              Save Product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
