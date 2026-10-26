
import { useState, useMemo } from "react";
import { purchaseReceiptSchema } from "../schema/purchaseReceiptSchema.js";
import FormField from "../component/Atom/FormField-LIE.jsx";
import SearchBox from "../component/SearchBox.jsx";
import DatePicker from "../component/DatePicker.jsx";
import Textarea from "../component/Atom/Textarea.jsx";
import Button from "../component/Button.jsx";
import "../styles/PurchaseReceiptForm.css";

const purchaseOrders = [
  {
    id: "PO-1001",
    number: "PO-1001",
    supplier: "ABC Suppliers",
    date: "2026-10-20",
    currency: "INR",
    items: [
      {
        id: "POI-001",
        code: "ITM-001",
        description: "Laptop",
        unit: "PCS",
        ordered: 20,
        previouslyReceived: 5,
        unitCost: 45000,
      },
      {
        id: "POI-002",
        code: "ITM-002",
        description: "Wireless Mouse",
        unit: "PCS",
        ordered: 50,
        previouslyReceived: 10,
        unitCost: 500,
      },
    ],
  },
  {
    id: "PO-1002",
    number: "PO-1002",
    supplier: "Global Electronics",
    date: "2026-10-22",
    currency: "INR",
    items: [
      {
        id: "POI-003",
        code: "ITM-003",
        description: "Keyboard",
        unit: "PCS",
        ordered: 30,
        previouslyReceived: 0,
        unitCost: 1200,
      },
      {
        id: "POI-004",
        code: "ITM-004",
        description: "Monitor",
        unit: "PCS",
        ordered: 15,
        previouslyReceived: 3,
        unitCost: 12500,
      },
    ],
  },
  {
    id: "PO-1003",
    number: "PO-1003",
    supplier: "Sri Murugan Traders",
    date: "2026-10-24",
    currency: "INR",
    items: [
      {
        id: "POI-005",
        code: "ITM-005",
        description: "USB Cable",
        unit: "PCS",
        ordered: 100,
        previouslyReceived: 20,
        unitCost: 150,
      },
    ],
  },
];
const warehouseOptions = [
  { label: "Main Warehouse", value: "Main Warehouse" },
  { label: "Distribution Center", value: "Distribution Center" },
  { label: "Raw Material Warehouse", value: "Raw Material Warehouse" },
  { label: "Finished Goods Warehouse", value: "Finished Goods Warehouse" },
];

const zoneOptions = ["Zone A", "Zone B", "Zone C", "Rack 1", "Rack 2"];

const inspectionOptions = [
  "Pending",
  "Passed",
  "Failed",
  "Partially Passed",
];

const createReceiptItem = (item) => ({
  ...item,
  remaining: Math.max(0, item.ordered - item.previouslyReceived),
  received: "",
  accepted: "",
  rejected: "",
  zone: "",
  inspection: "Pending",
  rejectionReason: "",
  notes: "",
});

function PurchaseReceiptForm({
  onCancel,
  onCreate,
  currentUser = "Admin",
}) {
  const [poSearch, setPoSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [showPOSuggestions, setShowPOSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  const [formData, setFormData] = useState({
    warehouse: "",
    receiptCode: "PR-2026-001",
    receivedBy: currentUser,
    receiptDate: new Date(),
    receiptNotes: "",
  });

  const [items, setItems] = useState([]);

  const filteredPurchaseOrders = useMemo(() => {
    const search = poSearch.trim().toLowerCase();

    return purchaseOrders.filter(
      (po) =>
        po.number.toLowerCase().includes(search) ||
        po.supplier.toLowerCase().includes(search)
    );
  }, [poSearch]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitMessage("");
  };

  const handlePOSelect = (po) => {
    setSelectedPO(po);
    setPoSearch(po.number);
    setShowPOSuggestions(false);
    setItems(po.items.map(createReceiptItem));
    setErrors({});
    setSubmitMessage("");
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item, [field]: value };

        if (field === "received") {
          const received = Number(value || 0);
          const rejected = Number(updated.rejected || 0);
          updated.accepted = String(Math.max(0, received - rejected));
        }

        if (field === "rejected") {
          const rejected = Number(value || 0);
          const received = Number(updated.received || 0);
          updated.accepted = String(Math.max(0, received - rejected));
        }

        return updated;
      })
    );

    setErrors((prev) => {
      const next = { ...prev };
      delete next[`items.${index}.receivedQty`];
      delete next[`items.${index}.acceptedQty`];
      delete next[`items.${index}.rejectedQty`];
      delete next[`items.${index}.rejectionReason`];
      return next;
    });

    setSubmitMessage("");
  };

  const totalReceived = items.reduce(
    (sum, item) => sum + Number(item.received || 0),
    0
  );

  const totalAccepted = items.reduce(
    (sum, item) => sum + Number(item.accepted || 0),
    0
  );

  const totalRejected = items.reduce(
    (sum, item) => sum + Number(item.rejected || 0),
    0
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitMessage("");

    const receivedAt =
      formData.receiptDate instanceof Date
        ? formData.receiptDate.toISOString()
        : formData.receiptDate
          ? new Date(formData.receiptDate).toISOString()
          : "";

    const payload = {
      purchaseOrderId: selectedPO?.id ?? "",
      warehouseId: formData.warehouse,
      receiptCode: formData.receiptCode,
      receivedBy: formData.receivedBy,
      receivedAt,
      items: items.map((item) => ({
        receivedQty: item.received === "" ? 0 : item.received,
        acceptedQty: item.accepted === "" ? 0 : item.accepted,
        rejectedQty: item.rejected === "" ? 0 : item.rejected,
        rejectionReason: item.rejectionReason || "",
      })),
      notes: formData.receiptNotes || "",
    };

    const result = purchaseReceiptSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!nextErrors[path]) nextErrors[path] = issue.message;
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const receiptPreview = {
      ...result.data,
      purchaseOrder: selectedPO,
      warehouse: formData.warehouse,
      currency: selectedPO?.currency ?? "INR",
      items: items.map((item) => ({
        ...item,
        receivedQty: Number(item.received || 0),
        acceptedQty: Number(item.accepted || 0),
        rejectedQty: Number(item.rejected || 0),
      })),
      totalReceived,
      totalAccepted,
      totalRejected,
    };

    console.log("Purchase Receipt Preview:", receiptPreview);
    setSubmitMessage("Validation successful! Purchase Receipt preview is ready.");
    onCreate?.(receiptPreview);
  };

  const input = (
    name,
    label,
    value,
    type = "text",
    disabled = false,
    required = false
  ) => (
    <div className="pr-field">
      <FormField
        name={name}
        label={label}
        value={value ?? ""}
        type={type}
        disabled={disabled}
        required={required}
        onChange={(event) => updateField(name, event.target.value)}
        error={errors[name] || ""}
      />
    </div>
  );

  const errorMessage = (name) =>
    errors[name] ? <p className="pr-error">{errors[name]}</p> : null;

  return (
    <form className="purchase-receipt-form" onSubmit={handleSubmit}>
      <header className="pr-header">
        <div>
          <h2>Create Purchase Receipt</h2>
          <p>Record delivered items and verify received quantities.</p>
        </div>
        <span className="pr-preview-badge">UI Preview</span>
      </header>

      {submitMessage && (
        <div className="pr-success-message">{submitMessage}</div>
      )}

      {/* A. Purchase Order Details */}
      <section className="pr-section">
        <h3>A. Purchase Order Details</h3>

        <div className="pr-grid">
          <div className="pr-field pr-po-search">
            <label className="pr-label">
              Purchase Order Number <span>*</span>
            </label>

            <SearchBox
              value={poSearch}
              onChange={(value) => {
                setPoSearch(value);
                setShowPOSuggestions(true);
                setSelectedPO(null);
                setItems([]);
                setErrors((prev) => ({
                  ...prev,
                  purchaseOrderId: "",
                }));
              }}
              placeholder="Search PO number or supplier..."
            />

            {showPOSuggestions && (
              <div className="pr-po-results">
                {filteredPurchaseOrders.length ? (
                  filteredPurchaseOrders.map((po) => (
                    <button
                      type="button"
                      key={po.id}
                      className="pr-po-option"
                      onClick={() => handlePOSelect(po)}
                    >
                      <strong>{po.number}</strong>
                      <span>{po.supplier}</span>
                      <small>{po.date}</small>
                    </button>
                  ))
                ) : (
                  <p className="pr-no-results">No matching purchase orders</p>
                )}
              </div>
            )}

            {errorMessage("purchaseOrderId")}
          </div>

          {input("supplier", "Supplier", selectedPO?.supplier || "", "text", true)}
          {input("poDate", "PO Date", selectedPO?.date || "", "text", true)}

          <div className="pr-field">
            <label className="pr-label">
              Warehouse <span>*</span>
            </label>
            <select
              value={formData.warehouse}
              onChange={(event) => updateField("warehouse", event.target.value)}
            >
              <option value="">Select warehouse</option>
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse.value} value={warehouse.value}>
                  {warehouse.label}
                </option>
              ))}
            </select>
            {errorMessage("warehouseId")}
          </div>

          {input("currency", "Currency", selectedPO?.currency || "", "text", true)}
        </div>
      </section>

      {/* B. Receipt Information */}
      <section className="pr-section">
        <h3>B. Receipt Information</h3>

        <div className="pr-grid">
          {input("receiptCode", "Receipt Code", formData.receiptCode, "text", false, true)}

          {input("grnNumber", "GRN Number", "GRN-2026-001", "text", true)}

          {input("deliveryNoteNumber", "Delivery Note Number", "", "text", false)}

          {input("vehicleNumber", "Vehicle Number", "", "text", false)}

          {input("receivedBy", "Received By", formData.receivedBy, "text", false, true)}

          <div className="pr-field">
            <label className="pr-label">
              Receipt Date <span>*</span>
            </label>
            <DatePicker
              value={formData.receiptDate}
              onChange={(value) => updateField("receiptDate", value)}
            />
            {errorMessage("receivedAt")}
          </div>
        </div>
      </section>

      {/* C. Received Items */}
      <section className="pr-section">
        <h3>C. Received Items</h3>

        {errors.items && (
          <p className="pr-error pr-section-error">{errors.items}</p>
        )}

        {!selectedPO ? (
          <div className="pr-empty">
            <strong>No Purchase Order selected</strong>
            <p>Search and select a Purchase Order to display its items.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div className="pr-item-card" key={item.id}>
              <div className="pr-item-header">
                <div>
                  <h4>{item.description}</h4>
                  <p>
                    {item.code} <span>•</span> Unit: {item.unit}
                  </p>
                </div>
                <span className="pr-item-tag">Item {index + 1}</span>
              </div>

              <div className="pr-grid">
                {input(`ordered-${index}`, "Ordered Quantity", item.ordered, "number", true)}
                {input(`previous-${index}`, "Previously Received", item.previouslyReceived, "number", true)}
                {input(`remaining-${index}`, "Remaining Quantity", item.remaining, "number", true)}
                {input(`cost-${index}`, "Unit Cost", item.unitCost, "number", true)}

                <div className="pr-field">
                  <label className="pr-label">
                    Received Quantity <span>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={item.remaining}
                    value={item.received}
                    placeholder="Enter quantity"
                    onChange={(event) => updateItem(index, "received", event.target.value)}
                  />
                  {errorMessage(`items.${index}.receivedQty`)}
                </div>

                <div className="pr-field">
                  <label className="pr-label">Accepted Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={item.accepted}
                    onChange={(event) => updateItem(index, "accepted", event.target.value)}
                  />
                  {errorMessage(`items.${index}.acceptedQty`)}
                </div>

                <div className="pr-field">
                  <label className="pr-label">Rejected Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={item.rejected}
                    onChange={(event) => updateItem(index, "rejected", event.target.value)}
                  />
                  {errorMessage(`items.${index}.rejectedQty`)}
                </div>

                <div className="pr-field">
                  <label className="pr-label">Storage Zone</label>
                  <select
                    value={item.zone}
                    onChange={(event) => updateItem(index, "zone", event.target.value)}
                  >
                    <option value="">Select zone</option>
                    {zoneOptions.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pr-field">
                  <label className="pr-label">Inspection Status</label>
                  <select
                    value={item.inspection}
                    onChange={(event) => updateItem(index, "inspection", event.target.value)}
                  >
                    {inspectionOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pr-field">
                  <label className="pr-label">Rejection Reason</label>
                  <input
                    type="text"
                    value={item.rejectionReason}
                    placeholder="Enter rejection reason"
                    onChange={(event) =>
                      updateItem(index, "rejectionReason", event.target.value)
                    }
                  />
                  {errorMessage(`items.${index}.rejectionReason`)}
                </div>

                <div className="pr-field pr-item-notes">
                  <label className="pr-label">Item Notes</label>
                  <Textarea
                    name={`itemNotes-${index}`}
                    value={item.notes}
                    onChange={(event) => updateItem(index, "notes", event.target.value)}
                    placeholder="Enter item notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* D. Receipt Summary */}
      <section className="pr-section">
        <h3>D. Receipt Summary</h3>

        <div className="pr-summary-grid">
          <div className="pr-summary-card">
            <span>Receipt Lines</span>
            <strong>{items.length}</strong>
          </div>
          <div className="pr-summary-card">
            <span>Total Received Quantity</span>
            <strong>{totalReceived}</strong>
          </div>
          <div className="pr-summary-card">
            <span>Total Accepted Quantity</span>
            <strong>{totalAccepted}</strong>
          </div>
          <div className="pr-summary-card">
            <span>Total Rejected Quantity</span>
            <strong>{totalRejected}</strong>
          </div>
        </div>
      </section>

      {/* E. Additional Details */}
      <section className="pr-section">
        <h3>E. Additional Details</h3>

        <div className="pr-field">
          <label className="pr-label">Receipt Notes</label>
          <Textarea
            name="receiptNotes"
            value={formData.receiptNotes}
            onChange={(event) => updateField("receiptNotes", event.target.value)}
            placeholder="Enter additional receipt notes..."
            rows={3}
          />
        </div>
      </section>

      <div className="pr-actions">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Receipt</Button>
      </div>
    </form>
  );
}

export default PurchaseReceiptForm;
