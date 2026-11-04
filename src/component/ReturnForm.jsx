
import { useMemo, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import "../styles/ReturnForm.css";

export default function ReturnForm({
  item = {},
  onClose = () => {},
  onSave = () => {},
}) {
  const maxQty = Math.max(
    0,
    Number(item.available ?? item.quantity ?? 5)
  );

  const unitPrice = Math.max(
    0,
    Number(item.unitPrice ?? item.unitCost ?? item.price ?? 0)
  );

  const [returnQty, setReturnQty] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0.00");
  const [taxRate, setTaxRate] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState("0.00");
  const [settlementMethod, setSettlementMethod] = useState("CREDIT_NOTE");
  const [invoiceOutstanding, setInvoiceOutstanding] = useState("40000.00");
  const [returnReason, setReturnReason] = useState("Damaged goods");
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => (Number(returnQty) || 0) * unitPrice,
    [returnQty, unitPrice]
  );

  const discount = Math.max(0, Number(discountAmount) || 0);
  const taxPercentage = Math.max(0, Number(taxRate) || 0);
  const calculatedTax = Math.max(
    0,
    ((subtotal - discount) * taxPercentage) / 100
  );
  const tax = taxAmount === "" ? calculatedTax : Math.max(0, Number(taxAmount) || 0);
  const charges = Math.max(0, Number(additionalCharges) || 0);

  const total = Math.max(0, subtotal - discount + tax + charges);

  const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handleSave = (event) => {
    event.preventDefault();
    setError("");

    const qty = Number(returnQty);

    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a valid return quantity.");
      return;
    }

    if (qty > maxQty) {
      setError(`Return quantity cannot exceed ${maxQty} units.`);
      return;
    }

    if (discount > subtotal) {
      setError("Discount amount cannot exceed the return subtotal.");
      return;
    }

    if (taxPercentage > 100) {
      setError("Tax rate cannot exceed 100%.");
      return;
    }

    if (
      Number(taxAmount) < 0 ||
      charges < 0 ||
      Number(invoiceOutstanding) < 0
    ) {
      setError("Amounts cannot be negative.");
      return;
    }

    onSave({
      itemId: item.id ?? item.inventoryId ?? null,
      inventoryCode: item.inventoryCode ?? "",
      itemName: item.itemName ?? item.productName ?? "",
      warehouse: item.warehouse ?? "",
      zone: item.zone ?? "",
      returnQty: qty,
      unitPrice,
      subtotal,
      discountAmount: discount,
      taxRate: taxPercentage,
      taxAmount: tax,
      additionalCharges: charges,
      totalReturnAmount: total,
      returnReason,
      settlementMethod,
      invoiceOutstanding: Number(invoiceOutstanding) || 0,
      status: "PENDING_APPROVAL",
      returnDate: new Date().toISOString(),
    });
  };

  return (
    <div className="return-form-page">
      <form className="return-document" onSubmit={handleSave}>
        <div className="return-document-header">
          <div>
            <span className="return-eyebrow">WAREHOUSE INVENTORY</span>
            <h2>Purchase Return</h2>
            <p>Review return details and financial settlement.</p>
          </div>

          <button
            type="button"
            className="return-icon-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <div className="return-item-banner">
          <div>
            <span>Inventory Code</span>
            <strong>{item.inventoryCode || "Not assigned"}</strong>
          </div>
          <div>
            <span>Item Name</span>
            <strong>{item.itemName || item.productName || "Selected item"}</strong>
          </div>
          <div>
            <span>Warehouse</span>
            <strong>{item.warehouse || "Not specified"}</strong>
          </div>
        </div>

        <section className="return-document-section">
          <h3>B. Return Details</h3>
          <p className="return-section-help">
            These are the details that users need to enter or confirm.
          </p>

          <div className="return-fields">
            <label className="return-field return-field-full">
              <span>Return Quantity *</span>
              <input
                type="number"
                min="1"
                max={maxQty}
                step="1"
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                placeholder={`Enter quantity (maximum ${maxQty} Nos.)`}
                required
              />
            </label>

            <label className="return-field">
              <span>Discount Amount *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                required
              />
            </label>

            <label className="return-field">
              <span>Tax Rate (%) *</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => {
                  setTaxRate(e.target.value);
                  setTaxAmount("");
                }}
                placeholder="Enter tax rate"
                required
              />
            </label>

            <label className="return-field">
              <span>Tax Amount *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="Enter tax amount"
                required
              />
              <small>Calculated tax: {currency(calculatedTax)}</small>
            </label>

            <label className="return-field">
              <span>Additional Charges *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="return-document-section">
          <h3>
            C. Return Policy Evaluation
            <span className="return-auto-label">Automatic</span>
          </h3>

          <div className="return-evaluation">
            <div className="return-data-row">
              <span>Matching policy</span>
              <strong>POL-001</strong>
            </div>

            <div className="return-data-row">
              <span>Return eligibility</span>
              <strong className="return-status-eligible">ELIGIBLE*</strong>
            </div>

            <div className="return-data-row">
              <span>Return reason</span>
              <strong>{returnReason}</strong>
            </div>
          </div>

          <p className="return-policy-note">
            <Info size={15} />
            The procedure checks the policy, effective dates, return window,
            damaged goods permissions, maximum quantity, and approved
            conditions. The example policy values must be verified against
            your actual business rules.
          </p>

          <label className="return-field">
            <span>Return Reason *</span>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              required
            >
              <option>Damaged goods</option>
              <option>Wrong item</option>
              <option>Excess quantity</option>
              <option>Quality issue</option>
              <option>Other</option>
            </select>
          </label>
        </section>

        <section className="return-document-section">
          <h3>
            D. Financial Settlement
            <span className="return-auto-label">Automatically determined</span>
          </h3>

          <div className="return-evaluation">
            <div className="return-data-row">
              <span>Invoice outstanding</span>
              <strong>{currency(Number(invoiceOutstanding) || 0)}</strong>
            </div>

            <div className="return-data-row">
              <span>Settlement method</span>
              <strong className="return-method-label">
                {settlementMethod.replace("_", " ")}
              </strong>
            </div>
          </div>

          <label className="return-field">
            <span>Invoice Outstanding (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoiceOutstanding}
              onChange={(e) => setInvoiceOutstanding(e.target.value)}
            />
          </label>

          <label className="return-field">
            <span>Settlement Method *</span>
            <select
              value={settlementMethod}
              onChange={(e) => setSettlementMethod(e.target.value)}
              required
            >
              <option value="CREDIT_NOTE">Credit Note</option>
              <option value="REFUND">Refund</option>
              <option value="ADJUSTMENT">Invoice Adjustment</option>
            </select>
          </label>

          <p className="return-section-help">
            The final settlement method should be verified against the
            outstanding invoice balance and your accounting rules.
          </p>
        </section>

        <section className="return-document-section">
          <h3>E. Credit Note Details</h3>

          <div className="return-warning">
            Required when issuing a credit note for an outstanding balance.
          </div>

          <div className="return-fields">
            <label className="return-field">
              <span>Credit Note Code *</span>
              <input value="Auto-generated" readOnly />
            </label>

            <label className="return-field">
              <span>Credit Note Number *</span>
              <input value="Generated / assigned" readOnly />
            </label>

            <label className="return-field">
              <span>Credit Note Item Code *</span>
              <input value="Auto-generated" readOnly />
            </label>
          </div>

          <p className="return-section-help">
            The procedure creates the credit note and credit note item
            automatically. Their unique codes and numbers must be assigned
            by your backend.
          </p>
        </section>

        <section className="return-document-section">
          <h3>F. Return Summary</h3>

          <div className="return-summary-grid">
            <div>
              <span>Return Subtotal</span>
              <strong>{currency(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{currency(discount)}</strong>
            </div>

            <div>
              <span>Tax</span>
              <strong>{currency(tax)}</strong>
            </div>

            <div>
              <span>Additional Charges</span>
              <strong>{currency(charges)}</strong>
            </div>
          </div>

          <div className="return-summary-total">
            <span>Total Return Amount</span>
            <strong>{currency(total)}</strong>
            <small>Quantity × unit cost − discount + tax + additional charges</small>
          </div>
        </section>

        <section className="return-document-section">
          <h3>G. Generated Records</h3>
          <p className="return-section-help">
            The backend generates these identifiers. The user does not need
            to enter them manually.
          </p>

          <ul className="return-generated-list">
            <li><CheckCircle2 size={17} /> Purchase Return Code and Number</li>
            <li><CheckCircle2 size={17} /> Purchase Return Item Code</li>
            <li><CheckCircle2 size={17} /> Credit Note Code and Item Code (when applicable)</li>
            <li><CheckCircle2 size={17} /> Settlement Code and Number</li>
          </ul>

          <div className="return-created-status">
            <span>Created return status</span>
            <strong>PENDING_APPROVAL</strong>
            <small>
              Settlement status may be REFUND_PENDING or CREDIT_NOTE_PENDING,
              depending on the chosen settlement method.
            </small>
          </div>

          <p className="return-disclaimer">
            Visual form example only. The values and identifiers are not
            confirmed by your database until backend validation and saving
            are implemented.
          </p>
        </section>

        {error && (
          <div className="return-error-message" role="alert">
            {error}
          </div>
        )}

        <footer className="return-form-actions">
          <button type="button" className="return-cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="return-submit-button">
            Save Return
          </button>
        </footer>
      </form>
    </div>
  );
}
