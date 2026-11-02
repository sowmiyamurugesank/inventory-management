import { useState, useEffect, useCallback } from "react";
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

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const CATEGORY_API = `${API_BASE_URL}/product-categories`;

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

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [apiError, setApiError] = useState("");

  // --------------------------------------------------
  // TABLE COLUMNS
  // --------------------------------------------------

  const columns = [
    { key: "serialNumber", label: "S.No" },
    { key: "categoryCode", label: "Category Code" },
    { key: "integerCode", label: "Integer Code" },
    { key: "category", label: "Category Name" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "verification", label: "Verification" },
  ];

  // --------------------------------------------------
  // API RESPONSE HANDLER
  // --------------------------------------------------

  async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Something went wrong."
      );
    }

    return result;
  }

  // --------------------------------------------------
  // MAP DATABASE RESPONSE TO FRONTEND FORMAT
  // --------------------------------------------------

  function mapCategory(category, index) {
    return {
      id: category.id,

      serialNumber: index + 1,

      categoryCode: category.code ?? "",

      integerCode:
        category.code_int != null
          ? String(category.code_int)
          : "",

      category: category.name ?? "",

      description: category.description ?? "",

      customAttributes: JSON.stringify(
        category.custom_attributes ?? {},
        null,
        2
      ),

      status: category.is_active ? "Active" : "Inactive",

      verification: category.is_verified
        ? "Verified"
        : "Not verified",

      version: category.version,
    };
  }

  // --------------------------------------------------
  // GET ALL CATEGORIES
  // --------------------------------------------------

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await fetch(CATEGORY_API);

      const result = await handleResponse(response);

      const categoryList = Array.isArray(result.data)
        ? result.data
        : [];

      setCategories(
        categoryList.map((category, index) =>
          mapCategory(category, index)
        )
      );
    } catch (error) {
      console.error("Failed to load categories:", error);

      setApiError(error.message);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Categories") {
      loadCategories();
    }
  }, [activeTab, loadCategories]);

  // --------------------------------------------------
  // FORM FIELD HANDLING
  // --------------------------------------------------

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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
    setApiError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const openEdit = (item) => {
    setEditingCategory(item);

    setForm({
      ...emptyForm,

      categoryCode: item.categoryCode || "",

      integerCode: item.integerCode || "",

      categoryName: item.category || "",

      description: item.description || "",

      customAttributes: item.customAttributes || "{}",

      status: item.status || "Active",

      verification: item.verification || "Not verified",
    });

    setErrors({});
    setApiError("");
    setFormTab("basic");
    setShowForm(true);
  };

  // --------------------------------------------------
  // FORM VALIDATION
  // --------------------------------------------------

  const validate = () => {
    const e = {};

    if (!form.categoryCode.trim()) {
      e.categoryCode = "Category code is required";
    } else if (
      !/^[A-Za-z0-9-]+$/.test(form.categoryCode.trim())
    ) {
      e.categoryCode = "Letters, numbers and hyphens only";
    }

    if (!form.integerCode.trim()) {
      e.integerCode = "Integer code is required";
    } else if (!/^\d+$/.test(form.integerCode.trim())) {
      e.integerCode = "Digits only";
    }

    if (!form.categoryName.trim()) {
      e.categoryName = "Category name is required";
    } else if (
      !/^[A-Za-z ]+$/.test(form.categoryName.trim())
    ) {
      e.categoryName = "Letters and spaces only";
    }

    if (
      form.description.trim() &&
      !/^[A-Za-z0-9\s.,!?'":;()&/-]+$/.test(
        form.description.trim()
      )
    ) {
      e.description = "Invalid description";
    }

    if (form.customAttributes.trim()) {
      try {
        const value = JSON.parse(form.customAttributes);

        if (
          !value ||
          Array.isArray(value) ||
          typeof value !== "object"
        ) {
          e.customAttributes = "Enter a valid JSON object";
        }
      } catch {
        e.customAttributes = "Enter valid JSON";
      }
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // --------------------------------------------------
  // CONVERT FORM DATA TO DATABASE FORMAT
  // --------------------------------------------------

  const preparePayload = () => {
    let customAttributes = {};

    if (form.customAttributes.trim()) {
      customAttributes = JSON.parse(
        form.customAttributes
      );
    }

    const isActive = form.status === "Active";

    return {
      code: form.categoryCode.trim(),

      code_int: Number(form.integerCode),

      name: form.categoryName.trim(),

      description: form.description.trim(),

      custom_attributes: customAttributes,

      status: isActive ? "active" : "inactive",

      is_active: isActive,

      is_verified: form.verification === "Verified",

      ...(editingCategory && {
        version: editingCategory.version,
      }),
    };
  };

  // --------------------------------------------------
  // CREATE / UPDATE CATEGORY
  // --------------------------------------------------

  const saveCategory = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");

      const payload = preparePayload();

      const isEditing = Boolean(editingCategory);

      const url = isEditing
        ? `${CATEGORY_API}/${editingCategory.id}`
        : CATEGORY_API;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      await handleResponse(response);

      // Reload actual database records.
      await loadCategories();

      closeForm();

    } catch (error) {
      console.error("Failed to save category:", error);

      setApiError(error.message);

    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE CATEGORY
  // --------------------------------------------------

  const deleteCategory = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.category}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setApiError("");

      const response = await fetch(
        `${CATEGORY_API}/${item.id}`,
        {
          method: "DELETE",
        }
      );

      await handleResponse(response);

      await loadCategories();

    } catch (error) {
      console.error("Failed to delete category:", error);

      setApiError(error.message);

    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // FORM FIELD COMPONENT
  // --------------------------------------------------

  const field = (name, label, placeholder, type = "text") => (
    <div className="category-field" key={name}>
      <Label
        htmlFor={name}
        required={[
          "categoryCode",
          "integerCode",
          "categoryName",
        ].includes(name)}
      >
        {label}
      </Label>

      <Input
        name={name}
        type={type}
        value={form[name]}
        placeholder={placeholder}
        onChange={(e) =>
          updateField(name, e.target.value)
        }
      />

      {errors[name] && (
        <p className="validation-error">
          {errors[name]}
        </p>
      )}
    </div>
  );

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div>
      {activeTab === "Categories" && (
        <>
          <div className="category-header">
            <h3>Product Categories</h3>

            <Button
              className="add-category-button"
              onClick={openAdd}
            >
              <Plus size={16} /> Add Category
            </Button>
          </div>

          {apiError && (
            <p className="validation-error">
              {apiError}
            </p>
          )}

          {showForm && (
            <div
              className="category-modal-overlay"
              onClick={closeForm}
            >
              <div
                className="category-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="category-modal-header">
                  <h3>
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h3>

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    ×
                  </button>
                </div>

                <div className="category-form-tabs">
                  <button
                    type="button"
                    className={
                      formTab === "basic" ? "active" : ""
                    }
                    onClick={() => setFormTab("basic")}
                  >
                    Basic Information
                  </button>

                  <button
                    type="button"
                    className={
                      formTab === "additional"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFormTab("additional")
                    }
                  >
                    Additional Information
                  </button>
                </div>

                {formTab === "basic" ? (
                  <div className="category-form-section">
                    {field(
                      "categoryCode",
                      "Category Code",
                      "Enter category code"
                    )}

                    {field(
                      "integerCode",
                      "Integer Code",
                      "Enter integer code",
                      "text"
                    )}

                    {field(
                      "categoryName",
                      "Category Name",
                      "Enter category name"
                    )}

                    <div className="category-field">
                      <Label htmlFor="description">
                        Description
                      </Label>

                      <Textarea
                        name="description"
                        value={form.description}
                        placeholder="Enter category description"
                        onChange={(e) =>
                          updateField(
                            "description",
                            e.target.value
                          )
                        }
                      />

                      {errors.description && (
                        <p className="validation-error">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="category-form-section">
                    <div className="category-field">
                      <Label htmlFor="customAttributes">
                        Custom Attributes (JSON)
                      </Label>

                      <Textarea
                        name="customAttributes"
                        value={form.customAttributes}
                        placeholder='{"key": "value"}'
                        onChange={(e) =>
                          updateField(
                            "customAttributes",
                            e.target.value
                          )
                        }
                      />

                      {errors.customAttributes && (
                        <p className="validation-error">
                          {errors.customAttributes}
                        </p>
                      )}
                    </div>

                    <SelectField
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value
                        )
                      }
                      options={[
                        {
                          label: "Active",
                          value: "Active",
                        },
                        {
                          label: "Inactive",
                          value: "Inactive",
                        },
                      ]}
                    />

                    <SelectField
                      label="Verification"
                      name="verification"
                      value={form.verification}
                      onChange={(e) =>
                        updateField(
                          "verification",
                          e.target.value
                        )
                      }
                      options={[
                        {
                          label: "Not verified",
                          value: "Not verified",
                        },
                        {
                          label: "Verified",
                          value: "Verified",
                        },
                      ]}
                    />
                  </div>
                )}

                <div className="category-modal-buttons">
                  {formTab === "basic" ? (
                    <Button
                      onClick={() => {
                        if (validate()) {
                          setFormTab("additional");
                        }
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          setFormTab("basic")
                        }
                        disabled={saving}
                      >
                        Back
                      </Button>

                      <Button
                        onClick={saveCategory}
                        disabled={saving}
                      >
                        {saving
                          ? "Saving..."
                          : editingCategory
                            ? "Update"
                            : "Add"}
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
                <Button
                  onClick={() => openEdit(item)}
                  disabled={deletingId === item.id}
                >
                  Edit
                </Button>

                <Button
                  onClick={() => deleteCategory(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </>
            )}
          />

          {loading && (
            <p>Loading product categories...</p>
          )}

          {!loading && categories.length === 0 && !apiError && (
            <p>No product categories found.</p>
          )}

          {categories.length > 15 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(categories.length / 15)}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {activeTab === "Stock Management" && (
        <StockManagement />
      )}

      {activeTab === "Suppliers" && (
        <SupplierManagement />
      )}
    </div>
  );
}

export default ProductManagement;