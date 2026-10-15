
import { useState } from "react";
import InputField from "../component/InputField";
import ItemAttributesModal from "../component/ItemAttributesModal";
import CustomAttributesModal from "../component/CustomAttributesModal";
import { itemSchema } from "../schema";
import "../styles/AddItem.css";

function AddItem() {
  const [form, setForm] = useState({
    code: "",
    name: "",
    item_type: "PRODUCT",
    base_unit: "PCS",
    purchase_cost: 0,
    selling_price: 0,
    mrp: 0,
  });

  const [isVerified, setIsVerified] = useState(false);

  const [attributes, setAttributes] = useState([
    { name: "Length", value: "25 cm" },
    { name: "Weight", value: "500 g" },
    { name: "Color", value: "Black" },
    { name: "Branch", value: "Main Branch" },
  ]);

  const [customAttributes, setCustomAttributes] = useState([
    { name: "Warranty", value: "12 months" },
  ]);

  const [modal, setModal] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: ["purchase_cost", "selling_price", "mrp"].includes(name)
        ? Number(value)
        : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const result = itemSchema.safeParse({
      ...form,
      is_verified: isVerified,
      attributes,
      custom_attributes: customAttributes,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");
    console.log("Validated item:", result.data);
    alert("Validation successful!");
  }

  return (
    <main className="add-item-page">
      <form className="add-item-card" onSubmit={handleSubmit}>
        <h1>Add New Item</h1>
        <p>Create an inventory item in Stockwise</p>

        <section>
          <h2>1. Basic Information</h2>

          <InputField label="Item Code" name="code"
            value={form.code} onChange={handleChange} />

          <InputField label="Item Name" name="name"
            value={form.name} onChange={handleChange} />

          <label className="form-field">
            Item Type
            <select name="item_type" value={form.item_type}
              onChange={handleChange}>
              <option value="PRODUCT">Product</option>
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="CONSUMABLE">Consumable</option>
            </select>
          </label>
        </section>

        <section>
          <h2>2. Product Details</h2>

          <label className="form-field">
            Base Unit
            <select name="base_unit" value={form.base_unit}
              onChange={handleChange}>
              <option value="PCS">Pieces</option>
              <option value="KG">Kilograms</option>
              <option value="L">Litres</option>
              <option value="M">Metres</option>
            </select>
          </label>
        </section>

        <section>
          <h2>3. Pricing</h2>

          <InputField label="Purchase Cost" name="purchase_cost"
            type="number" value={form.purchase_cost} onChange={handleChange} />

          <InputField label="Selling Price" name="selling_price"
            type="number" value={form.selling_price} onChange={handleChange} />

          <InputField label="MRP" name="mrp"
            type="number" value={form.mrp} onChange={handleChange} />
        </section>

        <section>
          <h2>4. Additional Settings</h2>

          <label className="verified-toggle">
            Verified
            <input type="checkbox" checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)} />
          </label>

          <button type="button" onClick={() => setModal("item")}>
            Item Attributes
          </button>

          <button type="button" onClick={() => setModal("custom")}>
            Custom Attributes
          </button>
        </section>

        {error && <p className="error">{error}</p>}

        <button type="submit">Save Item</button>
      </form>

      {modal === "item" && (
        <ItemAttributesModal
          attributes={attributes}
          setAttributes={setAttributes}
          onClose={() => setModal("")}
        />
      )}

      {modal === "custom" && (
        <CustomAttributesModal
          attributes={customAttributes}
          setAttributes={setCustomAttributes}
          onClose={() => setModal("")}
        />
      )}
    </main>
  );
}

export default AddItem;
