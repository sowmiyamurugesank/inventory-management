import { useEffect, useState } from "react";
import "../styles/PurchaseOrder.css";
import Toast from "./Toast";

const API_BASE_URL = "http://localhost:5000/api";

function PurchaseOrder({ onClose, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Stock Replenishment",
    "PO Details",
    "Order Quantity",
    "Delivery & Payment",
    "Summary",
  ];

  // Order calculation states
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [unitPurchasePrice, setUnitPurchasePrice] = useState("");
  const [lineDiscount, setLineDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [additionalCharges, setAdditionalCharges] = useState("0");
  const [currency, setCurrency] = useState("INR");

  // Product states
  const [product, setProduct] = useState("");
  const [itemId, setItemId] = useState("");

  // Vendor states
  const [supplier, setSupplier] = useState("");
  const [vendorId, setVendorId] = useState("");

  // PO states
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");

  // Backend data
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Additional form states
  const [skuItemCode, setSkuItemCode] = useState("");
  const [availableStock, setAvailableStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // UI states
  const [showToast, setShowToast] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------------------------------------------
  // LOAD PRODUCTS AND VENDORS
  // --------------------------------------------------

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);

        const response = await fetch(`${API_BASE_URL}/items`);
        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(result?.error || "Failed to load products");
        }

        const data =
          result?.data?.items ||
          result?.data ||
          result?.items ||
          [];

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setErrorMessage("Unable to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadVendors = async () => {
      try {
        setLoadingVendors(true);

        const response = await fetch(`${API_BASE_URL}/vendors`);
        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(result?.error || "Failed to load vendors");
        }

        const data =
          result?.data?.vendors ||
          result?.data ||
          result?.vendors ||
          [];

        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load vendors:", error);
        setErrorMessage("Unable to load vendors.");
      } finally {
        setLoadingVendors(false);
      }
    };

    loadProducts();
    loadVendors();
  }, []);

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const quantity = Number(orderQuantity) || 0;
  const price = Number(unitPurchasePrice) || 0;
  const discount = Number(lineDiscount) || 0;
  const tax = Number(taxRate) || 0;
  const charges = Number(additionalCharges) || 0;

  const subtotal = quantity * price;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const taxAmount = taxableAmount * (tax / 100);
  const lineTotal = taxableAmount + taxAmount;
  const totalPurchaseOrder = lineTotal + charges;

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const goToStep = (step) => {
    setActiveStep(step);
    setShowError(false);
    setErrorMessage("");
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      goToStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      goToStep(activeStep + 1);
    }
  };

  // --------------------------------------------------
  // PRODUCT SELECTION
  // --------------------------------------------------

  const getProductId = (item) => {
    return item.id || item.item_id || item.itemId || "";
  };

  const getProductName = (item) => {
    return (
      item.name ||
      item.item_name ||
      item.itemName ||
      ""
    );
  };

  const getProductCode = (item) => {
    return (
      item.code ||
      item.item_code ||
      item.itemCode ||
      ""
    );
  };

  const handleProductChange = (e) => {
    const selectedId = e.target.value;

    setItemId(selectedId);

    const selectedProduct = products.find(
      (item) => String(getProductId(item)) === String(selectedId)
    );

    if (selectedProduct) {
      setProduct(getProductName(selectedProduct));
      setSkuItemCode(getProductCode(selectedProduct));
    } else {
      setProduct("");
      setSkuItemCode("");
    }

    setShowError(false);
    setErrorMessage("");
  };

  // --------------------------------------------------
  // VENDOR SELECTION
  // --------------------------------------------------

  const getVendorId = (vendor) => {
    return vendor.id || vendor.vendor_id || vendor.vendorId || "";
  };

  const getVendorName = (vendor) => {
    return (
      vendor.name ||
      vendor.vendor_name ||
      vendor.vendorName ||
      vendor.company_name ||
      ""
    );
  };

  const handleVendorChange = (e) => {
    const selectedId = e.target.value;

    setVendorId(selectedId);

    const selectedVendor = vendors.find(
      (vendor) => String(getVendorId(vendor)) === String(selectedId)
    );

    setSupplier(
      selectedVendor ? getVendorName(selectedVendor) : ""
    );

    setShowError(false);
    setErrorMessage("");
  };

  // --------------------------------------------------
  // SUBMIT PURCHASE ORDER
  // --------------------------------------------------

  const handleSubmit = async () => {
    setShowError(false);
    setErrorMessage("");

    // Check required fields individually
    const missingFields = [];

    if (!itemId) {
      missingFields.push("Product");
    }

    if (!vendorId) {
      missingFields.push("Vendor");
    }

    if (!poNumber.trim()) {
      missingFields.push("PO Number");
    }

    if (!poDate) {
      missingFields.push("PO Date");
    }

    if (
      orderQuantity === "" ||
      !Number.isFinite(Number(orderQuantity)) ||
      Number(orderQuantity) <= 0
    ) {
      missingFields.push("Order Quantity");
    }

    if (!quantityUnit) {
      missingFields.push("Quantity Unit");
    }

    if (
      unitPurchasePrice === "" ||
      !Number.isFinite(Number(unitPurchasePrice)) ||
      Number(unitPurchasePrice) < 0
    ) {
      missingFields.push("Unit Purchase Price");
    }

    console.log("Purchase Order Form Values:", {
      itemId,
      vendorId,
      poNumber,
      poDate,
      orderQuantity,
      quantityUnit,
      unitPurchasePrice,
      missingFields,
    });

    if (missingFields.length > 0) {
      setShowError(true);
      setErrorMessage(
        `Please fill these required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Validate discount, tax and charges
    if (
      !Number.isFinite(Number(lineDiscount)) ||
      Number(lineDiscount) < 0 ||
      !Number.isFinite(Number(taxRate)) ||
      Number(taxRate) < 0 ||
      Number(taxRate) > 100 ||
      !Number.isFinite(Number(additionalCharges)) ||
      Number(additionalCharges) < 0
    ) {
      setShowError(true);
      setErrorMessage(
        "Please enter valid Discount, Tax Rate (0-100%) and Additional Charges."
      );
      return;
    }

    // Validate expected delivery date
    if (expectedDeliveryDate && expectedDeliveryDate < poDate) {
      setShowError(true);
      setErrorMessage(
        "Expected Delivery Date cannot be before PO Date."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        code: `PO-${Date.now()}`,
        poNumber: poNumber.trim(),

        vendorId: vendorId,
        itemId: itemId,

        quantity: Number(orderQuantity),
        quantityUnit: quantityUnit,
        unitPrice: Number(unitPurchasePrice),

        discountAmount: Number(lineDiscount) || 0,
        taxRate: Number(taxRate) || 0,

        poDate: poDate,
        expectedDeliveryDate: expectedDeliveryDate || null,

        currencyCode: currency,

        deliveryAddress: deliveryAddress.trim() || null,
        paymentTerms: paymentTerms || null,
        deliveryTerms: deliveryTerms.trim() || null,

        additionalCharges: Number(additionalCharges) || 0,

        notes: internalNotes.trim() || null,

        vendorItemCode: skuItemCode.trim() || null,

        customAttributes: {
          availableStock:
            availableStock === "" ? null : Number(availableStock),

          reorderLevel:
            reorderLevel === "" ? null : Number(reorderLevel),

          expiryDate: expiryDate || null,
        },
      };

      console.log("Purchase Order Payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}/purchase-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      console.log("Purchase Order API Response:", result);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.error ||
          result?.message ||
          "Failed to create Purchase Order."
        );
      }

      // Extract created PO
      const responseData = result.data || result;

      const createdPO =
        responseData.purchaseOrder ||
        responseData.purchase_order ||
        responseData;

      const createdPOItem =
        responseData.purchaseOrderItem ||
        responseData.purchase_order_item ||
        null;

      // Send created PO to parent component
      if (onSubmit) {
        await onSubmit({
          ...createdPO,
          purchaseOrderItem: createdPOItem,
        });
      }

      setShowError(false);
      setErrorMessage("");
      setShowToast(true);

      // Close after successful submission
      setTimeout(() => {
        setShowToast(false);

        if (onClose) {
          onClose();
        }
      }, 1000);

    } catch (error) {
      console.error("Purchase Order submission failed:", error);

      setShowError(true);
      setErrorMessage(
        error.message ||
        "Something went wrong while creating the Purchase Order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="purchase-order-overlay">

      {showToast && (
        <Toast message="Purchase Order submitted successfully!" />
      )}

      <div className="purchase-order-modal">

        {/* Header */}

        <div className="purchase-order-header">
          <h2>Purchase Order</h2>

          <button
            type="button"
            className="purchase-order-close"
            onClick={onClose}
            aria-label="Close purchase order"
          >
            ×
          </button>
        </div>

        {/* Tabs */}

        <div className="purchase-order-tabs">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step}
              className={`purchase-order-tab ${
                activeStep === index ? "active" : ""
              }`}
              onClick={() => goToStep(index)}
            >
              {step}
            </button>
          ))}
        </div>

        {/* STEP 1: STOCK REPLENISHMENT */}

        <div
          className="purchase-order-section"
          style={{ display: activeStep === 0 ? "block" : "none" }}
        >
          <h3>Stock Replenishment Request</h3>

          <div className="purchase-order-grid">

            <div className="purchase-order-field">
              <label>
                Product <span>*</span>
              </label>

              <select
                value={itemId}
                onChange={handleProductChange}
                disabled={loadingProducts}
              >
                <option value="">
                  {loadingProducts
                    ? "Loading Products..."
                    : "Select Product"}
                </option>

                {products.map((item) => {
                  const id = getProductId(item);

                  return (
                    <option key={id} value={id}>
                      {getProductName(item) || "Unnamed Product"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="purchase-order-field">
              <label>SKU / Item Code</label>

              <input
                type="text"
                placeholder="Enter SKU or item code"
                value={skuItemCode}
                onChange={(e) => setSkuItemCode(e.target.value)}
              />
            </div>

            <div className="purchase-order-field">
              <label>Available Stock</label>

              <input
                type="number"
                min="0"
                placeholder="Enter available stock"
                value={availableStock}
                onChange={(e) => setAvailableStock(e.target.value)}
              />
            </div>

            <div className="purchase-order-field">
              <label>Reorder Level</label>

              <input
                type="number"
                min="0"
                placeholder="Enter reorder level"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* STEP 2: PURCHASE ORDER DETAILS */}

        <div
          className="purchase-order-section"
          style={{ display: activeStep === 1 ? "block" : "none" }}
        >
          <h3>Purchase Order Details</h3>

          <div className="purchase-order-grid">

            <div className="purchase-order-field">
              <label>
                Vendor / Supplier <span>*</span>
              </label>

              <select
                value={vendorId}
                onChange={handleVendorChange}
                disabled={loadingVendors}
              >
                <option value="">
                  {loadingVendors
                    ? "Loading Suppliers..."
                    : "Select Supplier"}
                </option>

                {vendors.map((vendor) => {
                  const id = getVendorId(vendor);

                  return (
                    <option key={id} value={id}>
                      {getVendorName(vendor) || "Unnamed Supplier"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="purchase-order-field">
              <label>
                PO Number <span>*</span>
              </label>

              <input
                type="text"
                placeholder="Enter PO number"
                value={poNumber}
                onChange={(e) =>
                  setPoNumber(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <div className="purchase-order-field">
              <label>Currency</label>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="purchase-order-field">
              <label>
                PO Date <span>*</span>
              </label>

              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
              />
            </div>

            <div className="purchase-order-field">
              <label>Expected Delivery Date</label>

              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) =>
                  setExpectedDeliveryDate(e.target.value)
                }
              />
            </div>

          </div>
        </div>

        {/* STEP 3: PRODUCT AND ORDER QUANTITY */}

        <div
          className="purchase-order-section"
          style={{ display: activeStep === 2 ? "block" : "none" }}
        >
          <h3>Product &amp; Order Quantity</h3>

          <div className="purchase-order-product-box">

            <div className="purchase-order-product-header">
              <div>
                <div className="purchase-order-product-name">
                  Selected Product
                </div>

                <div className="purchase-order-product-subtitle">
                  Enter the quantity and pricing details below.
                </div>
              </div>

              <span className="purchase-order-item-count">
                1 Item
              </span>
            </div>

            <div className="purchase-order-grid">

              <div className="purchase-order-field">
                <label>
                  Selected Product <span>*</span>
                </label>

                <select
                  value={itemId}
                  onChange={handleProductChange}
                  disabled={loadingProducts}
                >
                  <option value="">Select Product</option>

                  {products.map((item) => {
                    const id = getProductId(item);

                    return (
                      <option key={id} value={id}>
                        {getProductName(item) || "Unnamed Product"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="purchase-order-field">
                <label>
                  Order Quantity <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>

              <div className="purchase-order-field">
                <label>
                  Quantity Unit <span>*</span>
                </label>

                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  <option value="units">Units</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                  <option value="cartons">Cartons</option>
                  <option value="kilograms">Kilograms</option>
                  <option value="litres">Litres</option>
                  <option value="pallets">Pallets</option>
                </select>
              </div>

              <div className="purchase-order-field">
                <label>
                  Unit Purchase Price <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter unit price"
                  value={unitPurchasePrice}
                  onChange={(e) =>
                    setUnitPurchasePrice(e.target.value)
                  }
                />
              </div>

              <div className="purchase-order-field">
                <label>Line Discount</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter discount"
                  value={lineDiscount}
                  onChange={(e) => setLineDiscount(e.target.value)}
                />
              </div>

              <div className="purchase-order-field">
                <label>Tax Rate (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter tax rate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <div className="purchase-order-field">
                <label>Expiry Date</label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

            </div>

            <div className="purchase-order-calculation">
              <span className="purchase-order-calculation-label">
                Line Total
              </span>

              <span className="purchase-order-calculation-value">
                {currency} {lineTotal.toFixed(2)}
              </span>
            </div>

          </div>
        </div>

        {/* STEP 4: DELIVERY AND PAYMENT */}

        <div
          className="purchase-order-section"
          style={{ display: activeStep === 3 ? "block" : "none" }}
        >
          <h3>Delivery &amp; Payment</h3>

          <div className="purchase-order-grid">

            <div className="purchase-order-field purchase-order-full">
              <label>Delivery Address</label>

              <textarea
                placeholder="Enter delivery address"
                rows="4"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            <div className="purchase-order-field">
              <label>Payment Terms</label>

              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="">Select Payment Terms</option>
                <option value="advance">Advance Payment</option>
                <option value="immediate">Immediate Payment</option>
                <option value="net-15">Net 15 Days</option>
                <option value="net-30">Net 30 Days</option>
                <option value="net-45">Net 45 Days</option>
                <option value="net-60">Net 60 Days</option>
                <option value="as-agreed">As Agreed</option>
              </select>
            </div>

            <div className="purchase-order-field">
              <label>Delivery Terms</label>

              <input
                type="text"
                placeholder="Enter delivery terms"
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* STEP 5: ORDER SUMMARY */}

        <div
          className="purchase-order-section"
          style={{ display: activeStep === 4 ? "block" : "none" }}
        >
          <h3>Order Summary</h3>

          <div className="purchase-order-summary">

            <div className="purchase-order-summary-item">
              <span className="purchase-order-summary-label">
                Subtotal
              </span>

              <span className="purchase-order-summary-value">
                {currency} {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="purchase-order-summary-item">
              <span className="purchase-order-summary-label">
                Discount
              </span>

              <span className="purchase-order-summary-value">
                {currency} {discount.toFixed(2)}
              </span>
            </div>

            <div className="purchase-order-summary-item">
              <span className="purchase-order-summary-label">
                Tax Amount
              </span>

              <span className="purchase-order-summary-value">
                {currency} {taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="purchase-order-summary-item">
              <label
                className="purchase-order-summary-label"
                htmlFor="additionalCharges"
              >
                Additional Charges
              </label>

              <input
                id="additionalCharges"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter additional charges"
                value={additionalCharges}
                onChange={(e) =>
                  setAdditionalCharges(e.target.value)
                }
              />
            </div>

          </div>

          <div className="purchase-order-total">
            <div className="purchase-order-total-label">
              Total Purchase Order Amount
            </div>

            <div className="purchase-order-total-value">
              {currency} {totalPurchaseOrder.toFixed(2)}
            </div>

            <div className="purchase-order-total-note">
              Subtotal − discount + tax + additional charges
            </div>
          </div>

          <div className="purchase-order-field internal-notes-field">
            <label>Internal Notes</label>

            <textarea
              placeholder="Enter any additional notes"
              rows="3"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>

          {(showError || errorMessage) && (
            <p className="purchase-order-error">
              {errorMessage ||
                "Please fill in all required fields before submitting."}
            </p>
          )}
        </div>

        {/* PREVIOUS / NEXT / SUBMIT */}

        <div className="purchase-order-step-navigation">

          <div className="purchase-order-navigation-buttons">

            {activeStep > 0 && (
              <button
                type="button"
                className="purchase-order-prev"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                className="purchase-order-next"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="submit-purchase-order-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Purchase Order"}
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default PurchaseOrder;