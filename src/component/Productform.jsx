
import { useEffect, useState } from "react";
import { itemSchema } from "../schema/itemSchema";
import { itemSchema } from "../schema/itemSchema";
import Button from "./Button";
import Toggle from "./Toggle";
import "../styles/ProductForm.css";

const emptyForm = {
  itemCode: "",
  itemName: "",
  itemType: "",
  category: "",
  description: "",
  brandName: "",
  manufacturer: "",
  manufacturerPartNumber: "",
  baseUnit: "",
  purchaseCost: "",
  sellingPrice: "",
  mrp: "",
  currency: "INR",
  verified: false,
  itemAttributes: [{ name: "", value: "" }],
  customAttributes: [{ name: "", value: "" }],
};

const requiredFields = [
  ["itemCode", "Item Code"],
  ["itemName", "Item Name"],
  ["itemType", "Item Type"],
  ["baseUnit", "Base Unit"],
  ["purchaseCost", "Purchase Cost"],
  ["sellingPrice", "Selling Price"],
  ["mrp", "MRP"],
];

function ProductForm({ initialData, onSave, onCancel, disabled = false }) {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
        itemCode: initialData.itemCode ?? "",
        itemName: initialData.itemName ?? "",
        itemType: initialData.itemType ?? "",
        baseUnit: initialData.baseUnit ?? "",
        purchaseCost: initialData.purchaseCost ?? "",
        sellingPrice: initialData.sellingPrice ?? "",
        mrp: initialData.mrp ?? "",
        currency: initialData.currency ?? "INR",
        itemAttributes: initialData.itemAttributes?.length
          ? initialData.itemAttributes
          : [{ name: "", value: "" }],
        customAttributes: initialData.customAttributes?.length
          ? initialData.customAttributes
          : [{ name: "", value: "" }],
      });
    } else {
      setFormData({
        ...emptyForm,
        itemAttributes: [{ name: "", value: "" }],
        customAttributes: [{ name: "", value: "" }],
      });
    }

    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleAttributeChange = (section, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addAttribute = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], { name: "", value: "" }],
    }));
  };

  const removeAttribute = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    const requiredErrors = {};

    requiredFields.forEach(([key, label]) => {
      const value = formData[key];

      if (value === "" || value === null || value === undefined ||
          (typeof value === "string" && !value.trim())) {
        requiredErrors[key] = `${label} is required`;
      }
    });

    ["purchaseCost", "sellingPrice", "mrp"].forEach((key) => {
      const value = formData[key];

      if (value !== "" && value !== null && value !== undefined) {
        if (!Number.isFinite(Number(value))) {
          requiredErrors[key] = "Enter a valid number";
        } else if (Number(value) < 0) {
          requiredErrors[key] = "Cannot be negative";
        }
      }
    });

    if (Object.keys(requiredErrors).length > 0) {
      setErrors(requiredErrors);
      return;
    }

    const schemaData = {
      ...formData,
      purchaseCost: Number(formData.purchaseCost),
      sellingPrice: Number(formData.sellingPrice),
      mrp: Number(formData.mrp),
    };

    const result = itemSchema.safeParse(schemaData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          requiredFields.some(([key]) => key === field) &&
          !fieldErrors[field]
        ) {
          fieldErrors[field] = issue.message;
        }
      });

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }
    }

    onSave({
      ...schemaData,
      ...(initialData?.id !== undefined && {
        id: initialData.id,
      }),
      quantity: initialData?.quantity ?? 0,
    });
  };

  const renderField = (label, name, type = "text", required = false) => (
    <div className="form-field" key={name}>
      <label htmlFor={name}>
        {label} {required && <span className="required-mark">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        min={type === "number" ? "0" : undefined}
        value={formData[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
      />

      {errors[name] && (
        <span className="form-error">{errors[name]}</span>
      )}
    </div>
  );

  const renderAttributes = (title, section, buttonLabel) => (
    <section className="form-section attribute-card" key={section}>
      <h3>{title}</h3>
      <p className="attribute-description">
        Add product-specific information below.
      </p>

      {formData[section].map((attribute, index) => (
        <div className="attribute-row" key={index}>
          <div className="form-field">
            <label htmlFor={`${section}-name-${index}`}>
              Attribute Name
            </label>
            <input
              id={`${section}-name-${index}`}
              placeholder="Enter name"
              value={attribute.name}
              onChange={(e) =>
                handleAttributeChange(section, index, "name", e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor={`${section}-value-${index}`}>
              Attribute Value
            </label>
            <input
              id={`${section}-value-${index}`}
              placeholder="Enter value"
              value={attribute.value}
              onChange={(e) =>
                handleAttributeChange(section, index, "value", e.target.value)
              }
            />
          </div>

          {formData[section].length > 1 && (
            <Button
              type="button"
              onClick={() => removeAttribute(section, index)}
              disabled={disabled}
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        className="add-attribute-button"
        onClick={() => addAttribute(section)}
        disabled={disabled}
      >
        + {buttonLabel}
      </Button>
    </section>
  );

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="product-form-header">
        <h2>{initialData ? "Edit Product" : "Add Product"}</h2>
        <p>Enter the details to manage your product information.</p>
      </div>

      <section className="form-section">
        <h3>Basic Details</h3>

        <div className="form-grid">
          {renderField("Item Code", "itemCode", "text", true)}
          {renderField("Item Name", "itemName", "text", true)}

          <div className="form-field">
            <label htmlFor="itemType">
              Item Type <span className="required-mark">*</span>
            </label>

            <select
              id="itemType"
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              aria-invalid={Boolean(errors.itemType)}
            >
              <option value="">Select Type</option>
              <option value="Goods">Goods</option>
              <option value="Service">Service</option>
            </select>

            {errors.itemType && (
              <span className="form-error">{errors.itemType}</span>
            )}
          </div>

          {renderField("Category", "category")}

          <div className="form-field full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Product Details</h3>

        <div className="form-grid">
          {renderField("Brand Name", "brandName")}
          {renderField("Manufacturer", "manufacturer")}
          {renderField("Manufacturer Part Number", "manufacturerPartNumber")}
        </div>
      </section>

      <section className="form-section">
        <h3>Unit and Pricing</h3>

        <div className="form-grid">
          {renderField("Base Unit", "baseUnit", "text", true)}

          <div className="form-field">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {renderField("Purchase Cost", "purchaseCost", "number", true)}
          {renderField("Selling Price", "sellingPrice", "number", true)}
          {renderField("MRP", "mrp", "number", true)}
        </div>
      </section>

      <section className="form-section additional-details">
        <h3>Additional Details</h3>

        <div className="verification-row">
          <div className="verification-text">
            <label>Verified</label>
            <p>Mark as verified after authorised review</p>
          </div>

          <Toggle
            label=""
            checked={formData.verified}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                verified: value,
              }))
            }
          />
        </div>
      </section>

      <div className="attribute-cards-grid">
        {renderAttributes("Item Attributes", "itemAttributes", "Add Attribute")}
        {renderAttributes("Custom Attributes", "customAttributes", "Add Custom Attribute")}
      </div>

      <div className="form-actions">
        <Button type="button" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>

        <Button
          type="submit"
          className="save-product-button"
          disabled={disabled}
        >
          {disabled
            ? "Saving..."
            : initialData
              ? "Update Product"
              : "Save Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
