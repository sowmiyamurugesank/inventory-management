import { useState } from "react";
import {
    Package,
    AlertTriangle,
    PackageX,
    IndianRupee,
} from "lucide-react";

import ProductManagement from "../component/ProductManagement";
import StatCard from "../StatCard";
import "../styles/Product.css";

function Products() {
    const [activeTab, setActiveTab] = useState("All Products");

    const tabs = [
        "All Products",
        "Categories",
        "Stock Management",
        "Suppliers",
    ];

    return (
        <div className="products-page">

            {/* Heading */}
            <div className="products-heading">
                <Package className="products-heading-icon" />

                <div>
                    <h1>Products</h1>
                    <p>
                        Manage your products, categories, stock and suppliers.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="product-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={
                            activeTab === tab
                                ? "product-tab active"
                                : "product-tab"
                        }
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="product-cards">
                <StatCard
                    title="Total Products"
                    value="0"
                    icon={<Package className="stat-icon-image" />}
                />

                <StatCard
                    title="Low Stock"
                    value="0"
                    icon={<AlertTriangle className="stat-icon-image" />}
                />

                <StatCard
                    title="Out of Stock"
                    value="0"
                    icon={<PackageX className="stat-icon-image" />}
                />

                <StatCard
                    title="Total Value"
                    value="₹ 0.00"
                    icon={<IndianRupee className="stat-icon-image" />}
                />
            </div>

            {/* Categories / Stock Management / Suppliers */}
            {activeTab !== "All Products" && (
                <div className="product-tab-content">
                    <ProductManagement activeTab={activeTab} />
                </div>
            )}

        </div>
    );
}

export default Products;

import { useState } from "react";
import {
  Package,
  AlertTriangle,
  PackageX,
  IndianRupee,
  Plus,
} from "lucide-react";

import StatCard from "../StatCard";
import Table from "../component/Table";
import ProductForm from "../component/Productform";
import "../styles/Product.css";

function Products() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const tabs = [
    "All Products",
    "Categories",
    "Stock Management",
    "Suppliers",
  ];

  const columns = [
    { key: "itemCode", label: "Item Code", editable: true },
    { key: "itemName", label: "Item Name", editable: true },
    { key: "category", label: "Category", editable: true },
    { key: "brandName", label: "Brand", editable: true },
    {
      key: "purchaseCost",
      label: "Purchase Cost",
      type: "number",
      editable: true,
    },
    {
      key: "sellingPrice",
      label: "Selling Price",
      type: "number",
      editable: true,
    },
    { key: "quantity", label: "Quantity" },
    { key: "status", label: "Status" },
  ];

  const handleSave = (formData) => {
    if (editingProduct) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingProduct.id
            ? { ...formData, id: editingProduct.id }
            : product
        )
      );
    } else {
      setProducts((previous) => [
        ...previous,
        {
          ...formData,
          id: Date.now(),
          quantity: formData.quantity ?? 0,
        },
      ]);
    }

    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleUpdate = (updatedProduct) => {
    setProducts((previous) =>
      previous.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );
  };

  const handleDelete = (productId) => {
    setProducts((previous) =>
      previous.filter((product) => product.id !== productId)
    );
  };

  const lowStock = products.filter(
    (product) =>
      Number(product.quantity) > 0 &&
      Number(product.quantity) <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.quantity) === 0
  ).length;

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(product.purchaseCost || 0) *
        Number(product.quantity || 0),
    0
  );

  return (
    <div className="products-page">
      <div className="products-heading">
        <Package className="products-heading-icon" />

        <div>
          <h1>Products</h1>
          <p>Manage your products, categories, stock and suppliers.</p>
        </div>
      </div>

      <div className="product-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={
              activeTab === tab
                ? "product-tab active"
                : "product-tab"
            }
            onClick={() => {
              setActiveTab(tab);
              setShowForm(false);
              setEditingProduct(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="product-cards">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<Package className="stat-icon-image" />}
        />

        <StatCard
          title="Low Stock"
          value={lowStock}
          icon={<AlertTriangle className="stat-icon-image" />}
        />

        <StatCard
          title="Out of Stock"
          value={outOfStock}
          icon={<PackageX className="stat-icon-image" />}
        />

        <StatCard
          title="Total Value"
          value={`₹ ${totalValue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<IndianRupee className="stat-icon-image" />}
        />
      </div>

      {activeTab === "All Products" && (
        <div className="all-products-section">
          <div className="products-table-heading">
            <h2>All Products</h2>

            <button
              type="button"
              className="add-product-button"
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          {showForm && (
            <ProductForm
              key={editingProduct?.id ?? "new-product"}
              initialData={editingProduct}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          )}

          <Table
            data={products}
            columns={columns}
            onUpdate={handleUpdate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={15}
          />
        </div>
      )}

      {activeTab !== "All Products" && (
        <div className="product-tab-content">
          <h2>{activeTab}</h2>
          <p>This section will be developed next.</p>

          <button
            type="button"
            className="back-button"
            onClick={() => setActiveTab("All Products")}
          >
            Back to All Products
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
