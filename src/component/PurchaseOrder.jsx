import { useState } from "react";
import "../styles/PurchaseOrder.css";
import Toast from "./Toast";

function PurchaseOrder({ onClose }) {

    const [orderQuantity, setOrderQuantity] = useState("1");
    const [unitPurchasePrice, setUnitPurchasePrice] = useState("");
    const [lineDiscount, setLineDiscount] = useState("0");
    const [taxRate, setTaxRate] = useState("0");
    const [additionalCharges, setAdditionalCharges] = useState("0");
    const [currency, setCurrency] = useState("INR");
    const [showToast, setShowToast] = useState(false);

    // Required field states
    const [product, setProduct] = useState("");
    const [supplier, setSupplier] = useState("");
    const [poNumber, setPoNumber] = useState("");
    const [poDate, setPoDate] = useState("");
    const [quantityUnit, setQuantityUnit] = useState("");
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
                        className="purchase-order-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>


                {/* Stock Replenishment Request */}
                <div className="purchase-order-section">

                    <h3>Stock Replenishment Request</h3>

                    <div className="purchase-order-grid">

                        <div className="purchase-order-field">
                            <label>
                                Product <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={product}
                                placeholder="Enter Product"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^A-Za-z\s]/g,
                                            ""
                                        );

                                    setProduct(value);
                                }}
                            />
                        </div>

                        <div className="purchase-order-field">
                            <label>SKU / Item Code</label>

                            <input
                                type="text"
                                placeholder="Enter SKU / Item Code"
                            />
                        </div>

                        <div className="purchase-order-field">
                            <label>Available Stock</label>

                            <input
                                type="text"
                                placeholder="Available Stock"
                                onChange={(e) => {
                                    e.target.value =
                                        e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );
                                }}
                            />
                        </div>

                        <div className="purchase-order-field">
                            <label>Reorder Level</label>

                            <input
                                type="text"
                                placeholder="Reorder Level"
                                onChange={(e) => {
                                    e.target.value =
                                        e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );
                                }}
                            />
                        </div>

                    </div>

                </div>


                {/* Purchase Order Details */}
                <div className="purchase-order-section">

                    <h3>Purchase Order Details</h3>

                    <div className="purchase-order-grid">

                        <div className="purchase-order-field">
                            <label>
                                Vendor / Supplier <span>*</span>
                            </label>

                            <select
                                value={supplier}
                                onChange={(e) =>
                                    setSupplier(e.target.value)
                                }
                            >
                                <option value="">
                                    Select Supplier
                                </option>
                            </select>
                        </div>

                        <div className="purchase-order-field">
                            <label>
                                PO Number <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={poNumber}
                                placeholder="Enter PO Number"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );

                                    setPoNumber(value);
                                }}
                            />
                        </div>

                        <div className="purchase-order-field">
                            <label>Currency</label>

                            <select
                                value={currency}
                                onChange={(e) =>
                                    setCurrency(e.target.value)
                                }
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>

                        <div className="purchase-order-field">
                            <label>
                                PO Date <span>*</span>
                            </label>

                            <input
                                type="date"
                                value={poDate}
                                onChange={(e) =>
                                    setPoDate(e.target.value)
                                }
                            />
                        </div>

                        <div className="purchase-order-field">
                            <label>
                                Expected Delivery Date
                            </label>

                            <input type="date" />
                        </div>

                    </div>

                </div>


                {/* Product & Order Quantity */}
                <div className="purchase-order-section">

                    <h3>Product & Order Quantity</h3>

                    <div className="purchase-order-grid">

                        <div className="purchase-order-field">
                            <label>Selected Product</label>

                            <input
                                type="text"
                                placeholder="Selected Product"
                            />
                        </div>


                        {/* Order Quantity */}
                        <div className="purchase-order-field">
                            <label>
                                Order Quantity <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={orderQuantity}
                                placeholder="Enter quantity"
                                onChange={(e) => {
                                    let value =
                                        e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );

                                    if (
                                        value !== "" &&
                                        Number(value) < 1
                                    ) {
                                        value = "1";
                                    }

                                    setOrderQuantity(value);
                                }}
                            />
                        </div>


                        {/* Quantity Unit */}
                        <div className="purchase-order-field">
                            <label>
                                Quantity Unit <span>*</span>
                            </label>

                            <select
                                value={quantityUnit}
                                onChange={(e) =>
                                    setQuantityUnit(e.target.value)
                                }
                            >
                                <option value="">
                                    Select Unit
                                </option>

                                <option value="units">
                                    Units
                                </option>

                                <option value="pieces">
                                    Pieces
                                </option>

                                <option value="boxes">
                                    Boxes
                                </option>

                                <option value="cartons">
                                    Cartons
                                </option>

                                <option value="kilograms">
                                    Kilograms
                                </option>

                                <option value="litres">
                                    Litres
                                </option>

                                <option value="pallets">
                                    Pallets
                                </option>
                            </select>
                        </div>


                        {/* Unit Purchase Price */}
                        <div className="purchase-order-field purchase-order-full">
                            <label>
                                Unit Purchase Price <span>*</span>
                            </label>

                            <input
                                type="text"
                                value={unitPurchasePrice}
                                placeholder="Enter purchase price"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        );

                                    setUnitPurchasePrice(value);
                                }}
                            />
                        </div>


                        {/* Line Discount */}
                        <div className="purchase-order-field">
                            <label>Line Discount</label>

                            <input
                                type="text"
                                value={lineDiscount}
                                placeholder="Enter discount"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        );

                                    setLineDiscount(value);
                                }}
                            />
                        </div>


                        {/* Tax Rate */}
                        <div className="purchase-order-field">
                            <label>Tax Rate (%)</label>

                            <input
                                type="text"
                                value={taxRate}
                                placeholder="Enter tax rate"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        );

                                    setTaxRate(value);
                                }}
                            />
                        </div>


                        {/* Expiry Date - Last */}
                        <div className="purchase-order-field purchase-order-full">
                            <label>Expiry Date</label>

                            <input type="date" />
                        </div>

                    </div>


                    {/* Line Total */}
                    <div className="purchase-order-line-total">
                        <span>
                            Line total (including tax)
                        </span>

                        <strong>
                            {currency} {lineTotal.toFixed(2)}
                        </strong>
                    </div>

                </div>


                {/* Delivery & Payment */}
                <div className="purchase-order-section">

                    <h3>Delivery & Payment</h3>

                    <div className="purchase-order-grid">

                        <div className="purchase-order-field">
                            <label>Delivery Address</label>

                            <textarea
                                placeholder="Enter delivery address"
                            ></textarea>
                        </div>

                        <div className="purchase-order-field">
                            <label>Payment Terms</label>

                            <select>
                                <option value="">
                                    Select Payment Terms
                                </option>

                                <option value="advance">
                                    Advance Payment
                                </option>

                                <option value="immediate">
                                    Immediate Payment
                                </option>

                                <option value="net-15">
                                    Net 15 Days
                                </option>

                                <option value="net-30">
                                    Net 30 Days
                                </option>

                                <option value="net-45">
                                    Net 45 Days
                                </option>

                                <option value="net-60">
                                    Net 60 Days
                                </option>

                                <option value="as-agreed">
                                    As Agreed with Vendor
                                </option>
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


                {/* Order Summary */}
                <div className="purchase-order-section">

                    <h3>Order Summary</h3>

                    <div className="purchase-order-summary">

                        {/* Subtotal */}
                        <div className="purchase-order-summary-item">
                            <span className="purchase-order-summary-label">
                                Subtotal
                            </span>

                            <span className="purchase-order-summary-value">
                                {currency} {subtotal.toFixed(2)}
                            </span>
                        </div>


                        {/* Discount */}
                        <div className="purchase-order-summary-item">
                            <span className="purchase-order-summary-label">
                                Discount
                            </span>

                            <span className="purchase-order-summary-value">
                                {currency} {discount.toFixed(2)}
                            </span>
                        </div>


                        {/* Tax Amount */}
                        <div className="purchase-order-summary-item">
                            <span className="purchase-order-summary-label">
                                Tax Amount
                            </span>

                            <span className="purchase-order-summary-value">
                                {currency} {taxAmount.toFixed(2)}
                            </span>
                        </div>


                        {/* Additional Charges */}
                        <div className="purchase-order-summary-item">

                            <span className="purchase-order-summary-label">
                                Additional Charges
                            </span>

                            <input
                                type="text"
                                value={additionalCharges}
                                placeholder="0"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        );

                                    setAdditionalCharges(value);
                                }}
                            />

                        </div>

                    </div>


                    {/* Total */}
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


                    {/* Internal Notes */}
                    <div className="purchase-order-field">
                        <label>Internal Notes</label>

                        <textarea
                            placeholder="Enter internal notes"
                        ></textarea>
                    </div>


                    {/* Error Message */}
                    {showError && (
                        <p className="purchase-order-error">
                            Please fill all required fields.
                        </p>
                    )}


                    {/* Submit Button */}
                    <div className="purchase-order-actions">

                        <button
                            type="button"
                            className="submit-purchase-order-btn"
                            onClick={() => {

                                if (
                                    !product ||
                                    !supplier ||
                                    !poNumber ||
                                    !poDate ||
                                    !orderQuantity ||
                                    !quantityUnit ||
                                    !unitPurchasePrice
                                ) {
                                    setShowError(true);
                                    return;
                                }

                                setShowError(false);
                                setShowToast(true);

                                setTimeout(() => {
                                    setShowToast(false);
                                }, 3000);
                            }}
                        >
                            Submit Purchase Order
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PurchaseOrder;