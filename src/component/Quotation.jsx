import { useState } from "react";
import { FileText } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";
import Modal from "./Modal1";
import PurchaseQuotationForm from "./PurchaseQuotationForm";
import "../styles/Quotation.css";

function Quotation() {
const [isModalOpen, setIsModalOpen] = useState(false);

const columns = [
{ key: "quotationNo", label: "Quotation No." },
{ key: "vendor", label: "Vendor" },
{ key: "item", label: "Item" },
{ key: "date", label: "Date" },
{ key: "quantity", label: "Quantity" },
{ key: "unitPrice", label: "Unit Price" },
{ key: "quotationTotal", label: "Quotation Total" },
{ key: "is_direct", label: "Is Direct" },
{ key: "status", label: "Status" },
];

const quotations = [];

return ( <div className="quotation-page"> <div className="quotation-heading"> <div className="quotation-title"> <FileText size={24} /> <h2>Purchase Quotations</h2> </div>

    <Button
      type="button"
      onClick={() => setIsModalOpen(true)}
    >
      + Add Quotation
    </Button>
  </div>

  <div className="quotation-table-section">
    <DataTable
      columns={columns}
      data={quotations}
      actions={() => null}
    />
  </div>

  <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
  >
    <PurchaseQuotationForm
      onClose={() => setIsModalOpen(false)}
    />
  </Modal>
</div>


);
}

export default Quotation;
