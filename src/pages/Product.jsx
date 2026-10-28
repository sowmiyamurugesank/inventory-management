
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  AlertTriangle,
  PackageX,
  IndianRupee,
  Plus,
} from "lucide-react";

import ProductManagement from "../component/ProductManagement.jsx";
import StatCard from "../StatCard.jsx";
import Table from "../component/Table.jsx";
import ProductForm from "../component/Productform.jsx";
import Button from "../component/Button.jsx";
import Modal from "../component/Modal1.jsx";
import PurchaseOrder from "../component/PurchaseOrder.jsx";
import PurchaseWorkflow from "../component/PurchaseWorkflow.jsx";
import ProductDetails from "./ProductDetail.jsx";

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
    itemType: item.item_type === "SERVICE" ? "SERVICE" : "PRODUCT",
    category: item.category_name ?? item.category ?? "",
    categoryId: item.category_id ?? "",
    description: item.description ?? "",
    brandName: item.brand_name ?? "",
    manufacturer: item.manufacturer_name ?? "",
    manufacturerPartNumber: item.manufacturer_part_number ?? "",
    baseUnit: item.base_unit ?? "PCS",
    purchaseCost: Number(item.purchase_cost ?? 0),
    sellingPrice: Number(item.selling_price ?? 0),
    mrp: Number(item.mrp ?? 0),
    currency: item.currency_code ?? "INR",
    verified: item.is_verified ?? false,
    active: item.is_active ?? true,
    status: item.status ?? "OUT_OF_STOCK",
    quantity: Number(item.quantity ?? 0),
    version: item.version,
  };
}

function toApiItem(formData) {
  const payload = {
    code: formData.itemCode?.trim(),
    name: formData.itemName?.trim(),

    item_type:
      formData.itemType === "SERVICE" ||
      formData.itemType === "Service"
        ? "SERVICE"
        : "PRODUCT",

    base_unit: formData.baseUnit,
    description: formData.description ?? "",
    brand_name: formData.brandName ?? "",
    manufacturer_name: formData.manufacturer ?? "",
    manufacturer_part_number:
      formData.manufacturerPartNumber ?? "",

    purchase_cost: Number(formData.purchaseCost || 0),
    selling_price: Number(formData.sellingPrice || 0),
    mrp: Number(formData.mrp || 0),

    currency_code: formData.currency || "INR",
    status: formData.status ?? "OUT_OF_STOCK",
    is_active: Boolean(formData.active),
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All Products");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseZones, setWarehouseZones] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [units] = useState(["PCS", "KG", "LITRE", "BOX"]);
  const [statuses] = useState(["PENDING", "RECEIVED", "CANCELLED"]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Existing Purchase Order form
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);

  // PurchaseWorkflow component visibility
  const [showPurchaseWorkflow, setShowPurchaseWorkflow] = useState(false);

  // Purchase Orders table data
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    "All Products",
    "Categories",
    "Stock Management",
    "Suppliers",
    "Purchase",
  ];

  const columns = [
    {
      key: "itemCode",
      label: "Item Code",
      editable: true,
    },
    {
      key: "itemName",
      label: "Item Name",
      editable: true,
    },
    {
      key: "category",
      label: "Category",
      editable: true,
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      editable: true,
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  // Load products from API
  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getItems();

      const items = Array.isArray(result)
        ? result
        : result?.items ??
          result?.rows ??
          result?.data ??
          [];

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

  // Save new or edited product
  const handleSave = async (formData) => {
    setSaving(true);
    setError("");

    try {
      const payload = toApiItem(formData);

      if (editingProduct) {
        await updateItem(editingProduct.id, {
          ...payload,
          quantity: Number(
            formData.quantity ??
              editingProduct.quantity ??
              0
          ),
        });
      } else {
        await createItem({
          ...payload,
          quantity: Number(formData.incomingQuantity ?? 0),
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

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setError("");
  };

  // Update product
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

  // Delete product
  const handleDelete = async (productId) => {
    setError("");

    try {
      await deleteItem(productId);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product");
    }
  };

  // Cancel product form
  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setError("");
  };

  // Purchase Order submit
  const handlePurchaseOrderSubmit = (orderData) => {
    setPurchaseOrders((previousOrders) => [
      ...previousOrders,
      {
        id: Date.now(),
        poNumber: orderData.poNumber,
        supplier: orderData.supplier,
        poDate: orderData.poDate,
        product: orderData.product,
        quantity: orderData.quantity,
        amount: orderData.totalPurchaseOrder,
        currency: orderData.currency,
        status: "Pending",
      },
    ]);

    setShowPurchaseOrder(false);
  };

  // Open purchase workflow component
  const handleOpenPurchaseWorkflow = () => {
    setShowPurchaseWorkflow(true);
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

  // Purchase Order record count
  const purchaseOrderCount = purchaseOrders.length;
  const purchaseOrderStart = purchaseOrderCount === 0 ? 0 : 1;
  const purchaseOrderEnd = purchaseOrderCount;

  return (
    <div className="products-page">

      {/* TABS */}
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
              setShowPurchaseWorkflow(false);
              setShowPurchaseOrder(false);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="product-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={loadProducts}>
            Retry
          </button>
        </div>
      )}

      {/* ALL PRODUCTS */}
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
                onView={(product) => setSelectedProduct(product)}
                itemsPerPage={15}
                type="stock"
              />
            )}
          </div>
        </>
      )}

      {/* CATEGORIES / STOCK / SUPPLIERS */}
      {activeTab !== "All Products" &&
        activeTab !== "Purchase" && (
          <div className="product-tab-content">
            <ProductManagement activeTab={activeTab} />
          </div>
        )}

      {/* PURCHASE ORDERS */}
      {activeTab === "Purchase" && (
        <div className="product-tab-content">
          <div className="all-products-section">
            <div className="products-table-heading">
              <h2>Purchase Orders</h2>

              <Button
                className="add-button"
                onClick={handleOpenPurchaseWorkflow}
              >
                <Plus size={18} />
                Purchase Order
              </Button>
            </div>

            <div className="purchase-table-wrapper">
              <table className="purchase-orders-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Order Date</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="no-purchase-orders"
                      >
                        No purchase orders found
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.poNumber}</td>
                        <td>{order.supplier}</td>
                        <td>{order.poDate}</td>
                        <td>{order.product}</td>
                        <td>{order.quantity}</td>
                        <td>
                          {order.currency}{" "}
                          {Number(order.amount).toFixed(2)}
                        </td>
                        <td>{order.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="purchase-table-footer">
              <span>
                Showing {purchaseOrderStart} - {purchaseOrderEnd} of{" "}
                {purchaseOrderCount} records
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT FORM */}
      <Modal isOpen={showForm} onClose={handleCancel}>
        <div className="product-form-heading">
          <h2>
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          initialData={editingProduct}
          categories={categories}
          warehouses={warehouses}
          warehouseZones={warehouseZones}
          vendors={vendors}
          units={units}
          statuses={statuses}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={saving}
        />
      </Modal>

      {/* PRODUCT DETAILS MODAL */}
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* PURCHASE WORKFLOW COMPONENT */}
      {showPurchaseWorkflow && (
        <PurchaseWorkflow
          onClose={() => setShowPurchaseWorkflow(false)}
          onDirectPurchase={() => setShowPurchaseOrder(true)}
          onQuotationNext={() =>
            navigate("/billing", {
              state: { openQuotationModal: true },
            })
          }
        />
      )}

      {/* EXISTING PURCHASE ORDER FORM */}
      {showPurchaseOrder && (
        <PurchaseOrder
          onClose={() => setShowPurchaseOrder(false)}
          onSubmit={handlePurchaseOrderSubmit}
        />
      )}

    </div>
  );
}

export default Products;

