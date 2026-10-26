
import { useState } from "react";
import "../styles/Billing.css";

import Quotation from "../component/Quotation";
import LOI from "./LOI.jsx";
import PurchaseReceipt from "./PurchaseReceipt.jsx";

function BillingTabs() {
  const [activeTab, setActiveTab] = useState("Quotations");

  const tabs = [
    "Quotations",
    "LOI",
    "Invoice",
    "Payment",
    "Credit Notes",
    "Purchase Receipt",
    "Refunds",
  ];

  return (
    <div className="billing-page">
      <div className="billing-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`billing-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="billing-tab-content">
        {activeTab === "Quotations" ? (
          <Quotation />
        ) : activeTab === "LOI" ? (
          <LOI />
        ) : activeTab === "Purchase Receipt" ? (
          <PurchaseReceipt />
        ) : (
          <div className="billing-placeholder">
            <h2>{activeTab}</h2>
            <p>{activeTab} content will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingTabs;

