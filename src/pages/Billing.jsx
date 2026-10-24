import { useState } from "react";
import "../styles/Billing.css";

function BillingTabs() {
  const [activeTab, setActiveTab] = useState("All Invoices");

  const tabs = [
    "All Invoices",
    "Payments",
    "Quotations",
    "Credit Notes",
    "Refunds",
  ];

  return (
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
  );
}

export default BillingTabs;