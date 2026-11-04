
import { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import DataTable from "./DataTable";
import Button from "./Button";
import Modal from "./Modal1";
import PurchaseQuotationForm from "./PurchaseQuotationForm";
import DetailsField from "./Atom/DetailsField";
import Badge from "./Atom/Badge.jsx";
import "../styles/Quotation.css";

const API_URL = "http://localhost:5000/api/purchase-quotations";

const getQuotationId = (quotation) =>
  quotation?.id ?? quotation?.quotation_id;

const getResponseData = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.quotations)) return result.quotations;
  if (Array.isArray(result?.data?.quotations)) {
    return result.data.quotations;
  }
  return [];
};

const normalizeQuotation = (quotation = {}) => {
  const items = Array.isArray(quotation.items)
    ? quotation.items
    : [];

  const vendor =
    typeof quotation.vendor === "object"
      ? quotation.vendor?.name ||
        quotation.vendor?.vendorName ||
        ""
      : quotation.vendor || quotation.vendor_name || "";

  return {
    ...quotation,

    id: getQuotationId(quotation),

    quotationNumber:
      quotation.quotationNumber ||
      quotation.quotation_number ||
      quotation.quotationNo ||
      "",

    quotationNo:
      quotation.quotationNo ||
      quotation.quotationNumber ||
      quotation.quotation_number ||
      "",

    quotationCode:
      quotation.quotationCode ||
      quotation.quotation_code ||
      quotation.systemCode ||
      "",

    quotationDate:
      quotation.quotationDate ||
      quotation.quotation_date ||
      quotation.date ||
      "",

    validUntil:
      quotation.validUntil ||
      quotation.valid_until ||
      "",

    vendor,

    vendorCode:
      quotation.vendorCode ||
      quotation.vendor_code ||
      quotation.vendorDetails?.vendorCode ||
      "",

    contactPerson:
      quotation.contactPerson ||
      quotation.contact_person ||
      quotation.vendorDetails?.contact ||
      "",

    email:
      quotation.email ||
      quotation.vendorDetails?.email ||
      "",

    phone:
      quotation.phone ||
      quotation.vendorDetails?.phone ||
      "",

    gstin:
      quotation.gstin ||
      quotation.GSTIN ||
      quotation.vendorDetails?.gstin ||
      "",

    items,

    item:
      quotation.item ||
      items[0]?.product ||
      "",

    date:
      quotation.date ||
      quotation.quotationDate ||
      quotation.quotation_date ||
      "",

    quantity:
      quotation.quantity ??
      items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),

    unitPrice: Number(
      quotation.unitPrice ??
        items[0]?.unitPrice ??
        items[0]?.unit_price ??
        0
    ),

    quotationTotal: Number(
      quotation.quotationTotal ??
        quotation.quotation_total ??
        0
    ),

    quotationDiscount:
      quotation.quotationDiscount ??
      quotation.quotation_discount ??
      0,

    additionalCharges:
      quotation.additionalCharges ??
      quotation.additional_charges ??
      0,

    overallDeliveryDays:
      quotation.overallDeliveryDays ??
      quotation.overall_delivery_days ??
      "",

    paymentTerms:
      quotation.paymentTerms ||
      quotation.payment_terms ||
      "",

    deliveryTerms:
      quotation.deliveryTerms ||
      quotation.delivery_terms ||
      "",

    is_direct:
      quotation.is_direct ??
      quotation.isDirect ??
      false,
  };
};

const displayValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }

  return value;
};

const formatCurrency = (value, currency = "INR") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusType = (status) => {
  const normalized = String(status || "Draft").toLowerCase();

  const statusTypes = {
    draft: "default",
    sent: "info",
    "under review": "warning",
    accepted: "success",
    rejected: "danger",
    expired: "danger",
    cancelled: "danger",
  };

  return statusTypes[normalized] || "default";
};

const calculateItemValues = (item = {}) => {
  const quantity = Number(item.quantity || 0);

  const unitPrice = Number(
    item.unitPrice ?? item.unit_price ?? 0
  );

  const discountValue = Number(item.discount || 0);

  const taxRate = Number(
    item.taxRate ?? item.tax_rate ?? 0
  );

  const subtotal = quantity * unitPrice;

  const discount =
    subtotal * (discountValue > 0 ? discountValue / 100 : 0);

  const taxableAmount = Math.max(0, subtotal - discount);

  const tax =
    item.taxAmount !== undefined &&
    item.taxAmount !== null &&
    item.taxAmount !== ""
      ? Number(item.taxAmount) || 0
      : item.tax_amount !== undefined &&
          item.tax_amount !== null &&
          item.tax_amount !== ""
        ? Number(item.tax_amount) || 0
        : taxableAmount * (taxRate / 100);

  const lineTotal = taxableAmount + tax;

  return {
    quantity,
    unitPrice,
    subtotal,
    discount,
    tax,
    lineTotal,
  };
};

function Quotation({ openModalOnLoad = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewingQuotation, setViewingQuotation] =
    useState(null);

  const [editingQuotation, setEditingQuotation] =
    useState(null);

  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [apiError, setApiError] = useState("");

  // GET: Fetch quotations from the backend.
  const fetchQuotations = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch quotations (${response.status})`
        );
      }

      const result = await response.json();

      const records = getResponseData(result);

      setQuotations(records.map(normalizeQuotation));
    } catch (error) {
      setApiError(
        error.message || "Unable to load quotations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (openModalOnLoad) {
      setEditingQuotation(null);
      setIsModalOpen(true);
    }
  }, [openModalOnLoad]);

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

  // POST: Add quotation.
  // PUT: Update quotation.
  const handleSaveQuotation = async (quotationData) => {
    setSaving(true);
    setApiError("");

    const isEditing = Boolean(editingQuotation);

    const quotationId = getQuotationId(editingQuotation);

    if (isEditing && quotationId == null) {
      setApiError("Quotation ID is missing. Cannot update.");
      setSaving(false);
      return;
    }

    try {
      const url = isEditing
        ? `${API_URL}/${encodeURIComponent(quotationId)}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to ${isEditing ? "update" : "create"} quotation (${response.status})`
        );
      }

      await fetchQuotations();

      setEditingQuotation(null);
      setIsModalOpen(false);
    } catch (error) {
      setApiError(
        error.message || "Unable to save quotation."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleView = (quotation) => {
    setViewingQuotation(quotation);
  };

  const handleEdit = (quotation) => {
    setViewingQuotation(null);
    setEditingQuotation(quotation);
    setIsModalOpen(true);
  };

  // DELETE: Remove quotation from the backend.
  const handleDelete = async (quotation) => {
    const quotationId = getQuotationId(quotation);

    if (quotationId == null) {
      setApiError("Quotation ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete quotation ${
        quotation.quotationNo || ""
      }?`
    );

    if (!confirmed) return;

    setDeletingId(quotationId);
    setApiError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(quotationId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to delete quotation (${response.status})`
        );
      }

      setQuotations((previous) =>
        previous.filter(
          (item) =>
            String(getQuotationId(item)) !==
            String(quotationId)
        )
      );

      if (
        String(getQuotationId(viewingQuotation || {})) ===
        String(quotationId)
      ) {
        setViewingQuotation(null);
      }
    } catch (error) {
      setApiError(
        error.message || "Unable to delete quotation."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const closeFormModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingQuotation(null);
  };

  const closeDetailsModal = () => {
    setViewingQuotation(null);
  };

  const quotation = viewingQuotation || {};

  const items = Array.isArray(quotation.items)
    ? quotation.items
    : [];

  const currency = quotation.currency || "INR";

  const subtotal = items.reduce((total, item) => {
    const values = calculateItemValues(item);
    return total + values.subtotal;
  }, 0);

  const itemDiscount = items.reduce((total, item) => {
    const values = calculateItemValues(item);
    return total + values.discount;
  }, 0);

  const taxTotal = items.reduce((total, item) => {
    const values = calculateItemValues(item);
    return total + values.tax;
  }, 0);

  const quotationDiscount = Number(
    quotation.quotationDiscount || 0
  );

  const additionalCharges = Number(
    quotation.additionalCharges || 0
  );

  const calculatedGrandTotal =
    subtotal -
    itemDiscount -
    quotationDiscount +
    taxTotal +
    additionalCharges;

  const grandTotal =
    quotation.quotationTotal !== undefined &&
    quotation.quotationTotal !== null &&
    quotation.quotationTotal !== ""
      ? Number(quotation.quotationTotal)
      : calculatedGrandTotal;

  const vendorName =
    typeof quotation.vendor === "object"
      ? quotation.vendor?.name ||
        quotation.vendor?.vendorName ||
        ""
      : quotation.vendor;

  const vendorCode =
    quotation.vendorCode ||
    quotation.vendor_code ||
    quotation.vendorDetails?.vendorCode;

  const vendorContact =
    quotation.contactPerson ||
    quotation.contact ||
    quotation.vendorDetails?.contact;

  const vendorEmail =
    quotation.email ||
    quotation.vendorDetails?.email;

  const vendorPhone =
    quotation.phone ||
    quotation.vendorDetails?.phone;

  const vendorGSTIN =
    quotation.gstin ||
    quotation.GSTIN ||
    quotation.vendorDetails?.gstin;

  return (
    <div className="quotation-page">
      <div className="quotation-heading">
        <div className="quotation-title">
          <FileText size={24} />
          <h2>Purchase Quotations</h2>
        </div>

        <Button
          type="button"
          onClick={() => {
            setApiError("");
            setEditingQuotation(null);
            setIsModalOpen(true);
          }}
        >
          + Add Quotation
        </Button>
      </div>

      <div className="quotation-table-section">
        {apiError && (
          <div
            className="quotation-api-error"
            role="alert"
          >
            <span>{apiError}</span>

            <button
              type="button"
              aria-label="Close error"
              onClick={() => setApiError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <p className="quotation-loading">
            Loading quotations...
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={quotations}
            actions={(item) => (
              <>
                <button
                  type="button"
                  className="quotation-action-btn view-action"
                  title="View quotation"
                  aria-label="View quotation"
                  onClick={() => handleView(item)}
                >
                  <Eye size={17} />
                </button>

                <button
                  type="button"
                  className="quotation-action-btn edit-action"
                  title="Edit quotation"
                  aria-label="Edit quotation"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="quotation-action-btn delete-action"
                  title="Delete quotation"
                  aria-label="Delete quotation"
                  disabled={
                    deletingId != null &&
                    String(deletingId) ===
                      String(getQuotationId(item))
                  }
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 size={17} />
                </button>
              </>
            )}
          />
        )}

      </div>

      {/* Add / Edit Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeFormModal}
      >
        <PurchaseQuotationForm
          key={editingQuotation?.id ?? "new"}
          initialData={editingQuotation}
          onClose={closeFormModal}
          onSave={handleSaveQuotation}
        />
      </Modal>

      {/* View Quotation Details Modal */}
      <Modal
        isOpen={Boolean(viewingQuotation)}
        onClose={closeDetailsModal}
      >
        {viewingQuotation && (
          <div className="quotation-details-modal">
            <div className="quotation-details-header">
              <div>
                <h2>Quotation Details</h2>

                <div className="quotation-details-number">
                  <span>Quotation No.:</span>

                  <strong>
                    {displayValue(
                      quotation.quotationNumber ||
                        quotation.quotationNo
                    )}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="quotation-details-close"
                aria-label="Close quotation details"
                onClick={closeDetailsModal}
              >
                <X size={21} />
              </button>
            </div>

            <div className="quotation-details-scroll">
              {/* Quotation Information */}
              <section className="quotation-details-section">
                <div className="quotation-details-info-grid">
                  <DetailsField
                    label="System Code"
                    value={
                      quotation.quotationCode ||
                      quotation.systemCode
                    }
                  />

                  <div className="details-field">
                    <span className="details-field-label">
                      Status
                    </span>

                    <div>
                      <Badge
                        type={getStatusType(quotation.status)}
                      >
                        {displayValue(
                          quotation.status || "Draft"
                        )}
                      </Badge>
                    </div>
                  </div>

                  <DetailsField
                    label="Quotation Date"
                    value={formatDate(
                      quotation.quotationDate ||
                        quotation.date
                    )}
                  />

                  <DetailsField
                    label="Valid Until"
                    value={formatDate(quotation.validUntil)}
                  />

                  <DetailsField
                    label="Currency"
                    value={currency}
                  />

                  <DetailsField
                    label="Total Amount"
                    value={formatCurrency(
                      grandTotal,
                      currency
                    )}
                  />
                </div>
              </section>

              {/* Vendor Information */}
              <section className="quotation-details-section">
                <h3>Vendor Information</h3>

                <div className="quotation-details-info-grid">
                  <DetailsField
                    label="Vendor Name"
                    value={vendorName}
                  />

                  <DetailsField
                    label="Vendor Code"
                    value={vendorCode}
                  />

                  <DetailsField
                    label="Contact Person"
                    value={vendorContact}
                  />

                  <DetailsField
                    label="Email"
                    value={vendorEmail}
                  />

                  <DetailsField
                    label="Phone"
                    value={vendorPhone}
                  />

                  <DetailsField
                    label="GSTIN"
                    value={vendorGSTIN}
                  />
                </div>
              </section>

              {/* Quotation Items */}
              <section className="quotation-details-section">
                <h3>Quotation Items</h3>

                {items.length > 0 ? (
                  <div className="quotation-item-list">
                    {items.map((item, index) => {
                      const values =
                        calculateItemValues(item);

                      return (
                        <article
                          className="quotation-item-card"
                          key={item.id || index}
                        >
                          <div className="quotation-item-card-header">
                            <div className="quotation-item-heading">
                              <h4>
                                {displayValue(item.product)}
                              </h4>

                              <div className="quotation-item-codes">
                                <span>
                                  Item code:{" "}
                                  {displayValue(item.itemCode)}
                                </span>

                                <span>
                                  Vendor item code:{" "}
                                  {displayValue(
                                    item.vendorItemCode ||
                                      item.vendorItem ||
                                      item.vendor_item_code
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="quotation-item-line-total">
                              <strong>
                                {formatCurrency(
                                  values.lineTotal,
                                  currency
                                )}
                              </strong>

                              <span>Line total</span>
                            </div>
                          </div>

                          <div className="quotation-item-info-grid">
                            <DetailsField
                              label="Quantity"
                              value={`${values.quantity} ${
                                item.unit || ""
                              }`.trim()}
                            />

                            <DetailsField
                              label="Unit Price"
                              value={formatCurrency(
                                values.unitPrice,
                                currency
                              )}
                            />

                            <DetailsField
                              label="Discount"
                              value={formatCurrency(
                                values.discount,
                                currency
                              )}
                            />

                            <DetailsField
                              label="Tax Amount"
                              value={formatCurrency(
                                values.tax,
                                currency
                              )}
                            />

                            <DetailsField
                              label="Expected Delivery"
                              value={
                                item.deliveryDays ||
                                item.delivery_days
                                  ? `${
                                      item.deliveryDays ||
                                      item.delivery_days
                                    } days`
                                  : "-"
                              }
                            />

                            <DetailsField
                              label="Unit"
                              value={item.unit}
                            />
                          </div>

                          <div className="quotation-item-description">
                            {item.description || item.notes ? (
                              <>
                                {item.description && (
                                  <p>{item.description}</p>
                                )}

                                {item.notes && (
                                  <p>{item.notes}</p>
                                )}
                              </>
                            ) : (
                              <p>
                                No item description or notes.
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="quotation-items-empty">
                    No quotation items found.
                  </div>
                )}

                <div className="quotation-total-card">
                  <div className="quotation-total-row">
                    <span>Subtotal</span>

                    <span>
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>

                  <div className="quotation-total-row">
                    <span>Discount</span>

                    <span>
                      {formatCurrency(
                        itemDiscount + quotationDiscount,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="quotation-total-row">
                    <span>Tax</span>

                    <span>
                      {formatCurrency(taxTotal, currency)}
                    </span>
                  </div>

                  <div className="quotation-total-row">
                    <span>Additional Charges</span>

                    <span>
                      {formatCurrency(
                        additionalCharges,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="quotation-grand-total">
                    <strong>
                      Total Quotation Amount
                    </strong>

                    <strong>
                      {formatCurrency(grandTotal, currency)}
                    </strong>
                  </div>
                </div>
              </section>

              {/* Delivery & Payment Terms */}
              <section className="quotation-details-section">
                <h3>Delivery &amp; Payment Terms</h3>

                <div className="quotation-details-info-grid">
                  <DetailsField
                    label="Expected Delivery"
                    value={
                      quotation.overallDeliveryDays
                        ? `${quotation.overallDeliveryDays} days`
                        : "-"
                    }
                  />

                  <DetailsField
                    label="Payment Terms"
                    value={quotation.paymentTerms}
                  />

                  <DetailsField
                    label="Delivery Terms"
                    value={quotation.deliveryTerms}
                  />

                  <DetailsField
                    label="Notes"
                    value={quotation.notes}
                  />
                </div>
              </section>
            </div>

            <div className="quotation-details-footer">
              <Button
                type="button"
                onClick={closeDetailsModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Quotation;
