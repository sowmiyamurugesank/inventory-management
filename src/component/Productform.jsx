
import { useEffect, useState } from "react";
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

function ProductForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
        itemAttributes: initialData.itemAttributes?.length
          ? initialData.itemAttributes
          : [{ name: "", value: "" }],
        customAttributes: initialData.customAttributes?.length
          ? initialData.customAttributes
          : [{ name: "", value: "" }],
      });
    } else {
      setFormData({ ...emptyForm });
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

    const result = itemSchema.safeParse({
      ...formData,
      purchaseCost:
        formData.purchaseCost === "" ? NaN : formData.purchaseCost,
      sellingPrice:
        formData.sellingPrice === "" ? NaN : formData.sellingPrice,
      mrp: formData.mrp === "" ? NaN : formData.mrp,
    });

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    onSave({
      ...result.data,
      ...(initialData?.id !== undefined && {
        id: initialData.id,
      }),
      quantity: initialData?.quantity ?? 0,
    });
  };

  const renderField = (
    label,
    name,
    type = "text",
    required = false
  ) => (
    <div className="form-field" key={name}>
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        value={formData[name]}
        onChange={handleChange}
        min={type === "number" ? "0" : undefined}
      />

      {errors[name] && (
        <span className="form-error">{errors[name]}</span>
      )}
    </div>
  );

  const renderAttributes = (title, section) => (
    <section className="form-section" key={section}>
      <h3>{title}</h3>

      {formData[section].map((attribute, index) => (
        <div className="attribute-row" key={index}>
          <input
            placeholder="Attribute name"
            value={attribute.name}
            onChange={(e) =>
              handleAttributeChange(
                section,
                index,
                "name",
                e.target.value
              )
            }
          />

          <input
            placeholder="Attribute value"
            value={attribute.value}
            onChange={(e) =>
              handleAttributeChange(
                section,
                index,
                "value",
                e.target.value
              )
            }
          />

          <Button
            type="button"
            onClick={() => removeAttribute(section, index)}
            disabled={formData[section].length === 1}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button type="button" onClick={() => addAttribute(section)}>
        + Add Attribute
      </Button>
    </section>
  );

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Product" : "Add Product"}</h2>

      <section className="form-section">
        <h3>Basic Details</h3>

        <div className="form-grid">
          {renderField("Item Code", "itemCode", "text", true)}
          {renderField("Item Name", "itemName", "text", true)}

          <div className="form-field">
            <label htmlFor="itemType">Item Type *</label>

            <select
              id="itemType"
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
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
          {renderField("Description", "description")}
        </div>
      </section>

      <section className="form-section">
        <h3>Manufacturer Details</h3>

        <div className="form-grid">
          {renderField("Brand Name", "brandName")}
          {renderField("Manufacturer", "manufacturer")}
          {renderField(
            "Manufacturer Part Number",
            "manufacturerPartNumber"
          )}
        </div>
      </section>

      <section className="form-section">
        <h3>Units and Pricing</h3>

        <div className="form-grid">
          {renderField("Base Unit", "baseUnit", "text", true)}
          {renderField("Purchase Cost", "purchaseCost", "number", true)}
          {renderField("Selling Price", "sellingPrice", "number", true)}
          {renderField("MRP", "mrp", "number", true)}

          <div className="form-field">
            <label htmlFor="currency">Currency *</label>

            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>

            {errors.currency && (
              <span className="form-error">{errors.currency}</span>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Verification</h3>

        <Toggle
          label="Verified"
          checked={formData.verified}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              verified: value,
            }))
          }
        />
      </section>

      {renderAttributes("Item Attributes", "itemAttributes")}
      {renderAttributes("Custom Attributes", "customAttributes")}

      <div className="form-actions">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">
          {initialData ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
