import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";
import Dropdown from "./Dropdown";
import { useState } from "react";
function ProductManagement() {
const [currentPage, setCurrentPage] = useState(1);
const [supplierPage, setSupplierPage] = useState(1);
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

         <div className="add-category">
    <h3>Add Category</h3>

    <input
        type="text"
        placeholder="Category Name"
    />

    <input
        type="text"
        placeholder="Description"
    />

    <select>
        <option>Active</option>
        <option>Inactive</option>
    </select>

    <button>Add Category</button>
</div>
            <DataTable
                columns={categoryColumns}
                data={[]}
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
            <DataTable
                columns={stockColumns}
                data={[]}
                actions={(item) => (
                    <Button>View</Button>
                )}
            />
            


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
        </div>
    );
}

export default ProductManagement;