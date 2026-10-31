
import PurchaseQuotationForm from "../component/PurchaseQuotationForm.jsx";
import { useEffect, useState } from "react";
import {
  FileText,
  IndianRupee,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react";

import Table from "../component/Table.jsx";
import Button from "../component/Button.jsx";
import Badge from "../component/Atom/Badge.jsx";
import Modal from "../component/Modal1.jsx";
import Toast from "../component/Toast.jsx";
import StatCard from "../StatCard.jsx";
import "../styles/LOI.css";
import DetailsSection from "../component/Atom/DetailsSection";

const API_URL = "http://localhost:5000/api/lois";
const QUOTATION_STORAGE_KEY = "sharedPurchaseQuotations";

function LOI() {
  const [lois, setLois] = useState([]);
  const [selectedLOI, setSelectedLOI] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showQuotationEdit, setShowQuotationEdit] = useState(false);

  // Fetch LOIs from the existing backend
  const fetchLOIs = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch LOIs");
      }

      const result = await response.json();

      const records = Array.isArray(result)
        ? result
        : result.data || result.lois || [];

      const normalizedLOIs = records.map((item, index) => ({
        ...item,

        id:
          item.id ??
          item.loiId ??
          item.loi_id ??
          item.loiNumber ??
          item.loi_number ??
          index + 1,

        loiNumber:
          item.loiNumber ??
          item.loi_number ??
          item.loiNo ??
          "—",

        vendorName:
          item.vendorName ??
          item.vendor_name ??
          item.vendor ??
          "—",

        quotationNumber:
          item.quotationNumber ??
          item.quotation_number ??
          item.quotationNo ??
          item.quotation_no ??
          "—",

        itemName:
          item.itemName ??
          item.item_name ??
          item.product ??
          item.item ??
          "—",

        loiDate:
          item.loiDate ??
          item.loi_date ??
          item.date ??
          "—",

        quantity: Number(item.quantity ?? 0),

        unitPrice: Number(
          item.unitPrice ?? item.unit_price ?? 0
        ),

        lineTotal: Number(
          item.lineTotal ??
          item.line_total ??
          0
        ),

        loiTotalAmount: Number(
          item.loiTotalAmount ??
          item.loi_total_amount ??
          item.totalAmount ??
          item.total_amount ??
          item.lineTotal ??
          item.line_total ??
          0
        ),

        status: item.status ?? "Pending",
      }));

      setLois(normalizedLOIs);
    } catch (error) {
      console.error("Error fetching LOIs:", error);

      setToast({
        type: "error",
        message: "Unable to load LOIs.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLOIs();
  }, []);

  // View LOI details
  const handleView = (loi) => {
    setSelectedLOI(loi);
    setShowView(true);
  };

  // Open the quotation form for editing
  const handleEdit = (loi) => {
    setSelectedLOI(loi);
    setShowQuotationEdit(true);
  };

  // Update LOI locally and sync its quotation with the Quotation tab.
  // No backend PUT/PATCH request is made.
  const handleSaveQuotation = (quotationData) => {
    if (!selectedLOI) return;

    const firstItem = quotationData.items?.[0] || {};

    const quantity = Number(firstItem.quantity ?? 0);
    const unitPrice = Number(firstItem.unitPrice ?? 0);

    const lineTotal = quantity * unitPrice;

    const quotationNumber =
      quotationData.quotationNumber ||
      quotationData.quotationNo ||
      selectedLOI.quotationNumber;

    const vendorName =
      quotationData.vendor ||
      selectedLOI.vendorName;

    const itemName =
      firstItem.product ||
      selectedLOI.itemName;

    const quotationDate =
      quotationData.quotationDate ||
      selectedLOI.loiDate;

    const updatedLOI = {
      ...selectedLOI,

      quotationNumber,
      vendorName,
      itemName,
      loiDate: quotationDate,
      quantity,
      unitPrice,
      lineTotal,

      loiTotalAmount:
        Number(
          quotationData.quotationTotal ??
          quotationData.totalAmount ??
          lineTotal
        ) || lineTotal,
    };

    // Update the current LOI table without calling the backend.
    setLois((previousLOIs) =>
      previousLOIs.map((loi) =>
        String(loi.id) === String(selectedLOI.id)
          ? updatedLOI
          : loi
      )
    );

    // Read the existing quotation rows saved by Quotation.jsx.
    let quotations = [];

    try {
      const savedQuotations = localStorage.getItem(
        QUOTATION_STORAGE_KEY
      );

      quotations = savedQuotations
        ? JSON.parse(savedQuotations)
        : [];

      if (!Array.isArray(quotations)) {
        quotations = [];
      }
    } catch (error) {
      console.error("Error reading saved quotations:", error);
      quotations = [];
    }

    // Match by quotation number first, then by the existing LOI id.
    const quotationIndex = quotations.findIndex((quotation) => {
      const sameQuotationNumber =
        quotationNumber &&
        quotationNumber !== "—" &&
        String(
          quotation.quotationNo ??
          quotation.quotationNumber ??
          ""
        ) === String(quotationNumber);

      const sameId =
        String(quotation.id) === String(selectedLOI.id);

      return sameQuotationNumber || sameId;
    });

    const updatedQuotation = {
      ...quotationData,

      id:
        quotationIndex >= 0
          ? quotations[quotationIndex].id
          : selectedLOI.id,

      quotationNo: quotationNumber,
      quotationNumber,
      vendor: vendorName,
      item: itemName,
      date: quotationDate,
      quotationDate,
      quantity,
      unitPrice,
      quotationTotal:
        Number(
          quotationData.quotationTotal ??
          quotationData.totalAmount ??
          lineTotal
        ) || lineTotal,
    };

    if (quotationIndex >= 0) {
      quotations = quotations.map((quotation, index) =>
        index === quotationIndex
          ? {
              ...quotation,
              ...updatedQuotation,
            }
          : quotation
      );
    } else {
      quotations = [...quotations, updatedQuotation];
    }

    try {
      localStorage.setItem(
        QUOTATION_STORAGE_KEY,
        JSON.stringify(quotations)
      );

      // Notify Quotation.jsx to refresh its table.
      window.dispatchEvent(
        new Event("purchase-quotations-updated")
      );
    } catch (error) {
      console.error("Error saving quotation locally:", error);
    }

    setShowQuotationEdit(false);
    setSelectedLOI(null);

    setToast({
      type: "success",
      message: "LOI and quotation updated successfully.",
    });
  };

  // Existing backend DELETE connection remains unchanged.
  const handleDelete = async () => {
    if (deleteId === null || deleteId === undefined) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(deleteId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete LOI");
      }

      setLois((previousLOIs) =>
        previousLOIs.filter(
          (loi) => String(loi.id) !== String(deleteId)
        )
      );

      setShowDelete(false);
      setDeleteId(null);

      setToast({
        type: "success",
        message: "LOI deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting LOI:", error);

      setToast({
        type: "error",
        message: "Unable to delete LOI.",
      });
    }
  };

  // Inline table edits stay in frontend state only.
  const handleUpdate = (updatedItem) => {
    setLois((previousLOIs) =>
      previousLOIs.map((loi) =>
        String(loi.id) === String(updatedItem.id)
          ? { ...loi, ...updatedItem }
          : loi
      )
    );
  };

  const totalLOIs = lois.length;

  const pendingLOIs = lois.filter(
    (loi) =>
      String(loi.status).toLowerCase() === "pending"
  ).length;

  const approvedLOIs = lois.filter(
    (loi) =>
      String(loi.status).toLowerCase() === "approved"
  ).length;

  const totalAmount = lois.reduce(
    (total, loi) =>
      total + Number(loi.loiTotalAmount || 0),
    0
  );

  const columns = [
    {
      key: "loiNumber",
      label: "LOI Number",
      editable: false,
    },
    {
      key: "vendorName",
      label: "Vendor",
      editable: true,
    },
    {
      key: "quotationNumber",
      label: "Quotation Number",
      editable: true,
    },
    {
      key: "itemName",
      label: "Item",
      editable: true,
    },
    {
      key: "loiDate",
      label: "LOI Date",
      editable: true,
    },
    {
      key: "quantity",
      label: "Quantity",
      editable: true,
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      editable: true,
    },
    {
      key: "loiTotalAmount",
      label: "Total Amount",
      editable: false,
    },
    {
      key: "status",
      label: "Status",
      editable: true,
    },
  ];

  return (
    <div className="loi-page">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Statistics */}
      <div className="loi-stats">
        <StatCard
          title="Total LOIs"
          value={totalLOIs}
          icon={<FileText size={22} />}
        />

        <StatCard
          title="Pending LOIs"
          value={pendingLOIs}
          icon={<Clock size={22} />}
        />

        <StatCard
          title="Approved LOIs"
          value={approvedLOIs}
          icon={<CheckCircle size={22} />}
        />

        <StatCard
          title="Total Amount"
          value={`₹${totalAmount.toLocaleString("en-IN")}`}
          icon={<IndianRupee size={22} />}
        />
      </div>

      {/* LOI Table */}
      <div className="loi-table-section">
        {loading ? (
          <p>Loading LOIs...</p>
        ) : (
          <Table
            data={lois}
            columns={columns}
            onUpdate={handleUpdate}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(loi) => {
              setDeleteId(loi.id);
              setShowDelete(true);
            }}
            type="loi"
          />
        )}
      </div>

      {/* Edit LOI / Quotation Modal */}
      <Modal
        isOpen={showQuotationEdit}
        onClose={() => {
          setShowQuotationEdit(false);
          setSelectedLOI(null);
        }}
      >
        {selectedLOI && showQuotationEdit && (
          <PurchaseQuotationForm
            key={selectedLOI.id}
            initialData={{
              quotationCode: selectedLOI.quotationNumber,
              quotationNumber: selectedLOI.quotationNumber,
              vendor: selectedLOI.vendorName,

              quotationDate:
                selectedLOI.loiDate &&
                selectedLOI.loiDate !== "—"
                  ? String(selectedLOI.loiDate).slice(0, 10)
                  : "",

              quotationTotal: selectedLOI.loiTotalAmount,

              items: [
                {
                  itemCode: "",
                  product:
                    selectedLOI.itemName === "—"
                      ? ""
                      : selectedLOI.itemName,

                  quantity: String(
                    selectedLOI.quantity ?? 1
                  ),

                  unitPrice: String(
                    selectedLOI.unitPrice ?? ""
                  ),
                },
              ],
            }}
            onClose={() => {
              setShowQuotationEdit(false);
              setSelectedLOI(null);
            }}
            onSave={handleSaveQuotation}
          />
        )}
      </Modal>

      {/* View LOI Modal */}
      <Modal
        isOpen={showView}
        onClose={() => {
          setShowView(false);
          setSelectedLOI(null);
        }}
      >
        {selectedLOI && showView && (
          <div className="loi-view-modal">
            <div className="loi-view-heading">
              <FileText size={22} />
              <h2>LOI Details</h2>
            </div>

            <DetailsSection
              title="LOI Information"
              data={[
                {
                  label: "LOI Number",
                  value: selectedLOI.loiNumber,
                },
                {
                  label: "Vendor",
                  value: selectedLOI.vendorName,
                },
                {
                  label: "Quotation Number",
                  value: selectedLOI.quotationNumber,
                },
                {
                  label: "Item",
                  value: selectedLOI.itemName,
                },
                {
                  label: "LOI Date",
                  value: selectedLOI.loiDate,
                },
                {
                  label: "Quantity",
                  value: selectedLOI.quantity,
                },
                {
                  label: "Unit Price",
                  value: `₹${Number(
                    selectedLOI.unitPrice || 0
                  ).toLocaleString("en-IN")}`,
                },
                {
                  label: "Total Amount",
                  value: `₹${Number(
                    selectedLOI.loiTotalAmount || 0
                  ).toLocaleString("en-IN")}`,
                },
                {
                  label: "Status",
                  value: selectedLOI.status,
                },
              ]}
            />

            <div className="loi-view-actions">
              <Button
                type="button"
                onClick={() => {
                  setShowView(false);
                  setSelectedLOI(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => {
          setShowDelete(false);
          setDeleteId(null);
        }}
      >
        <div className="loi-delete-modal">
          <div className="loi-delete-icon">
            <Trash2 size={28} />
          </div>

          <h2>Delete LOI?</h2>

          <p>
            Are you sure you want to delete this LOI?
            This action cannot be undone.
          </p>

          <div className="loi-delete-actions">
            <Button
              type="button"
              onClick={() => {
                setShowDelete(false);
                setDeleteId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LOI;

