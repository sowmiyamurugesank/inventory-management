import { useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";
import Dropdown from "./Dropdown";
import "../styles/Supplier.css";
import supplierSchema from "../schema/supplierSchema";
import PurchaseOrder from "./PurchaseOrder";

function ProductManagement({ activeTab }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [supplierPage, setSupplierPage] = useState(1);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [stockCategory, setStockCategory] = useState("all");
    const [stockStatus, setStockStatus] = useState("all");
    const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
    

const [supplierForm, setSupplierForm] = useState({
    vendorType: "Business",
    vendorCode: "",
    numericCode: "",
    vendorName: "",
    description: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: "",
    gstin: "",
    pan: "",
    paymentTerms: "",
    creditLimit: "",
    currency: "INR",
    activeVendor: true,
    verifiedVendor: false
});

    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryNameError, setCategoryNameError] = useState("");
    const [categoryDescriptionError, setCategoryDescriptionError] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [supplierErrors, setSupplierErrors] = useState({});

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
    onChange={(e) => setCategoryDescription(e.target.value)}
/>
{categoryDescriptionError && (
    <p className="validation-error">
        {categoryDescriptionError}
    </p>
)}
            <div className="category-modal-buttons">
                <Button
                    onClick={() => setShowCategoryForm(false)}
                >
                    Cancel
                </Button>

                <Button
    onClick={() => {
        let hasError = false;

        if (!categoryName.trim()) {
            setCategoryNameError("Please enter category name");
            hasError = true;
        } else if (!/^[A-Za-z ]+$/.test(categoryName)) {
            setCategoryNameError("Only letters and spaces are allowed");
            hasError = true;
        }

        if (!categoryDescription.trim()) {
            setCategoryDescriptionError("Please enter description");
            hasError = true;
        } else if (!/^[A-Za-z ]+$/.test(categoryDescription)) {
            setCategoryDescriptionError("Only letters and spaces are allowed");
            hasError = true;
        }

        if (hasError) return;

        if (editingCategory) {
            setCategories(
                categories.map((category) =>
                    category.id === editingCategory.id
                        ? {
                            ...category,
                            category: categoryName,
                            description: categoryDescription
                        }
                        : category
                )
            );
        } else {
            setCategories([
                ...categories,
                {
                    id: categories.length + 1,
                    category: categoryName,
                    description: categoryDescription,
                    status: "Active"
                }
            ]);
        }

        setCategoryName("");
        setCategoryDescription("");
        setEditingCategory(null);
        setShowCategoryForm(false);
    }}
>
    {editingCategory ? "Update" : "Add"}
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
        setCategoryName(item.category);
        setCategoryDescription(item.description);
        setShowCategoryForm(true);
    }}
>
    Edit
</Button>

            <Button
                onClick={() => {
                    setCategories(
                        categories.filter(
                            (category) => category.id !== item.id
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
        totalPages={Math.ceil(categories.length / 15)}
        onPageChange={setCurrentPage}
    />
)}
    </>
)}

           
            {activeTab === "Stock Management" && (
                <>
                   <div className="stock-header">
            <h3>Stock Management</h3>
        </div>
                    <div className="stock-filters">
                        <Dropdown
    options={[
        { value: "all", label: "All Categories" },
        { value: "electronics", label: "Electronics" },
        { value: "furniture", label: "Furniture" },
        { value: "stationery", label: "Stationery" }
    ]}
    value={stockCategory}
    onChange={setStockCategory}
    placeholder="All Categories"
/>

                        <Dropdown
    options={[
        { value: "all", label: "All Status" },
        { value: "in-stock", label: "In Stock" },
        { value: "low-stock", label: "Low Stock" },
        { value: "out-of-stock", label: "Out of Stock" }
    ]}
    value={stockStatus}
    onChange={setStockStatus}
    placeholder="All Status"
/>
              <button
    className="purchase-order-btn"
    onClick={() => setShowPurchaseOrder(true)}
>
    + Purchase Order
</button>
                    </div>

                    <DataTable
                        columns={stockColumns}
                        data={[]}
                        actions={(item) => (
                            <Button>View</Button>
                        )}
                    />
                    {showPurchaseOrder && (
    <PurchaseOrder
        onClose={() => setShowPurchaseOrder(false)}
    />
)}
                </>
            )}

           
            {activeTab === "Suppliers" && (
                <>
                    <div className="supplier-header">
                        <h3>Suppliers</h3>

                       <Button
    className="add-supplier-button"
    onClick={() => setShowSupplierForm(true)}
>
    + Add Supplier
</Button>
                    </div>
                {showSupplierForm && (
    <div className="supplier-modal-overlay">

        <div className="supplier-modal">

            <div className="supplier-modal-header">
                <h3>Add Supplier</h3>

                <button
                    type="button"
                    onClick={() => setShowSupplierForm(false)}
                >
                    ×
                </button>
            </div>

            {/* Vendor Information */}
            <div className="supplier-section">
                <h4>Vendor Information</h4>

                <label>Vendor Type *</label>
                <select
                    value={supplierForm.vendorType}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            vendorType: e.target.value
                        })
                    }
                >
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                </select>

                <div className="supplier-form-row">
                    <div>
                         <label>Vendor Code *</label>
                        <input
    type="text"
    value={supplierForm.vendorCode}
    onChange={(e) => {
        setSupplierForm({
            ...supplierForm,
            vendorCode: e.target.value
        });
        setSupplierErrors({
            ...supplierErrors,
            vendorCode: ""
        });
    }}
/>

{supplierErrors.vendorCode && (
    <p className="validation-error">
        {supplierErrors.vendorCode}
    </p>
)}
                    </div>

                    <div>
                        <label>Numeric Code</label>
                        <input
                            type="text"
                            value={supplierForm.numericCode}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    numericCode: e.target.value
                                })
                            }
                        />
                    </div>
                </div>

                <label>Vendor Name *</label>
                <input
    type="text"
    value={supplierForm.vendorName}
    onChange={(e) => {
        setSupplierForm({
            ...supplierForm,
            vendorName: e.target.value
        });

        setSupplierErrors({
            ...supplierErrors,
            vendorName: ""
        });
    }}
/>

{supplierErrors.vendorName && (
    <p className="validation-error">
        {supplierErrors.vendorName}
    </p>
)}

                <label>Description</label>
                <textarea
                    value={supplierForm.description}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            description: e.target.value
                        })
                    }
                />
            </div>

            {/* Contact Details */}
            <div className="supplier-section">
                <h4>Contact Details</h4>

                <label>Contact Person</label>
                <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            contactPerson: e.target.value
                        })
                    }
                />

                <div className="supplier-form-row">
                    <div>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={supplierForm.email}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    email: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={supplierForm.phone}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    phone: e.target.value
                                })
                            }
                        />
                    </div>
                </div>

                <label>Website</label>
                <input
                    type="text"
                    value={supplierForm.website}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            website: e.target.value
                        })
                    }
                />
            </div>

            {/* Address Details */}
            <div className="supplier-section">
                <h4>Address Details</h4>

                <label>Address Line 1</label>
                <input
                    type="text"
                    value={supplierForm.addressLine1}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            addressLine1: e.target.value
                        })
                    }
                />

                <label>Address Line 2</label>
                <input
                    type="text"
                    value={supplierForm.addressLine2}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            addressLine2: e.target.value
                        })
                    }
                />

                <div className="supplier-form-row">
                    <div>
                        <label>City</label>
                        <input
                            type="text"
                            value={supplierForm.city}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    city: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>State</label>
                        <input
                            type="text"
                            value={supplierForm.state}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    state: e.target.value
                                })
                            }
                        />
                    </div>
                </div>

                <div className="supplier-form-row">
                    <div>
                        <label>Postal Code</label>
                        <input
                            type="text"
                            value={supplierForm.postalCode}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    postalCode: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Country Code *</label>

<input
    type="text"
    value={supplierForm.countryCode}
    onChange={(e) => {
        setSupplierForm({
            ...supplierForm,
            countryCode: e.target.value
        });

        setSupplierErrors({
            ...supplierErrors,
            countryCode: ""
        });
    }}
/>

{supplierErrors.countryCode && (
    <p className="validation-error">
        {supplierErrors.countryCode}
    </p>
)}
                    </div>
                </div>
            </div>

            {/* Tax & Payment Details */}
            <div className="supplier-section">
                <h4>Tax & Payment Details</h4>

                <div className="supplier-form-row">
                    <div>
                        <label>GSTIN</label>
                        <input
                            type="text"
                            value={supplierForm.gstin}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    gstin: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>PAN</label>
                        <input
                            type="text"
                            value={supplierForm.pan}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    pan: e.target.value
                                })
                            }
                        />
                    </div>
                </div>

                <div className="supplier-form-row">
                    <div>
                        <label>Payment Terms (Days)</label>
                        <input
                            type="number"
                            value={supplierForm.paymentTerms}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    paymentTerms: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Credit Limit</label>
                        <input
                            type="number"
                            value={supplierForm.creditLimit}
                            onChange={(e) =>
                                setSupplierForm({
                                    ...supplierForm,
                                    creditLimit: e.target.value
                                })
                            }
                        />
                    </div>
                </div>

                <label>Currency *</label>
                <select
                    value={supplierForm.currency}
                    onChange={(e) =>
                        setSupplierForm({
                            ...supplierForm,
                            currency: e.target.value
                        })
                    }
                >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>

            {/* Vendor Status */}
            <div className="supplier-section">
                <h4>Vendor Status</h4>

                <label className="supplier-checkbox">
                    <input
                        type="checkbox"
                        checked={supplierForm.activeVendor}
                        onChange={(e) =>
                            setSupplierForm({
                                ...supplierForm,
                                activeVendor: e.target.checked
                            })
                        }
                    />
                    Active Vendor
                </label>

                <label className="supplier-checkbox">
                    <input
                        type="checkbox"
                        checked={supplierForm.verifiedVendor}
                        onChange={(e) =>
                            setSupplierForm({
                                ...supplierForm,
                                verifiedVendor: e.target.checked
                            })
                        }
                    />
                    Verified Vendor
                </label>
            </div>

            {/* Buttons */}
            <div className="supplier-modal-buttons">
                <Button
                    onClick={() => setShowSupplierForm(false)}
                >
                    Cancel
                </Button>

              <Button
    onClick={() => {
        const errors = {};

        // First: required-field validation
        if (!supplierForm.vendorCode.trim()) {
            errors.vendorCode = "Please enter vendor code";
        }

        if (!supplierForm.vendorName.trim()) {
            errors.vendorName = "Please enter vendor name";
        }

        if (!supplierForm.countryCode.trim()) {
            errors.countryCode = "Please enter country code";
        }

        if (Object.keys(errors).length > 0) {
            setSupplierErrors(errors);
            return;
        }

        // Second: Zod validation
        const result = supplierSchema.safeParse(supplierForm);

        if (!result.success) {
            const zodErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                zodErrors[field] = issue.message;
            });

            setSupplierErrors(zodErrors);
            return;
        }

        // Everything correct
        setSupplierErrors({});

        if (editingSupplier) {
    setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
            supplier.id === editingSupplier.id
                ? {
                    ...supplier,
                    ...supplierForm,
                    name: supplierForm.vendorName,
                    contact: supplierForm.contactPerson,
                    email: supplierForm.email,
                    status: supplierForm.activeVendor
                        ? "Active"
                        : "Inactive"
                }
                : supplier
        )
    );
}

        // Add new supplier
        else {
            setSuppliers([
                ...suppliers,
                {
                    id: suppliers.length + 1,
                    name: supplierForm.vendorName,
                    contact: supplierForm.contactPerson,
                    email: supplierForm.email,
                    status: supplierForm.activeVendor
                        ? "Active"
                        : "Inactive"
                }
            ]);
        }

        setEditingSupplier(null);
        setShowSupplierForm(false);
    }}
>
    {editingSupplier ? "Update Supplier" : "Add Supplier"}
</Button>
            </div>

        </div>
    </div>
)}
                    <DataTable
    columns={supplierColumns}
    data={suppliers}
    actions={(item) => (
        <>
            <Button
                onClick={() => {
                    setEditingSupplier(item);

                    setSupplierForm({
                        ...supplierForm,
                        vendorName: item.name,
                        contactPerson: item.contact,
                        email: item.email,
                        activeVendor: item.status === "Active"
                    });

                    setShowSupplierForm(true);
                }}
            >
                Edit
            </Button>

            <Button
                onClick={() => {
                    setSuppliers(
                        suppliers.filter(
                            (supplier) => supplier.id !== item.id
                        )
                    );
                }}
            >
                Delete
            </Button>
        </>
    )}
/>

                    {suppliers.length > 15 && (
    <Pagination
        currentPage={supplierPage}
        totalPages={Math.ceil(suppliers.length / 15)}
        onPageChange={setSupplierPage}
    />
)}
                </>
            )}

        </div>
    );
}

export default ProductManagement;