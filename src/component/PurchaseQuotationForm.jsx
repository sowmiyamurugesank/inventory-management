
import { useState } from "react";
import AttributeField from "./Atom/AttributeField";
import Dropdown from "./Dropdown";
import Button from "./Button";
import "../styles/PurchaseQuotationForm.css";

const fields = [
  { name: "quotationCode", label: "Quotation Code", required: true, placeholder: "Enter quotation code" },
  { name: "numericCode", label: "Numeric Code", type: "number", placeholder: "Enter numeric code" },
  { name: "quotationNumber", label: "Quotation Number", required: true, placeholder: "Enter quotation number" },
  { name: "vendor", label: "Vendor", type: "select", required: true, placeholder: "Select vendor", options: [] },
  { name: "quotationDate", label: "Quotation Date", type: "date", required: true },
  { name: "validUntil", label: "Valid Until", type: "date" },
  { name: "quotationDiscount", label: "Quotation Discount", type: "number", placeholder: "0" },
  { name: "additionalCharges", label: "Additional Charges", type: "number", placeholder: "0" },
  { name: "paymentTerms", label: "Payment Terms", placeholder: "Enter payment terms" },
  { name: "deliveryTerms", label: "Delivery Terms", placeholder: "Enter delivery terms" },
  { name: "overallDeliveryDays", label: "Overall Delivery Days", type: "number", placeholder: "Enter delivery days" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Enter notes" },
  { name: "customAttributes", label: "Custom Attributes (JSON)", type: "textarea", placeholder: 'Example: {"reference": "ABC"}' },
];

const itemFields = [
  { name: "itemCode", label: "Item Code", required: true, placeholder: "Enter item code" },
  { name: "numericCode", label: "Numeric Code", type: "number", placeholder: "Enter numeric code" },
  { name: "product", label: "Product", type: "select", required: true, placeholder: "Select product", options: [] },
  { name: "vendorItem", label: "Vendor Item", placeholder: "Enter vendor item" },
  { name: "vendorItemCode", label: "Vendor Item Code", placeholder: "Enter vendor item code" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
  { name: "quantity", label: "Quantity", type: "number", required: true, placeholder: "Enter quantity" },
  { name: "unit", label: "Unit", placeholder: "Enter unit" },
  { name: "unitPrice", label: "Unit Price", type: "number", required: true, placeholder: "Enter unit price" },
  { name: "discount", label: "Discount (%)", type: "number", placeholder: "0" },
  { name: "taxRate", label: "Tax Rate (%)", type: "number", placeholder: "0" },
  { name: "taxAmount", label: "Tax Amount", type: "number", placeholder: "0" },
  { name: "deliveryDays", label: "Delivery Days", type: "number", placeholder: "0" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Enter notes" },
  { name: "customAttributes", label: "Custom Attributes (JSON)", type: "textarea", placeholder: '{"reference": "ABC"}' },
];

const emptyItem = {
  itemCode: "",
  numericCode: "",
  product: "",
  vendorItem: "",
  vendorItemCode: "",
  description: "",
  quantity: "1",
  unit: "",
  unitPrice: "",
  discount: "0",
  taxRate: "0",
  taxAmount: "0",
  deliveryDays: "0",
  notes: "",
  customAttributes: "",
};

function PurchaseQuotationForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("details");

  const [formData, setFormData] = useState({
    quotationCode: "",
    numericCode: "",
    quotationNumber: "",
    vendor: "",
    quotationDate: "",
    validUntil: "",
    currency: "INR",
    status: "Draft",
    quotationDiscount: "0",
    additionalCharges: "0",
    paymentTerms: "",
    deliveryTerms: "",
    overallDeliveryDays: "",
    notes: "",
    customAttributes: "",
    isActive: true,
    isVerified: false,
  });

  const [errors, setErrors] = useState({});

  // Each item has its own independent form data.
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [itemErrors, setItemErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const updateDropdown = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;

    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [name]: value } : item
      )
    );

    setItemErrors((previous) => ({
      ...previous,
      [index]: {
        ...(previous[index] || {}),
        [name]: "",
      },
    }));
  };

  const updateItemDropdown = (index, name, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [name]: value } : item
      )
    );

    setItemErrors((previous) => ({
      ...previous,
      [index]: {
        ...(previous[index] || {}),
        [name]: "",
      },
    }));
  };

  const validateDetails = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (
        field.required &&
        !String(formData[field.name] ?? "").trim()
      ) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (
      formData.quotationDate &&
      formData.validUntil &&
      formData.validUntil < formData.quotationDate
    ) {
      newErrors.validUntil =
        "Valid Until must be on or after Quotation Date";
    }

    [
      "numericCode",
      "overallDeliveryDays",
      "quotationDiscount",
      "additionalCharges",
    ].forEach((name) => {
      if (
        formData[name] !== "" &&
        Number(formData[name]) < 0
      ) {
        newErrors[name] = "Value cannot be negative";
      }
    });

    if (formData.customAttributes.trim()) {
      try {
        const parsed = JSON.parse(formData.customAttributes);

        if (
          parsed === null ||
          Array.isArray(parsed) ||
          typeof parsed !== "object"
        ) {
          newErrors.customAttributes = "Enter a valid JSON object";
        }
      } catch {
        newErrors.customAttributes = "Enter valid JSON";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (event) => {
    event.preventDefault();

    if (validateDetails()) {
      setActiveTab("items");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateItem = (item, index) => {
    const newErrors = {};

    itemFields.forEach((field) => {
      if (
        field.required &&
        !String(item[field.name] ?? "").trim()
      ) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    [
      "quantity",
      "unitPrice",
      "discount",
      "taxRate",
      "taxAmount",
      "deliveryDays",
    ].forEach((name) => {
      const value = item[name];

      if (value !== "" && Number(value) < 0) {
        newErrors[name] = "Value cannot be negative";
      }
    });

    if (Number(item.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than zero";
    }

    if (Number(item.discount) > 100) {
      newErrors.discount = "Discount cannot exceed 100%";
    }

    if (Number(item.taxRate) > 100) {
      newErrors.taxRate = "Tax rate cannot exceed 100%";
    }

    if (item.customAttributes.trim()) {
      try {
        const parsed = JSON.parse(item.customAttributes);

        if (
          parsed === null ||
          Array.isArray(parsed) ||
          typeof parsed !== "object"
        ) {
          newErrors.customAttributes = "Enter a valid JSON object";
        }
      } catch {
        newErrors.customAttributes = "Enter valid JSON";
      }
    }

    setItemErrors((previous) => ({
      ...previous,
      [index]: newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const calculateItem = (item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discountRate = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: taxableAmount + taxAmount,
    };
  };

  const handleAddAnotherItem = () => {
    setItems((previous) => [...previous, { ...emptyItem }]);
    setEditingIndex(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setItemErrors((previous) => ({
        ...previous,
        [index]: {
          ...(previous[index] || {}),
          general: "At least one item form must remain.",
        },
      }));
      return;
    }

    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );

    setItemErrors((previous) => {
      const updated = {};

      Object.entries(previous).forEach(([key, value]) => {
        const oldIndex = Number(key);

        if (oldIndex < index) {
          updated[oldIndex] = value;
        } else if (oldIndex > index) {
          updated[oldIndex - 1] = value;
        }
      });

      return updated;
    });

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    setActiveTab("items");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quotationSubtotal = items.reduce(
    (sum, item) => sum + calculateItem(item).subtotal,
    0
  );

  const itemDiscountTotal = items.reduce(
    (sum, item) => sum + calculateItem(item).discountAmount,
    0
  );

  const itemTaxTotal = items.reduce(
    (sum, item) => sum + calculateItem(item).taxAmount,
    0
  );

  const quotationDiscount = Math.max(
    0,
    Number(formData.quotationDiscount) || 0
  );

  const additionalCharges = Math.max(
    0,
    Number(formData.additionalCharges) || 0
  );

  const quotationTotal = Math.max(
    0,
    quotationSubtotal -
      itemDiscountTotal -
      quotationDiscount +
      itemTaxTotal +
      additionalCharges
  );

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: formData.currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const handleSave = (event) => {
    event.preventDefault();

    if (!validateDetails()) {
      setActiveTab("details");
      return;
    }

    let firstInvalidIndex = -1;
    const newErrors = {};

    items.forEach((item, index) => {
      const errorsForItem = {};

      itemFields.forEach((field) => {
        if (
          field.required &&
          !String(item[field.name] ?? "").trim()
        ) {
          errorsForItem[field.name] =
            `${field.label} is required`;
        }
      });

      [
        "quantity",
        "unitPrice",
        "discount",
        "taxRate",
        "taxAmount",
        "deliveryDays",
      ].forEach((name) => {
        if (
          item[name] !== "" &&
          Number(item[name]) < 0
        ) {
          errorsForItem[name] = "Value cannot be negative";
        }
      });

      if (Number(item.quantity) <= 0) {
        errorsForItem.quantity =
          "Quantity must be greater than zero";
      }

      if (Number(item.discount) > 100) {
        errorsForItem.discount =
          "Discount cannot exceed 100%";
      }

      if (Number(item.taxRate) > 100) {
        errorsForItem.taxRate =
          "Tax rate cannot exceed 100%";
      }

      if (item.customAttributes.trim()) {
        try {
          const parsed = JSON.parse(item.customAttributes);

          if (
            parsed === null ||
            Array.isArray(parsed) ||
            typeof parsed !== "object"
          ) {
            errorsForItem.customAttributes =
              "Enter a valid JSON object";
          }
        } catch {
          errorsForItem.customAttributes = "Enter valid JSON";
        }
      }

      if (Object.keys(errorsForItem).length > 0) {
        newErrors[index] = errorsForItem;

        if (firstInvalidIndex === -1) {
          firstInvalidIndex = index;
        }
      }
    });

    setItemErrors(newErrors);

    if (items.length === 0) {
      alert("Add at least one quotation item before saving.");
      setActiveTab("items");
      return;
    }

    if (firstInvalidIndex !== -1) {
      setEditingIndex(firstInvalidIndex);
      setActiveTab("items");
      return;
    }

    // Backend API integration will be added when the API is available.
    alert(
      "Quotation details and items validated. Backend save integration is pending."
    );
  };

  return (
    <div className="purchase-quotation-form">
      <div className="quotation-form-header">
        <div>
          <h2>Purchase Quotation</h2>
          <p>Vendor pricing · Items · Commercial terms</p>
        </div>
      </div>

      <div className="quotation-tabs">
        <button
          type="button"
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          1. Quotation Details
        </button>

        <button
          type="button"
          className={activeTab === "items" ? "active" : ""}
          onClick={() => setActiveTab("items")}
        >
          2. Quotation Items
        </button>
      </div>

      {activeTab === "details" && (
        <form onSubmit={handleNext}>
          <section className="quotation-form-section">
            <h3>Quotation Information</h3>

            <div className="quotation-form-grid">
              {fields
                .filter((field) =>
                  [
                    "quotationCode",
                    "numericCode",
                    "quotationNumber",
                    "vendor",
                    "quotationDate",
                    "validUntil",
                  ].includes(field.name)
                )
                .map((field) => (
                  <div
                    className={`quotation-form-field ${
                      field.name === "vendor" ? "vendor-field" : ""
                    }`}
                    key={field.name}
                  >
                    <AttributeField
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      error={errors[field.name] || ""}
                    />
                  </div>
                ))}

              <div className="quotation-form-field">
                <label>Currency <span>*</span></label>
                <Dropdown
                  options={[
                    { label: "INR — Indian Rupee", value: "INR" },
                  ]}
                  value={formData.currency}
                  onChange={(value) =>
                    updateDropdown("currency", value)
                  }
                  placeholder="Select currency"
                />
              </div>

              <div className="quotation-form-field">
                <label>Status <span>*</span></label>
                <Dropdown
                  options={[{ label: "Draft", value: "Draft" }]}
                  value={formData.status}
                  onChange={(value) =>
                    updateDropdown("status", value)
                  }
                  placeholder="Select status"
                />
              </div>
            </div>
          </section>

          <section className="quotation-form-section">
            <h3>Commercial Details</h3>

            <div className="quotation-form-grid">
              {fields
                .filter((field) =>
                  [
                    "quotationDiscount",
                    "additionalCharges",
                    "paymentTerms",
                    "deliveryTerms",
                    "overallDeliveryDays",
                  ].includes(field.name)
                )
                .map((field) => (
                  <div
                    className="quotation-form-field"
                    key={field.name}
                  >
                    <AttributeField
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      error={errors[field.name] || ""}
                    />
                  </div>
                ))}
            </div>
          </section>

          <section className="quotation-form-section">
            <div className="quotation-form-grid">
              {fields
                .filter((field) =>
                  ["notes", "customAttributes"].includes(field.name)
                )
                .map((field) => (
                  <div
                    className={`quotation-form-field full-width ${field.name}`}
                    key={field.name}
                  >
                    <AttributeField
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      error={errors[field.name] || ""}
                    />
                  </div>
                ))}
            </div>

            <div className="quotation-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Quotation is active
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isVerified: event.target.checked,
                    }))
                  }
                />
                Quotation has been verified
              </label>
            </div>
          </section>

          <div className="quotation-form-actions">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      )}

      {activeTab === "items" && (
        <>
          {items.map((item, index) => {
            const line = calculateItem(item);
            const errorsForItem = itemErrors[index] || {};

            return (
              <section
                className="quotation-form-section quotation-item-card"
                key={index}
              >
                <div className="quotation-item-heading">
                  <h3>Item {index + 1}</h3>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="quotation-remove-item"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {errorsForItem.general && (
                  <p className="field-error">
                    {errorsForItem.general}
                  </p>
                )}

                <div className="quotation-form-grid">
                  {itemFields.map((field) => (
                    <div
                      className={`quotation-form-field ${
                        field.type === "textarea" ? "full-width" : ""
                      } ${
                        field.name === "product" ? "product-field" : ""
                      } ${
                        field.name === "vendorItem"
                          ? "vendor-item-field"
                          : ""
                      } ${
                        field.name === "description"
                          ? "description-field"
                          : ""
                      } ${
                        ["notes", "customAttributes"].includes(field.name)
                          ? "item-small-textarea"
                          : ""
                      }`}
                      key={field.name}
                    >
                      <AttributeField
                        field={field}
                        value={item[field.name]}
                        onChange={(event) =>
                          handleItemChange(index, event)
                        }
                        error={errorsForItem[field.name] || ""}
                      />
                    </div>
                  ))}
                </div>

                <div className="quotation-line-summary">
                  <div>
                    <span>Line Subtotal</span>
                    <strong>{money(line.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>{money(line.discountAmount)}</strong>
                  </div>

                  <div>
                    <span>Tax</span>
                    <strong>{money(line.taxAmount)}</strong>
                  </div>

                  <div className="quotation-line-total">
                    <span>Line Total</span>
                    <strong>{money(line.total)}</strong>
                  </div>
                </div>
              </section>
            );
          })}

          <button
            type="button"
            className="quotation-add-product"
            onClick={handleAddAnotherItem}
          >
            + Add Another Product
          </button>

          <section className="quotation-total-summary">
            <h3>Quotation Summary</h3>

            <div>
              <span>Gross Subtotal</span>
              <strong>{money(quotationSubtotal)}</strong>
            </div>

            <div>
              <span>Line Discounts</span>
              <strong>{money(itemDiscountTotal)}</strong>
            </div>

            <div>
              <span>Line Taxes</span>
              <strong>{money(itemTaxTotal)}</strong>
            </div>

            <div>
              <span>Quotation Discount</span>
              <strong>{money(quotationDiscount)}</strong>
            </div>

            <div>
              <span>Additional Charges</span>
              <strong>{money(additionalCharges)}</strong>
            </div>

            <div className="quotation-grand-total">
              <span>Grand Total</span>
              <strong>{money(quotationTotal)}</strong>
            </div>

            <p className="quotation-summary-note">
            </p>
          </section>

          <div className="quotation-form-actions">
            <Button
              type="button"
              onClick={() => setActiveTab("details")}
            >
              Previous
            </Button>

            <Button type="button" onClick={handleSave}>
              Save Quotation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default PurchaseQuotationForm;

