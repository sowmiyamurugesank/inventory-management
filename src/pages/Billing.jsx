
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Billing.css";
import Invoice from "./Invoice.jsx";
import Quotation from "../component/Quotation";
import LOI from "./LOI.jsx";
import PurchaseReceipt from "./PurchaseReceipt.jsx";
import ReturnPolicy from "./Returnpolicy.jsx";
import PurchaseReturn from "./PurchaseReturn.jsx";

function BillingTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Quotations");
  const [openQuotationModal, setOpenQuotationModal] = useState(false);
  const [editingPolicyReceipt, setEditingPolicyReceipt] = useState(null);

  const tabs = [
    "Quotations",
    "LOI",
    "Invoice",
    "Payment",
    "Credit Notes",
    "Purchase Receipt",
    "Return Policy",
    "Return"
  ];

  useEffect(() => {
    if (location.state?.openQuotationModal) {
      setActiveTab("Quotations");
      setOpenQuotationModal(true);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, location.pathname, navigate]);

  const handleEditReturnPolicy = (policy) => {
    setEditingPolicyReceipt(policy);
    setActiveTab("Purchase Receipt");
  };

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
          <Quotation openModalOnLoad={openQuotationModal} />
        ) : activeTab === "LOI" ? (
          <LOI />
        ) : activeTab === "Invoice" ? (
          <Invoice />
        ) : activeTab === "Purchase Receipt" ? (
          <PurchaseReceipt
            policyToEdit={editingPolicyReceipt}
            onPolicyEditHandled={() => setEditingPolicyReceipt(null)}
          />
        ) : activeTab === "Return Policy" ? (
          <ReturnPolicy onEditPolicy={handleEditReturnPolicy} />
        ) : activeTab === "Return" ? (
          <PurchaseReturn />
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
