import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Billing.css";
import Invoice from "./Invoice.jsx";
import Quotation from "../component/Quotation";
import LOI from "./LOI.jsx";
import PurchaseReceipt from "./PurchaseReceipt.jsx";

function BillingTabs() {
const location = useLocation();
const navigate = useNavigate();

const [activeTab, setActiveTab] = useState("Quotations");
const [openQuotationModal, setOpenQuotationModal] = useState(false);

const tabs = [
"Quotations",
"LOI",
"Invoice",
"Payment",
"Credit Notes",
"Purchase Receipt",
"Refunds",
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

return ( <div className="billing-page"> <div className="billing-tabs">
{tabs.map((tab) => (
<button
key={tab}
type="button"
className={`billing-tab ${
              activeTab === tab ? "active" : ""
            }`}
onClick={() => setActiveTab(tab)}
>
{tab} </button>
))} </div>


  <div className="billing-tab-content">
    {activeTab === "Quotations" ? (
      <Quotation openModalOnLoad={openQuotationModal} />
    ) : activeTab === "LOI" ? (
      <LOI />
    ) : activeTab === "Invoice" ? ( <Invoice />
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
