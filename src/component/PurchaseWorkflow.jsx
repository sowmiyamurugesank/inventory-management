import { useState } from "react";
import { X } from "lucide-react";
import "../styles/Product.css";

function PurchaseWorkflow({
onClose,
onDirectPurchase,
onQuotationNext,
}) {
const [purchaseMethod, setPurchaseMethod] = useState("direct");
const [vendorStatus, setVendorStatus] = useState("existing");
const [productStatus, setProductStatus] = useState("regular");
const [specialApproval, setSpecialApproval] = useState("no");

const handleNext = () => {
// Quotation → LOI → Purchase Order flow
if (purchaseMethod === "quotation") {
onClose?.();
onQuotationNext?.();
return;
}


// Direct Purchase: only the exact combination is allowed
const isValidDirectPurchase =
  purchaseMethod === "direct" &&
  vendorStatus === "existing" &&
  productStatus === "regular" &&
  specialApproval === "no";

if (isValidDirectPurchase) {
  onClose?.();
  onDirectPurchase?.();
}

};

return ( <div className="purchase-workflow-overlay"> <div
     className="purchase-workflow-popup"
     role="dialog"
     aria-modal="true"
     aria-labelledby="purchase-workflow-title"
   >
{/* HEADER */} <div className="purchase-workflow-header"> <h2 id="purchase-workflow-title">Purchase Order</h2>

      <button
        type="button"
        className="purchase-workflow-close"
        onClick={onClose}
        aria-label="Close purchase workflow"
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
            checked={purchaseMethod === "direct"}
            onChange={() => setPurchaseMethod("direct")}
          />

          <div>
            <strong>Direct Purchase Order</strong>
            <p>
              Create a purchase order directly from the
              selected vendor.
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
            checked={purchaseMethod === "quotation"}
            onChange={() => setPurchaseMethod("quotation")}
          />

          <div>
            <strong>
              Quotation → LOI → Purchase Order
            </strong>
            <p>
              Follow the quotation and LOI process before
              creating the PO.
            </p>
          </div>
        </label>
      </div>

      {/* VENDOR + PRODUCT OPTIONS */}
      <h3 className="purchase-selection-title">
        Select vendor and products
      </h3>

      {/* VENDOR STATUS */}
      <div className="purchase-workflow-section">
        <h4>Vendor status</h4>

        <label className="purchase-radio-row">
          <input
            type="radio"
            name="vendorStatus"
            value="existing"
            checked={vendorStatus === "existing"}
            onChange={() => setVendorStatus("existing")}
          />

          <span>Existing, approved vendor</span>
        </label>

        <label className="purchase-radio-row">
          <input
            type="radio"
            name="vendorStatus"
            value="new"
            checked={vendorStatus === "new"}
            onChange={() => setVendorStatus("new")}
          />

          <span>New vendor / not yet approved</span>
        </label>
      </div>

      {/* PRODUCT STATUS */}
      <div className="purchase-workflow-section">
        <h4>Product status</h4>

        <label className="purchase-radio-row">
          <input
            type="radio"
            name="productStatus"
            value="regular"
            checked={productStatus === "regular"}
            onChange={() => setProductStatus("regular")}
          />

          <span>Regularly purchased product</span>
        </label>

        <label className="purchase-radio-row">
          <input
            type="radio"
            name="productStatus"
            value="new"
            checked={productStatus === "new"}
            onChange={() => setProductStatus("new")}
          />

          <span>New product / first-time purchase</span>
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
            checked={specialApproval === "no"}
            onChange={() => setSpecialApproval("no")}
          />

          <span>No</span>
        </label>

        <label className="purchase-radio-row">
          <input
            type="radio"
            name="specialApproval"
            value="yes"
            checked={specialApproval === "yes"}
            onChange={() => setSpecialApproval("yes")}
          />

          <span>Yes</span>
        </label>
      </div>

      {/* NEXT */}
      <div className="purchase-workflow-actions">
        <button
          type="button"
          className="purchase-workflow-next"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  </div>
</div>


);
}

export default PurchaseWorkflow;
