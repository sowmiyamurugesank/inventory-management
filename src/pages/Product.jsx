import { useEffect, useState } from "react";

import {
  Package,
  AlertTriangle,
  PackageX,
  IndianRupee,
  Plus,
  X,
} from "lucide-react";

import ProductManagement from "../component/ProductManagement";
import StatCard from "../StatCard";
import Table from "../component/Table";
import ProductForm from "../component/Productform";
import Button from "../component/Button";
import Modal from "../component/Modal1";
import PurchaseOrder from "../component/PurchaseOrder";

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
    itemAttributes: item.itemAttributes ?? [],
    customAttributes: item.custom_attributes ?? [],
  };
}

function toApiItem(formData) {
  const customAttributes = {};

  if (formData.customAttributes && !Array.isArray(formData.customAttributes)) {
    Object.assign(customAttributes, formData.customAttributes);
  }

  const attributes = [
    ...(Array.isArray(formData.itemAttributes) ? formData.itemAttributes : []),
    ...(Array.isArray(formData.customAttributes) ? formData.customAttributes : []),
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
    manufacturer_part_number:
      formData.manufacturerPartNumber ?? "",
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
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseZones, setWarehouseZones] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [units, setUnits] = useState(["PCS", "KG", "LITRE", "BOX"]);
  const [statuses] = useState(["PENDING", "RECEIVED", "CANCELLED"]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Existing Purchase Order form
  const [showPurchaseOrder, setShowPurchaseOrder] =
    useState(false);

  // Purchase Order workflow popup
  const [showPurchaseWorkflow, setShowPurchaseWorkflow] =
    useState(false);

  // Workflow selections
  const [purchaseMethod, setPurchaseMethod] =
    useState("direct");

  const [vendorStatus, setVendorStatus] =
    useState("existing");

  const [productStatus, setProductStatus] =
    useState("regular");

  const [specialApproval, setSpecialApproval] =
    useState("no");

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
      key: "brandName",
      label: "Brand",
      editable: true,
    },
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
    {
      key: "status",
      label: "Status",
    },
  ];

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
        throw new Error(
          "Unexpected item list response from server"
        );
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setError("");
  };

  const handleUpdate = async (updatedProduct) => {
    setError("");

    try {
      const payload = toApiItem(updatedProduct);

      payload.quantity = Number(
        updatedProduct.quantity ?? 0
      );

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

  // Open workflow with default selections
  const handleOpenPurchaseWorkflow = () => {
    setPurchaseMethod("direct");
    setVendorStatus("existing");
    setProductStatus("regular");
    setSpecialApproval("no");

    setShowPurchaseWorkflow(true);
  };

  // Workflow Next
  const handlePurchaseWorkflowNext = () => {
    const isValidDirectPurchase =
      purchaseMethod === "direct" &&
      vendorStatus === "existing" &&
      productStatus === "regular" &&
      specialApproval === "no";

    // Only this exact combination should work
    if (isValidDirectPurchase) {
      setShowPurchaseWorkflow(false);
      setShowPurchaseOrder(true);
    }
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

  // Purchase Orders record count
  const purchaseOrderCount = purchaseOrders.length;

  const purchaseOrderStart =
    purchaseOrderCount === 0 ? 0 : 1;

  const purchaseOrderEnd = purchaseOrderCount;

  return (
    <div className="products-page">
      {/* PAGE HEADING */}

      <div className="products-heading">
        <Package className="products-heading-icon" />

        <div>
          <h1>Products</h1>

          <p>
            Manage your products, categories, stock and suppliers.
          </p>
        </div>
      </div>

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
              if (tab === "Purchase") {
                setActiveTab("Purchase");

                setShowPurchaseWorkflow(false);
                setShowPurchaseOrder(false);

                return;
              }

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

          <button
            type="button"
            onClick={loadProducts}
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================
          ALL PRODUCTS
      ========================= */}

      {activeTab === "All Products" && (
        <>
          <div className="product-cards">
            <StatCard
              title="Total Products"
              value={totalProducts}
              icon={
                <Package className="stat-icon-image" />
              }
            />

            <StatCard
              title="Low Stock"
              value={lowStock}
              icon={
                <AlertTriangle className="stat-icon-image" />
              }
            />

            <StatCard
              title="Out of Stock"
              value={outOfStock}
              icon={
                <PackageX className="stat-icon-image" />
              }
            />

            <StatCard
              title="Total Value"
              value={`₹ ${totalValue.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
              icon={
                <IndianRupee className="stat-icon-image" />
              }
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

      {/* =========================
          CATEGORIES / STOCK /
          SUPPLIERS
      ========================= */}

      {activeTab !== "All Products" &&
        activeTab !== "Purchase" && (
          <div className="product-tab-content">
            <ProductManagement
              activeTab={activeTab}
            />
          </div>
        )}

      {/* =========================
          PURCHASE ORDERS
      ========================= */}

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
                Showing {purchaseOrderStart} -{" "}
                {purchaseOrderEnd} of{" "}
                {purchaseOrderCount} records
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PRODUCT FORM
      ========================= */}
  <Modal isOpen={showForm} onClose={handleCancel}>
    <div className="product-form-heading">
      <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
      <p>
        {editingProduct
          ? "Update the existing product details as needed."
          : "Enter the product details to add a new product to the inventory."}
      </p>
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
   

      {/* =========================
          PURCHASE WORKFLOW POPUP
      ========================= */}

      {showPurchaseWorkflow && (
        <div className="purchase-workflow-overlay">
          <div className="purchase-workflow-popup">

            {/* HEADER */}

            <div className="purchase-workflow-header">
              <h2>Purchase Order</h2>

              <button
                type="button"
                className="purchase-workflow-close"
                onClick={() =>
                  setShowPurchaseWorkflow(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="purchase-workflow-content">

              {/* PURCHASE METHOD */}

              <h3>Choose the purchasing method</h3>

              <div className="purchase-method-options">

                <label
                  className={
                    purchaseMethod === "direct"
                      ? "purchase-method-card selected"
                      : "purchase-method-card"
                  }
                >
                  <input
                    type="radio"
                    name="purchaseMethod"
                    value="direct"
                    checked={
                      purchaseMethod === "direct"
                    }
                    onChange={() =>
                      setPurchaseMethod("direct")
                    }
                  />

                  <div>
                    <strong>
                      Direct Purchase Order
                    </strong>

                    <p>
                      Create a purchase order directly
                      from the selected vendor.
                    </p>
                  </div>
                </label>

                <label
                  className={
                    purchaseMethod === "quotation"
                      ? "purchase-method-card selected"
                      : "purchase-method-card"
                  }
                >
                  <input
                    type="radio"
                    name="purchaseMethod"
                    value="quotation"
                    checked={
                      purchaseMethod === "quotation"
                    }
                    onChange={() =>
                      setPurchaseMethod("quotation")
                    }
                  />

                  <div>
                    <strong>
                      Quotation → LOI → Purchase Order
                    </strong>

                    <p>
                      Follow the quotation and LOI
                      process before creating the PO.
                    </p>
                  </div>
                </label>

              </div>

              {/* VENDOR + PRODUCT */}

              <h3 className="purchase-selection-title">
                Select vendor and products
              </h3>

              {/* VENDOR */}

              <div className="purchase-workflow-section">
                <h4>Vendor status</h4>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="vendorStatus"
                    value="existing"
                    checked={
                      vendorStatus === "existing"
                    }
                    onChange={() =>
                      setVendorStatus("existing")
                    }
                  />

                  <span>
                    Existing, approved vendor
                  </span>
                </label>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="vendorStatus"
                    value="new"
                    checked={
                      vendorStatus === "new"
                    }
                    onChange={() =>
                      setVendorStatus("new")
                    }
                  />

                  <span>
                    New vendor / not yet approved
                  </span>
                </label>
              </div>

              {/* PRODUCT */}

              <div className="purchase-workflow-section">
                <h4>Product status</h4>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="productStatus"
                    value="regular"
                    checked={
                      productStatus === "regular"
                    }
                    onChange={() =>
                      setProductStatus("regular")
                    }
                  />

                  <span>
                    Regularly purchased product
                  </span>
                </label>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="productStatus"
                    value="new"
                    checked={
                      productStatus === "new"
                    }
                    onChange={() =>
                      setProductStatus("new")
                    }
                  />

                  <span>
                    New product / first-time purchase
                  </span>
                </label>
              </div>

              {/* SPECIAL APPROVAL */}

              <div className="purchase-workflow-section">
                <h4>Special approval</h4>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="specialApproval"
                    value="no"
                    checked={
                      specialApproval === "no"
                    }
                    onChange={() =>
                      setSpecialApproval("no")
                    }
                  />

                  <span>No</span>
                </label>

                <label className="purchase-radio-row">
                  <input
                    type="radio"
                    name="specialApproval"
                    value="yes"
                    checked={
                      specialApproval === "yes"
                    }
                    onChange={() =>
                      setSpecialApproval("yes")
                    }
                  />

                  <span>Yes</span>
                </label>
              </div>

              {/* NEXT */}

              <div className="purchase-workflow-actions">
                <button
                  type="button"
                  className="purchase-workflow-next"
                  onClick={
                    handlePurchaseWorkflowNext
                  }
                >
                  Next
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================
          EXISTING PURCHASE ORDER
      ========================= */}

      {showPurchaseOrder && (
        <PurchaseOrder
          onClose={() =>
            setShowPurchaseOrder(false)
          }
          onSubmit={handlePurchaseOrderSubmit}
        />
      )}
    </div>
  );
}

export default Products;