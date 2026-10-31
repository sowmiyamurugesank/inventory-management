import { useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";
import StockManagement from "./StockManagement";
import SupplierManagement from "./SupplierManagement";

import Input from "./Atom/Input";
import Label from "./Atom/Label";
import SelectField from "./Atom/SelectField";
import Textarea from "./Atom/Textarea";

const emptyForm = {
  categoryCode: "",
  integerCode: "",
  categoryName: "",
  description: "",
  customAttributes: "",
  status: "Active",
  verification: "Not verified",
};

function ProductManagement({ activeTab }) {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formTab, setFormTab] = useState("basic");
  const [errors, setErrors] = useState({});

  const columns = [
    { key: "id", label: "S.No" },
    { key: "categoryCode", label: "Category Code" },
    { key: "integerCode", label: "Integer Code" },
    { key: "category", label: "Category Name" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "verification", label: "Verification" },
  ];

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setErrors({});
    setFormTab("basic");
  };

  const openAdd = () => {
    closeForm();
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingCategory(item);
    setForm({
      ...emptyForm,
      categoryCode: item.categoryCode || "",
      integerCode: item.integerCode || "",
      categoryName: item.category || "",
      description: item.description || "",
      customAttributes: item.customAttributes || "",
      status: item.status || "Active",
      verification: item.verification || "Not verified",
    });
    setErrors({});
    setFormTab("basic");
    setShowForm(true);
  };

  const validate = () => {
    const e = {};

    if (!form.categoryCode.trim())
      e.categoryCode = "Category code is required";
    else if (!/^[A-Za-z0-9-]+$/.test(form.categoryCode.trim()))
      e.categoryCode = "Letters, numbers and hyphens only";

    if (!form.integerCode.trim())
      e.integerCode = "Integer code is required";
    else if (!/^\d+$/.test(form.integerCode.trim()))
      e.integerCode = "Digits only";

    if (!form.categoryName.trim())
      e.categoryName = "Category name is required";
    else if (!/^[A-Za-z ]+$/.test(form.categoryName.trim()))
      e.categoryName = "Letters and spaces only";

    if (
      form.description.trim() &&
      !/^[A-Za-z0-9\s.,!?'":;()&/-]+$/.test(form.description.trim())
    )
      e.description = "Invalid description";

    if (form.customAttributes.trim()) {
      try {
        const value = JSON.parse(form.customAttributes);
        if (!value || Array.isArray(value) || typeof value !== "object")
          e.customAttributes = "Enter a valid JSON object";
      } catch {
        e.customAttributes = "Enter valid JSON";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCategory = () => {
    if (!validate()) return;

    const data = {
      ...form,
      categoryCode: form.categoryCode.trim(),
      integerCode: form.integerCode.trim(),
      category: form.categoryName.trim(),
      description: form.description.trim(),
      customAttributes: form.customAttributes.trim(),
    };

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingCategory.id ? { ...item, ...data } : item
        )
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: prev.length
            ? Math.max(...prev.map((item) => item.id)) + 1
            : 1,
          ...data,
        },
      ]);
    }

    closeForm();
  };

  const field = (name, label, placeholder, type = "text") => (
    <div className="category-field" key={name}>
      <Label htmlFor={name} required={["categoryCode", "integerCode", "categoryName"].includes(name)}>
        {label}
      </Label>
      <Input
        name={name}
        type={type}
        value={form[name]}
        placeholder={placeholder}
        onChange={(e) => updateField(name, e.target.value)}
      />
      {errors[name] && <p className="validation-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div>
      {activeTab === "Categories" && (
        <>
          <div className="category-header">
            <h3>Product Categories</h3>
            <Button className="add-category-button" onClick={openAdd}>
              <Plus size={16} /> Add Category
            </Button>
          </div>

          {showForm && (
            <div className="category-modal-overlay" onClick={closeForm}>
              <div className="category-modal" onClick={(e) => e.stopPropagation()}>
                <div className="category-modal-header">
                  <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
                  <button type="button" onClick={closeForm}>×</button>
                </div>

                <div className="category-form-tabs">
                  <button
                    type="button"
                    className={formTab === "basic" ? "active" : ""}
                    onClick={() => setFormTab("basic")}
                  >
                    Basic Information
                  </button>
                  <button
                    type="button"
                    className={formTab === "additional" ? "active" : ""}
                    onClick={() => setFormTab("additional")}
                  >
                    Additional Information
                  </button>
                </div>

                {formTab === "basic" ? (
                  <div className="category-form-section">
                    {field("categoryCode", "Category Code", "Enter category code")}
                    {field("integerCode", "Integer Code", "Enter integer code", "text")}
                    {field("categoryName", "Category Name", "Enter category name")}

                    <div className="category-field">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        name="description"
                        value={form.description}
                        placeholder="Enter category description"
                        onChange={(e) => updateField("description", e.target.value)}
                      />
                      {errors.description && (
                        <p className="validation-error">{errors.description}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="category-form-section">
                    <div className="category-field">
                      <Label htmlFor="customAttributes">Custom Attributes (JSON)</Label>
                      <Textarea
                        name="customAttributes"
                        value={form.customAttributes}
                        placeholder=""
                        onChange={(e) => updateField("customAttributes", e.target.value)}
                      />
                      {errors.customAttributes && (
                        <p className="validation-error">{errors.customAttributes}</p>
                      )}
                    </div>

                    <SelectField
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={(e) => updateField("status", e.target.value)}
                      options={[
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" },
                      ]}
                    />

                    <SelectField
                      label="Verification"
                      name="verification"
                      value={form.verification}
                      onChange={(e) => updateField("verification", e.target.value)}
                      options={[
                        { label: "Not verified", value: "Not verified" },
                        { label: "Verified", value: "Verified" },
                      ]}
                    />
                  </div>
                )}

                <div className="category-modal-buttons">
                  {formTab === "basic" ? (
                    <Button onClick={() => setFormTab("additional")}>Next</Button>
                  ) : (
                    <>
                      <Button onClick={() => setFormTab("basic")}>Back</Button>
                      <Button onClick={saveCategory}>
                        {editingCategory ? "Update" : "Add"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            data={categories}
            actions={(item) => (
              <>
                <Button onClick={() => openEdit(item)}>Edit</Button>
                <Button
                  onClick={() =>
                    setCategories((prev) => prev.filter((c) => c.id !== item.id))
                  }
                >
                  Delete
                </Button>
              </>
            )}
          />

          {categories.length > 15 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(categories.length / 15)}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {activeTab === "Stock Management" && <StockManagement />}
      {activeTab === "Suppliers" && <SupplierManagement />}
    </div>
  );
}

export default ProductManagement;