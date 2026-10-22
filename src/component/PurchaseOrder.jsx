import { useState } from "react";
import "../styles/PurchaseOrder.css";
import Toast from "./Toast";

function PurchaseOrder({ onClose, onSubmit }) {
  // Active tab
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

  // Product and purchase order states
  const [product, setProduct] = useState("");
  const [supplier, setSupplier] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");

  // UI states
  const [showToast, setShowToast] = useState(false);
  const [showError, setShowError] = useState(false);

  // Calculations
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

  // Navigate to a tab
  const goToStep = (step) => {
    setActiveStep(step);
    setShowError(false);
  };

  // Previous button
  const handlePrevious = () => {
    if (activeStep > 0) {
      goToStep(activeStep - 1);
    }
  };

  // Next button
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      goToStep(activeStep + 1);
    }
  };

  // Submit purchase order
  const handleSubmit = () => {
    if (
      !product.trim() ||
      !poNumber.trim() ||
      !poDate ||
      !orderQuantity ||
      Number(orderQuantity) <= 0 ||
      !quantityUnit ||
      !unitPurchasePrice ||
      Number(unitPurchasePrice) < 0
    ) {
      setShowError(true);
      return;
    }

    setShowError(false);

    if (onSubmit) {
      onSubmit({
        poNumber,
        supplier: supplier || "Not Selected",
        poDate,
        product,
        quantity: orderQuantity,
        currency,
        totalPurchaseOrder,
      });
    }

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

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

              <input
                type="text"
                placeholder="Enter product name"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
              />
            </div>

            <div className="purchase-order-field">
              <label>SKU / Item Code</label>

              <input
                type="text"
                placeholder="Enter SKU or item code"
              />
            </div>

            <div className="purchase-order-field">
              <label>Available Stock</label>

              <input
                type="number"
                min="0"
                placeholder="Enter available stock"
              />
            </div>

            <div className="purchase-order-field">
              <label>Reorder Level</label>

              <input
                type="number"
                min="0"
                placeholder="Enter reorder level"
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
              <label>Vendor / Supplier</label>

              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              >
                <option value="">Select Supplier</option>
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

              <input type="date" />
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

                <input
                  type="text"
                  placeholder="Enter selected product"
                  value={product}
                  onChange={(e) =>
                    setProduct(
                      e.target.value.replace(/[^a-zA-Z\s]/g, "")
                    )
                  }
                />
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
                  step="0.01"
                  placeholder="Enter tax rate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <div className="purchase-order-field">
                <label>Expiry Date</label>

                <input type="date" />
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
              />
            </div>

            <div className="purchase-order-field">
              <label>Payment Terms</label>

              <select defaultValue="">
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
            />
          </div>

          {showError && (
            <p className="purchase-order-error">
              Please fill in all required fields before submitting.
              Check Product, PO Number, PO Date, Order Quantity,
              Quantity Unit and Unit Purchase Price.
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
      >
        Submit Purchase Order
      </button>
    )}
  </div>
</div>
        
      </div>
    </div>
  );
}

export default PurchaseOrder;