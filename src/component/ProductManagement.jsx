import { useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";
import StockManagement from "./StockManagement";
import SupplierManagement from "./SupplierManagement";


function ProductManagement({ activeTab }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryForm, setShowCategoryForm] =useState(false);
  const [editingCategory, setEditingCategory] =useState(null);
  const [categoryName, setCategoryName] =useState("");
  const [categoryDescription, setCategoryDescription] =useState("");
  const [categories, setCategories] = useState([]);
  const [categoryNameError, setCategoryNameError] =useState("");

  const [
    categoryDescriptionError, setCategoryDescriptionError,] = useState("");
    const categoryColumns = [
    { key: "id", label: "S.No" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      {activeTab === "Categories" && (
        <>
          <div className="category-header">
            <h3>Product Categories</h3>

            <Button className="add-category-button"onClick={() => setShowCategoryForm(
                  !showCategoryForm
                )
              }
            >
              <Plus size={16} />
              Add Category
            </Button>
          </div>

          {showCategoryForm && (
            <div className="category-modal-overlay">
              <div className="category-modal">
                <div className="category-modal-header">
                  <h3>
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                  >
                    ×
                  </button>
                </div>

                <label>Category Name</label>

                <input
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(
                      e.target.value
                    );
                    setCategoryNameError("");
                  }}
                />

                {categoryNameError && (
                  <p className="validation-error">
                    {categoryNameError}
                  </p>
                )}

                <label>Description</label>

                <input
                  type="text"
                  placeholder="Enter description"
                  value={categoryDescription}
                  onChange={(e) => {
                    setCategoryDescription(
                      e.target.value
                    );
                    setCategoryDescriptionError(
                      ""
                    );
                  }}
                />

                {categoryDescriptionError && (
                  <p className="validation-error">
                    {categoryDescriptionError}
                  </p>
                )}

                <div className="category-modal-buttons">
                  <Button
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      let hasError = false;

                      if (!categoryName.trim()) {
                        setCategoryNameError(
                          "Please enter category name"
                        );
                        hasError = true;
                      } else if (
                        !/^[A-Za-z ]+$/.test(
                          categoryName
                        )
                      ) {
                        setCategoryNameError(
                          "Only letters and spaces are allowed"
                        );
                        hasError = true;
                      }

                      if (
                        !categoryDescription.trim()
                      ) {
                        setCategoryDescriptionError(
                          "Please enter description"
                        );
                        hasError = true;
                      } else if (
                        !/^[A-Za-z ]+$/.test(
                          categoryDescription
                        )
                      ) {
                        setCategoryDescriptionError(
                          "Only letters and spaces are allowed"
                        );
                        hasError = true;
                      }

                      if (hasError) return;

                      if (editingCategory) {
                        setCategories(
                          categories.map(
                            (category) =>
                              category.id ===
                              editingCategory.id
                                ? {
                                    ...category,
                                    category:
                                      categoryName,
                                    description:
                                      categoryDescription,
                                  }
                                : category
                          )
                        );
                      } else {
                        setCategories([
                          ...categories,
                          {
                            id:
                              categories.length +
                              1,
                            category:
                              categoryName,
                            description:
                              categoryDescription,
                            status: "Active",
                          },
                        ]);
                      }

                      setCategoryName("");
                      setCategoryDescription("");
                      setCategoryNameError("");
                      setCategoryDescriptionError("");
                      setEditingCategory(null);
                      setShowCategoryForm(false);
                    }}
                  >
                    {editingCategory
                      ? "Update"
                      : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DataTable
            columns={categoryColumns}
            data={categories}
            actions={(item) => (
              <>
                <Button
                  onClick={() => {
                    setEditingCategory(item);
                    setCategoryName(
                      item.category
                    );
                    setCategoryDescription(
                      item.description
                    );
                    setCategoryNameError("");
                    setCategoryDescriptionError("");
                    setShowCategoryForm(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  onClick={() => {
                    setCategories(
                      categories.filter(
                        (category) =>
                          category.id !== item.id
                      )
                    );
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          />

          {categories.length > 15 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(
                categories.length / 15
              )}
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

