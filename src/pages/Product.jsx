import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  PackageX,
  IndianRupee,
  Plus,
} from "lucide-react";

import ProductManagement from "../component/ProductManagement";
import StatCard from "../StatCard";
import Table from "../component/Table";
import ProductForm from "../component/Productform";
import Button from "../component/Button";
import Modal from "../component/Modal1";

import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../api";

import "../styles/Product.css";

function fromApiItem(item) {
  return {
    ...item,
    id: item.id,
    itemCode: item.code ?? "",
    itemName: item.name ?? "",
    itemType: item.item_type === "SERVICE" ? "Service" : "Goods",
    category: item.category_name ?? item.category ?? "",
    categoryId: item.category_id ?? "",
    description: item.description ?? "",
    brandName: item.brand_name ?? "",
    manufacturer: item.manufacturer_name ?? "",
    manufacturerPartNumber: item.manufacturer_part_number ?? "",
    baseUnit: item.base_unit ?? "",
    purchaseCost: Number(item.purchase_cost ?? 0),
    sellingPrice: Number(item.selling_price ?? 0),
    mrp: Number(item.mrp ?? 0),
    currency: item.currency_code ?? "INR",
    verified: item.is_verified ?? false,
    status: item.status ?? "Active",
    quantity: Number(item.quantity ?? 0),
    version: item.version,
  };
}

function toApiItem(formData) {
  const customAttributes = {};

  if (
    formData.customAttributes &&
    !Array.isArray(formData.customAttributes)
  ) {
    Object.assign(customAttributes, formData.customAttributes);
  }

  const attributes = [
    ...(Array.isArray(formData.itemAttributes)
      ? formData.itemAttributes
      : []),
    ...(Array.isArray(formData.customAttributes)
      ? formData.customAttributes
      : []),
  ];

  for (const attribute of attributes) {
    if (attribute.name?.trim()) {
      customAttributes[attribute.name.trim()] = attribute.value ?? "";
    }
  }

  const payload = {
    code: formData.itemCode?.trim(),
    name: formData.itemName?.trim(),
    item_type:
      formData.itemType === "Service" ? "SERVICE" : "PRODUCT",
    base_unit: formData.baseUnit,
    custom_attributes: customAttributes,
    description: formData.description ?? "",
    brand_name: formData.brandName ?? "",
    manufacturer_name: formData.manufacturer ?? "",
    manufacturer_part_number: formData.manufacturerPartNumber ?? "",
    purchase_cost: Number(formData.purchaseCost || 0),
    selling_price: Number(formData.sellingPrice || 0),
    mrp: Number(formData.mrp || 0),
    currency_code: formData.currency || "INR",
    status: "OUT_OF_STOCK",
    is_active: true,
    is_verified: Boolean(formData.verified),
  };

  if (formData.categoryId) {
    payload.category_id = formData.categoryId;
  }

  if (formData.version !== undefined) {
    payload.version = formData.version;
  }

  return payload;
}

function Products() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      editable: true,
    },
    { key: "status", label: "Status" },
  ];

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getItems();

      const items = Array.isArray(result)
        ? result
        : result?.items ?? result?.rows ?? result?.data ?? [];

      if (!Array.isArray(items)) {
        throw new Error("Unexpected item list response from server");
      }

      setProducts(items.map(fromApiItem));
    } catch (err) {
      setError(err.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setError("");

    try {
      const payload = toApiItem(formData);

      if (editingProduct) {
        await updateItem(editingProduct.id, {
          ...payload,
          quantity: Number(
            formData.quantity ?? editingProduct.quantity ?? 0
          ),
        });
      } else {
        await createItem({
          ...payload,
          quantity: 1,
        });
      }

      setShowForm(false);
      setEditingProduct(null);

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setError("");
  };

  const handleUpdate = async (updatedProduct) => {
    setError("");

    try {
      const payload = toApiItem(updatedProduct);
      payload.quantity = Number(updatedProduct.quantity ?? 0);

      await updateItem(updatedProduct.id, payload);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to update product");
    }
  };

  const handleDelete = async (productId) => {
    setError("");

    try {
      await deleteItem(productId);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setError("");
  };

  // Card calculations
  const totalProducts = products.length;

  const lowStock = products.filter(
    (product) =>
      Number(product.quantity) > 0 &&
      Number(product.quantity) <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.quantity) <= 0
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
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="product-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadProducts}>
            Retry
          </button>
        </div>
      )}

      {activeTab === "All Products" && (
        <>
          <div className="product-cards">
            <StatCard
              title="Total Products"
              value={totalProducts}
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

          <div className="all-products-section">
            <div className="products-table-heading">
              <h2>All Products</h2>

              <Button
                className="add-button"
                disabled={saving}
                onClick={() => {
                  setEditingProduct(null);
                  setError("");
                  setShowForm(true);
                }}
              >
                <Plus size={18} />
                Add Product
              </Button>
            </div>

            {loading ? (
              <p>Loading products...</p>
            ) : (
              <Table
                data={products}
                columns={columns}
                onUpdate={handleUpdate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                itemsPerPage={15}
              />
            )}
          </div>
        </>
      )}

      {activeTab !== "All Products" && (
        <div className="product-tab-content">
          <ProductManagement activeTab={activeTab} />
        </div>
      )}

      <Modal isOpen={showForm} onClose={handleCancel}>
        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          initialData={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={saving}
        />
      </Modal>
    </div>
  );
}

export default Products;