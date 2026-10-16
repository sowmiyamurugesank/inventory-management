import { useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";
import Dropdown from "./Dropdown";

function ProductManagement({ activeTab }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [supplierPage, setSupplierPage] = useState(1);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categories, setCategories] = useState([]);

    const categoryColumns = [
        { key: "id", label: "S.No" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" }
    ];

    const stockColumns = [
        { key: "name", label: "Product" },
        { key: "availableStock", label: "Available Stock" },
        { key: "reorderLevel", label: "Reorder Level" },
        { key: "status", label: "Status" }
    ];

    const supplierColumns = [
        { key: "id", label: "S.No" },
        { key: "name", label: "Supplier Name" },
        { key: "contact", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" }
    ];

    return (
        <div>
            {activeTab === "Categories" && (
    <>
        <div className="category-header">
            <h3>Product Categories</h3>

            <Button
                className="add-category-button"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
            >
                <Plus size={16} />
                Add Category
            </Button>
        </div>

        {showCategoryForm && (
    <div className="category-modal-overlay">

        <div className="category-modal">

            <div className="category-modal-header">
                <h3>Add Category</h3>

                <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                >
                    ×
                </button>
            </div>

            <label>Category Name</label>
            <input
    type="text"
    placeholder="Enter category name"
    value={categoryName}
    onChange={(e) => setCategoryName(e.target.value)}
/>

            <label>Description</label>
            <input
    type="text"
    placeholder="Enter description"
    value={categoryDescription}
    onChange={(e) => setCategoryDescription(e.target.value)}
/>

            <div className="category-modal-buttons">
                <Button
                    onClick={() => setShowCategoryForm(false)}
                >
                    Cancel
                </Button>

                <Button
    onClick={() => {
        const newCategory = {
            id: categories.length + 1,
            category: categoryName,
            description: categoryDescription,
            status: "Active"
        };

        setCategories([...categories, newCategory]);

        setCategoryName("");
        setCategoryDescription("");
        setShowCategoryForm(false);
    }}
>
    Add Category
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
                    <Button>Edit</Button>
                    <Button>Delete</Button>
                </>
            )}
        />

        <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
        />
    </>
)}

            {/* Stock Management */}
            {activeTab === "Stock Management" && (
                <>
                    <div className="stock-filters">
                        <Dropdown
                            options={[
                                { value: "all", label: "All Categories" },
                                { value: "electronics", label: "Electronics" },
                                { value: "furniture", label: "Furniture" },
                                { value: "stationery", label: "Stationery" }
                            ]}
                            placeholder="All Categories"
                        />

                        <Dropdown
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "in-stock", label: "In Stock" },
                                { value: "low-stock", label: "Low Stock" },
                                { value: "out-of-stock", label: "Out of Stock" }
                            ]}
                            placeholder="All Status"
                        />
                    </div>

                    <DataTable
                        columns={stockColumns}
                        data={[]}
                        actions={(item) => (
                            <Button>View</Button>
                        )}
                    />
                </>
            )}

            {/* Suppliers */}
            {activeTab === "Suppliers" && (
                <>
                    <div className="supplier-header">
                        <h3>Suppliers</h3>

                        <Button>
                            + Add Supplier
                        </Button>
                    </div>

                    <DataTable
                        columns={supplierColumns}
                        data={[]}
                        actions={(item) => (
                            <>
                                <Button>Edit</Button>
                                <Button>Delete</Button>
                            </>
                        )}
                    />

                    <Pagination
                        currentPage={supplierPage}
                        totalPages={5}
                        onPageChange={setSupplierPage}
                    />
                </>
            )}

        </div>
    );
}

export default ProductManagement;