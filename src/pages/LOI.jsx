
import { useEffect, useState } from "react";
import { FileText, IndianRupee, Clock, CheckCircle, Trash2 } from "lucide-react";
import Table from "../component/Table.jsx";
import Button from "../component/Button.jsx";
import Badge from "../component/Atom/Badge.jsx";
import Modal from "../component/Modal1.jsx";
import Toast from "../component/Toast.jsx";
import StatCard from "../StatCard.jsx";
import "../styles/LOI.css";
import DetailsSection from "../component/Atom/DetailsSection";

const API_URL = "http://localhost:5000/api/lois";

function LOI() {
  const [lois, setLois] = useState([]);
  const [selectedLOI, setSelectedLOI] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchLOIs = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch LOIs");

      const result = await response.json();
      const records = Array.isArray(result) ? result : result.data || [];

      setLois(
        records.map((item) => ({
          ...item,
          id:
            item.id ??
            item.loiId ??
            item.loi_id ??
            item.loiNumber ??
            item.loi_number,
          loiNumber: item.loiNumber ?? item.loi_number ?? item.loiNo ?? "—",
          vendorName: item.vendorName ?? item.vendor_name ?? "—",
          quotationNumber:
            item.quotationNumber ?? item.quotation_number ?? "—",
          itemName: item.itemName ?? item.item_name ?? "—",
          loiDate: item.loiDate ?? item.loi_date ?? "—",
          quantity: item.quantity ?? 0,
          unitPrice: item.unitPrice ?? item.unit_price ?? 0,
          lineTotal: item.lineTotal ?? item.line_total ?? 0,
          loiTotalAmount:
            item.loiTotalAmount ??
            item.loi_total_amount ??
            item.total_amount ??
            0,
          status: item.status ?? "Pending",
        }))
      );
    } catch (error) {
      console.error("LOI fetch error:", error);
      showMessage("Unable to load LOIs. Check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLOIs();
  }, []);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date || date === "—") return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const getBadgeType = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "approved" || value === "completed") return "success";
    if (value === "rejected" || value === "cancelled") return "danger";
    if (value === "pending") return "warning";

    return "default";
  };

  const columns = [
    { key: "loiNumber", label: "LOI Number", editable: true },
    { key: "vendorName", label: "Vendor Name", editable: true },
    { key: "quotationNumber", label: "Quotation Number", editable: true },
    { key: "itemName", label: "Item Name", editable: true },
    { key: "loiDate", label: "LOI Date", editable: true, type: "date" },
    { key: "quantity", label: "Quantity", editable: true, type: "number" },
    {
      key: "unitPrice",
      label: "Unit Price",
      editable: true,
      type: "number",
      step: "0.01",
    },
    {
      key: "lineTotal",
      label: "Line Total",
      editable: true,
      type: "number",
      step: "0.01",
    },
    {
      key: "loiTotalAmount",
      label: "LOI Total Amount",
      editable: true,
      type: "number",
      step: "0.01",
    },
    { key: "status", label: "Status" },
  ];

  const handleView = (item) => {
    setSelectedLOI(item);
    setShowView(true);
  };

  const handleEdit = (item) => {
    setSelectedLOI(item);
    showMessage("Quotation form integration will be added next.");
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(deleteId)}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      setLois((previous) =>
        previous.filter((item) => item.id !== deleteId)
      );

      setShowDelete(false);
      setDeleteId(null);
      showMessage("LOI deleted successfully.");
    } catch (error) {
      console.error("LOI delete error:", error);
      showMessage("Unable to delete LOI. Please try again.");
    }
  };

  const totalAmount = lois.reduce(
    (sum, item) => sum + Number(item.loiTotalAmount || 0),
    0
  );

  const pendingCount = lois.filter(
    (item) => String(item.status).toLowerCase() === "pending"
  ).length;

  const approvedCount = lois.filter(
    (item) => String(item.status).toLowerCase() === "approved"
  ).length;

  return (
    <div className="loi-page">
      {toast && <Toast message={toast} />}

      <div className="loi-stats">
        <StatCard
          icon={<FileText size={21} />}
          title="Total LOIs"
          value={lois.length}
        />

        <StatCard
          icon={<Clock size={21} />}
          title="Pending LOIs"
          value={pendingCount}
        />

        <StatCard
          icon={<CheckCircle size={21} />}
          title="Approved LOIs"
          value={approvedCount}
        />

        <StatCard
          icon={<IndianRupee size={21} />}
          title="Total LOI Amount"
          value={formatCurrency(totalAmount)}
        />
      </div>

      <div className="loi-content-container">
        <div className="loi-content-header">
          <h2>Letter of Intent</h2>
          <p>Manage and track all your LOI records.</p>
        </div>

        <div className="loi-table-container">
          {loading ? (
            <div className="loi-loading">Loading LOI records...</div>
          ) : (
            <Table
              data={lois}
              columns={columns}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(id) => {
                setDeleteId(id);
                setShowDelete(true);
              }}
              type="loi"
            />
          )}
        </div>
      </div>

      {/* View LOI Modal */}
      <Modal isOpen={showView} onClose={() => setShowView(false)}>
        {selectedLOI && (
          <div className="loi-view-content">
            <div className="loi-view-header">
              <div>
                <h2>Purchase Letter of Intent</h2>
                <p>LOI details and purchase information</p>
              </div>

              <Badge type={getBadgeType(selectedLOI.status)}>
                {selectedLOI.status}
              </Badge>
            </div>

            <DetailsSection
              title="LOI Information"
              fields={[
                {
                  label: "LOI Number",
                  value: selectedLOI.loiNumber,
                },
                {
                  label: "Vendor Name",
                  value: selectedLOI.vendorName,
                },
                {
                  label: "Quotation Number",
                  value: selectedLOI.quotationNumber,
                },
                {
                  label: "LOI Date",
                  value: formatDate(selectedLOI.loiDate),
                },
              ]}
            />

            <DetailsSection
              title="Item & Pricing"
              fields={[
                {
                  label: "Item Name",
                  value: selectedLOI.itemName,
                },
                {
                  label: "Quantity",
                  value: selectedLOI.quantity,
                },
                {
                  label: "Unit Price",
                  value: formatCurrency(selectedLOI.unitPrice),
                },
                {
                  label: "Line Total",
                  value: formatCurrency(selectedLOI.lineTotal),
                },
              ]}
            />

            <div className="loi-view-total">
              <span>LOI Total Amount</span>
              <strong>
                {formatCurrency(selectedLOI.loiTotalAmount)}
              </strong>
            </div>

            <div className="loi-view-actions">
              <Button onClick={() => setShowView(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)}>
        <div className="loi-delete-content">
          <div className="loi-delete-icon">
            <Trash2 size={24} />
          </div>

          <h2>Delete LOI?</h2>
          <p>
            Are you sure you want to delete this LOI? This action cannot be
            undone.
          </p>

          <div className="loi-delete-actions">
            <Button onClick={() => setShowDelete(false)}>
              Cancel
            </Button>

            <Button
              className="loi-delete-button"
              onClick={handleDelete}
            >
              <Trash2 size={15} />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LOI;
