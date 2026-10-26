
import { useMemo, useState } from "react";
import {
  Plus,
  Filter,
  X,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Button from "../component/Button";
import Table from "../component/Table";
import Dropdown from "../component/Dropdown";
import DatePicker from "../component/DatePicker";
import Modal from "../component/Modal1";
import StatCard from "../StatCard";
import PurchaseReceiptForm from "./PurchaseReceiptForm.jsx";

import "../styles/PurchaseReceipt.css";

const initialReceipts = [
  {
    id: 1,
    grnNumber: "GRN-2026-001",
    receiptCode: "PR-2026-001",
    receiptDate: "2026-10-26",
    poNumber: "PO-1001",
    supplierName: "ABC Suppliers",
    warehouse: "Main Warehouse",
    deliveryNoteNo: "DN-001",
    receivedBy: "Admin",
    totalItems: 2,
    inspectionStatus: "Passed",
    status: "Accepted",
  },
  {
    id: 2,
    grnNumber: "GRN-2026-002",
    receiptCode: "PR-2026-002",
    receiptDate: "2026-10-25",
    poNumber: "PO-1002",
    supplierName: "Global Electronics",
    warehouse: "Raw Material Warehouse",
    deliveryNoteNo: "DN-002",
    receivedBy: "Manager",
    totalItems: 2,
    inspectionStatus: "Pending",
    status: "Pending",
  },
  {
    id: 3,
    grnNumber: "GRN-2026-003",
    receiptCode: "PR-2026-003",
    receiptDate: "2026-10-24",
    poNumber: "PO-1003",
    supplierName: "Sri Murugan Traders",
    warehouse: "Distribution Center",
    deliveryNoteNo: "DN-003",
    receivedBy: "Admin",
    totalItems: 1,
    inspectionStatus: "Failed",
    status: "Rejected",
  },
];

const inspectionOptions = [
  { label: "All Inspection Status", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Passed", value: "Passed" },
  { label: "Failed", value: "Failed" },
  { label: "Partially Passed", value: "Partially Passed" },
];

const receiptStatusOptions = [
  { label: "All Receipt Status", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const warehouseOptions = [
  { label: "All Warehouses", value: "" },
  { label: "Main Warehouse", value: "Main Warehouse" },
  { label: "Distribution Center", value: "Distribution Center" },
  { label: "Raw Material Warehouse", value: "Raw Material Warehouse" },
  { label: "Finished Goods Warehouse", value: "Finished Goods Warehouse" },
];

const columns = [
  { key: "grnNumber", label: "GRN Number" },
  { key: "receiptDate", label: "Receipt Date", format: "date" },
  { key: "poNumber", label: "PO Number" },
  { key: "supplierName", label: "Supplier Name" },
  { key: "warehouse", label: "Warehouse" },
  { key: "deliveryNoteNo", label: "Delivery Note No." },
  { key: "receivedBy", label: "Received By" },
  { key: "totalItems", label: "Total Items" },
  { key: "inspectionStatus", label: "Inspection Status" },
  { key: "status", label: "Receipt Status" },
];

function getInspectionStatus(items = []) {
  const statuses = items.map((item) => item.inspection);

  if (statuses.length && statuses.every((status) => status === "Passed")) {
    return "Passed";
  }

  if (statuses.some((status) => status === "Failed")) {
    return "Failed";
  }

  if (statuses.some((status) => status === "Partially Passed")) {
    return "Partially Passed";
  }

  return "Pending";
}

function getReceiptStatus(items = []) {
  if (items.some((item) => Number(item.rejectedQty ?? item.rejected) > 0)) {
    return "Rejected";
  }

  if (items.length && items.every((item) => item.inspection === "Passed")) {
    return "Accepted";
  }

  return "Pending";
}

function PurchaseReceipt() {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [search, setSearch] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [warehouse, setWarehouse] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);

  const filteredReceipts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const searchableValues = [
        receipt.grnNumber,
        receipt.receiptCode,
        receipt.poNumber,
        receipt.supplierName,
        receipt.warehouse,
        receipt.deliveryNoteNo,
        receipt.receivedBy,
      ];

      const matchesSearch = searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesInspection =
        !inspectionStatus ||
        receipt.inspectionStatus === inspectionStatus;

      const matchesReceiptStatus =
        !receiptStatus || receipt.status === receiptStatus;

      const matchesWarehouse =
        !warehouse || receipt.warehouse === warehouse;

      const matchesFromDate =
        !fromDate || receipt.receiptDate >= fromDate;

      const matchesToDate =
        !toDate || receipt.receiptDate <= toDate;

      return (
        matchesSearch &&
        matchesInspection &&
        matchesReceiptStatus &&
        matchesWarehouse &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    receipts,
    search,
    inspectionStatus,
    receiptStatus,
    warehouse,
    fromDate,
    toDate,
  ]);

  const stats = [
    {
      title: "Total Receipts",
      value: receipts.length,
      icon: <ClipboardList size={20} />,
    },
    {
      title: "Awaiting Inspection",
      value: receipts.filter(
        (receipt) => receipt.inspectionStatus === "Pending"
      ).length,
      icon: <Clock size={20} />,
    },
    {
      title: "Inspected",
      value: receipts.filter((receipt) =>
        ["Passed", "Failed", "Partially Passed"].includes(
          receipt.inspectionStatus
        )
      ).length,
      icon: <CheckCircle size={20} />,
    },
    {
      title: "Rejected",
      value: receipts.filter(
        (receipt) =>
          receipt.status === "Rejected" ||
          receipt.inspectionStatus === "Failed"
      ).length,
      icon: <XCircle size={20} />,
    },
  ];

  const openCreateModal = () => {
    setEditingReceipt(null);
    setModalOpen(true);
  };

  const openEditModal = (receipt) => {
    setEditingReceipt(receipt);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingReceipt(null);
  };

  const handleCreate = (receiptData) => {
    const po = receiptData.purchaseOrder;
    const items = receiptData.items || [];

    const row = {
      id: editingReceipt?.id ?? Date.now(),
      grnNumber:
        editingReceipt?.grnNumber ??
        `GRN-${new Date().getFullYear()}-${String(
          receipts.length + 1
        ).padStart(3, "0")}`,
      receiptCode: receiptData.receiptCode || "",
      receiptDate: receiptData.receivedAt
        ? receiptData.receivedAt.slice(0, 10)
        : "",
      poNumber: po?.number || receiptData.purchaseOrderId || "-",
      supplierName: po?.supplier || "-",
      warehouse:
        typeof receiptData.warehouse === "string"
          ? receiptData.warehouse
          : receiptData.warehouse?.label || "-",
      deliveryNoteNo: receiptData.deliveryNoteNumber || "-",
      receivedBy: receiptData.receivedBy || "-",
      totalItems: items.length,
      inspectionStatus: getInspectionStatus(items),
      status: getReceiptStatus(items),
      receiptData,
    };

    if (editingReceipt) {
      setReceipts((previous) =>
        previous.map((item) =>
          item.id === editingReceipt.id ? row : item
        )
      );
    } else {
      setReceipts((previous) => [row, ...previous]);
    }

    closeFormModal();
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this receipt?"
    );

    if (confirmed) {
      setReceipts((previous) =>
        previous.filter((receipt) => receipt.id !== id)
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setInspectionStatus("");
    setReceiptStatus("");
    setWarehouse("");
    setFromDate("");
    setToDate("");
  };

  const hasFilters =
    search ||
    inspectionStatus ||
    receiptStatus ||
    warehouse ||
    fromDate ||
    toDate;

  return (
    <div className="purchase-receipt-page">
      <header className="purchase-receipt-heading">
        <div>
          <h1>Purchase Receipts</h1>
          <p>Manage received goods and track inspection status.</p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Create Receipt
        </Button>
      </header>

      <div className="pr-stat-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="pr-filter-toolbar">
        <input
          type="text"
          className="pr-search-input"
          placeholder="Search GRN, PO, supplier..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Dropdown
          options={inspectionOptions}
          value={inspectionStatus}
          onChange={setInspectionStatus}
          placeholder="Inspection Status"
        />

        <Dropdown
          options={receiptStatusOptions}
          value={receiptStatus}
          onChange={setReceiptStatus}
          placeholder="Receipt Status"
        />

        <Button
          type="button"
          onClick={() => setShowFilters((previous) => !previous)}
        >
          <Filter size={16} />
          Filters
        </Button>

        {hasFilters && (
          <Button type="button" onClick={clearFilters}>
            <X size={15} />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="pr-advanced-filters">
          <Dropdown
            options={warehouseOptions}
            value={warehouse}
            onChange={setWarehouse}
            placeholder="All Warehouses"
          />

          <DatePicker
            label="From Date"
            name="fromDate"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />

          <DatePicker
            label="To Date"
            name="toDate"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>
      )}

      <div className="pr-table-heading">
        <div>
          <h2>Receipt Records</h2>
          <p>{filteredReceipts.length} receipts found</p>
        </div>
      </div>

      <Table
        data={filteredReceipts}
        columns={columns}
        type="receipt"
        itemsPerPage={10}
        showSearch={false}
        showCategoryFilter={false}
        showStatusFilter={false}
        onView={setViewReceipt}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={closeFormModal}>
        <PurchaseReceiptForm
          key={editingReceipt?.id ?? "new-receipt"}
          onCancel={closeFormModal}
          onCreate={handleCreate}
          initialData={editingReceipt?.receiptData ?? null}
          mode={editingReceipt ? "edit" : "create"}
        />
      </Modal>

      <Modal
        isOpen={Boolean(viewReceipt)}
        onClose={() => setViewReceipt(null)}
      >
        {viewReceipt && (
          <div className="pr-view-modal">
            <h2>Purchase Receipt Details</h2>

            <div className="pr-view-grid">
              {[
                ["GRN Number", viewReceipt.grnNumber],
                ["Receipt Date", viewReceipt.receiptDate],
                ["PO Number", viewReceipt.poNumber],
                ["Supplier", viewReceipt.supplierName],
                ["Warehouse", viewReceipt.warehouse],
                ["Delivery Note No.", viewReceipt.deliveryNoteNo],
                ["Received By", viewReceipt.receivedBy],
                ["Total Items", viewReceipt.totalItems],
                ["Inspection Status", viewReceipt.inspectionStatus],
                ["Receipt Status", viewReceipt.status],
              ].map(([label, value]) => (
                <div className="pr-view-field" key={label}>
                  <span>{label}</span>
                  <strong>{value || "-"}</strong>
                </div>
              ))}
            </div>

            <div className="pr-actions">
              <Button onClick={() => setViewReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PurchaseReceipt;