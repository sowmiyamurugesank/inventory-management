import { useState } from "react";
import {
FileText,
CircleAlert,
Clock,
Eye,
Trash2,
X,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import DataTable from "../component/DataTable.jsx";
import "../styles/Invoice.css";

function Invoice() {
const [invoices, setInvoices] = useState([
  {
    id: 1,
    invoice_number: "INV-2026-001",
    vendor_name: "ABC Traders",
    po_number: "PO-001",
    invoice_date: "2026-10-20",
    due_date: "2026-11-20",
    total_amount: 25000,
    paid_amount: 10000,
    outstanding: 15000,
    payment_status: "PARTIALLY_PAID",
    status: "POSTED",
  },
  {
    id: 2,
    invoice_number: "INV-2026-002",
    vendor_name: "XYZ Suppliers",
    po_number: "PO-002",
    invoice_date: "2026-10-22",
    due_date: "2026-11-22",
    total_amount: 15000,
    paid_amount: 0,
    outstanding: 15000,
    payment_status: "UNPAID",
    status: "APPROVED",
  },
]);
const [selectedInvoice, setSelectedInvoice] = useState(null);
const [deleteInvoice, setDeleteInvoice] = useState(null);

const totalInvoices = invoices.length;

const unpaidInvoices = invoices.filter(
(invoice) => invoice.payment_status === "UNPAID"
).length;

const overdueInvoices = invoices.filter(
(invoice) => invoice.payment_status === "OVERDUE"
).length;

const columns = [
{ key: "invoice_number", label: "Invoice No." },
{ key: "vendor_name", label: "Vendor" },
{ key: "po_number", label: "PO Number" },
{ key: "invoice_date", label: "Invoice Date" },
{ key: "due_date", label: "Due Date" },
{ key: "total_amount", label: "Total Amount" },
{ key: "paid_amount", label: "Paid Amount" },
{ key: "outstanding", label: "Outstanding" },
{
  key: "payment_status",
  label: "Payment Status",
  render: (item) => (
    <span
      className={`invoice-status-badge payment-${(
        item.payment_status || ""
      ).toLowerCase()}`}
    >
      {(item.payment_status || "—").replace(/_/g, " ")}
    </span>
  ),
},
{
  key: "status",
  label: "Invoice Status",
  render: (item) => (
    <span
      className={`invoice-status-badge invoice-${(
        item.status || ""
      ).toLowerCase()}`}
    >
      {(item.status || "—").replace(/_/g, " ")}
    </span>
  ),
},
];

const renderActions = (invoice) => (
<>
<button
type="button"
className="invoice-action-btn"
title="View Invoice"
onClick={() => setSelectedInvoice(invoice)}
> <Eye size={17} /> </button>


  <button
    type="button"
    className="invoice-action-btn delete"
    title="Delete Invoice"
    onClick={() => setDeleteInvoice(invoice)}
  >
    <Trash2 size={17} />
  </button>
</>


);

const confirmDelete = () => {
if (!deleteInvoice) return;


setInvoices((prevInvoices) =>
  prevInvoices.filter((item) => item.id !== deleteInvoice.id)
);

if (selectedInvoice?.id === deleteInvoice.id) {
  setSelectedInvoice(null);
}

setDeleteInvoice(null);


};

const formatAmount = (amount) => {
if (amount === undefined || amount === null || amount === "") {
return "—";
}


return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
}).format(Number(amount));


};

return ( <div className="invoice-page"> <div className="invoice-heading"> <h2>Purchase Invoices</h2> </div>


  <div className="invoice-stats">
    <StatCard
      title="Total Invoices"
      value={totalInvoices}
      icon={<FileText size={22} />}
    />

    <StatCard
      title="Unpaid"
      value={unpaidInvoices}
      icon={<CircleAlert size={22} />}
    />

    <StatCard
      title="Overdue"
      value={overdueInvoices}
      icon={<Clock size={22} />}
    />
  </div>

    {selectedInvoice && (
    <div className="invoice-details-section">
      <div className="invoice-details-header">
        <button
  type="button"
  className="invoice-details-close"
  onClick={() => setSelectedInvoice(null)}
  aria-label="Close invoice details"
>
  <X size={20} />
</button>
        <div>
          <span>Invoice Number</span>
          <h3>{selectedInvoice.invoice_number || "—"}</h3>
        </div>

        <div className="invoice-total-section">
          <h3>{formatAmount(selectedInvoice.total_amount)}</h3>

          <span
            className={`invoice-status-badge payment-${(
              selectedInvoice.payment_status || "UNPAID"
            ).toLowerCase()}`}
          >
            {(selectedInvoice.payment_status || "UNPAID").replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="invoice-detail-grid">
        <div>
          <span>Vendor</span>
          <p>{selectedInvoice.vendor_name || "—"}</p>
        </div>

        <div>
          <span>PO Number</span>
          <p>{selectedInvoice.po_number || "—"}</p>
        </div>

        <div>
          <span>Invoice Date</span>
          <p>{selectedInvoice.invoice_date || "—"}</p>
        </div>

        <div>
          <span>Due Date</span>
          <p>{selectedInvoice.due_date || "—"}</p>
        </div>

        <div>
          <span>Paid Amount</span>
          <p>{formatAmount(selectedInvoice.paid_amount)}</p>
        </div>

        <div>
          <span>Outstanding</span>
          <p>{formatAmount(selectedInvoice.outstanding)}</p>
        </div>
      </div>

      <div className="invoice-detail-status">
  <div>
    <span>Invoice Status</span>

    <span
      className={`invoice-status-badge invoice-${(
        selectedInvoice.status || "DRAFT"
      ).toLowerCase()}`}
    >
      {(selectedInvoice.status || "DRAFT").replace(/_/g, " ")}
    </span>
  </div>
</div>

<div className="invoice-detail-actions">
 <button
  type="button"
  className="invoice-payment-btn"
>
  Payment
</button>

  <button
    type="button"
    className="invoice-credit-note-btn"
    disabled={selectedInvoice.creditNoteCreated}
    onClick={() => {
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? { ...invoice, creditNoteCreated: true }
            : invoice
        )
      );

      setSelectedInvoice((prev) => ({
        ...prev,
        creditNoteCreated: true,
      }));
    }}
  >
    {selectedInvoice.creditNoteCreated ? "Credit Note Created" : "Credit Note"}
  </button>
</div>

      
    </div>
  )}

  <div className="invoice-table-section">
    <DataTable
      columns={columns}
      data={invoices}
      actions={renderActions}
    />
  </div>

  {/* Delete Confirmation Modal */}
  {deleteInvoice && (
    <div
      className="invoice-modal-overlay"
      onClick={() => setDeleteInvoice(null)}
    >
      <div
        className="invoice-delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="invoice-modal-header">
          <h3>Delete Invoice</h3>

          <button
            type="button"
            className="invoice-modal-close"
            onClick={() => setDeleteInvoice(null)}
            aria-label="Close delete confirmation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="invoice-delete-body">
          <p>
            Are you sure you want to delete invoice{" "}
            <strong>
              {deleteInvoice.invoice_number || "this invoice"}
            </strong>
            ?
          </p>

          <span>This action will remove the invoice from the current table.</span>

          <div className="invoice-modal-footer">
            <button
              type="button"
              className="invoice-secondary-btn"
              onClick={() => setDeleteInvoice(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="invoice-delete-confirm-btn"
              onClick={confirmDelete}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>


);
}

export default Invoice;
