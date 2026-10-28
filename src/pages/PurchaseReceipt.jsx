import { useMemo, useState, useCallback, useRef, useEffect } from "react";
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
import Badge from "../component/Atom/Badge";
import DetailsField from "../component/Atom/DetailsField";
import PurchaseReceiptForm from "./PurchaseReceiptForm";

import "../styles/PurchaseReceipt.css";

// Replace these paths with the backend team's final API routes if they differ.
const API_BASE = "/api/purchase-receipts";
const WAREHOUSE_API = "/api/warehouses";

const columns = [
  { key: "poNumber", label: "PO Number", editable: true },
  {
    key: "receiptDate",
    label: "Receipt Date",
    editable: true,
    type: "date",
    format: "date",
  },
  { key: "supplierName", label: "Supplier Name", editable: true },
  { key: "warehouse", label: "Warehouse", editable: true },
  { key: "receivedBy", label: "Received By", editable: true },
  { key: "totalItems", label: "Total Items", editable: true, type: "number" },
  { key: "inspectionStatus", label: "Inspection Status", editable: true },
  { key: "status", label: "Receipt Status", editable: true },
];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Request failed (${response.status})`
    );
  }

  return result;
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.receipts)) return response.receipts;
  if (Array.isArray(response?.warehouses)) return response.warehouses;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

function normalizeInspection(value) {
  return String(value || "Pending")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInspectionStatus(items = []) {
  const statuses = items.map((item) =>
    normalizeInspection(item.inspectionStatus ?? item.inspection)
  );

  if (statuses.length && statuses.every((value) => value === "Passed")) {
    return "Passed";
  }

  if (statuses.some((value) => value === "Failed")) return "Failed";

  if (statuses.some((value) => value === "Partially Passed")) {
    return "Partially Passed";
  }

  return "Pending";
}

function getReceiptStatus(items = []) {
  if (
    items.some(
      (item) =>
        Number(
          item.rejectedQty ??
            item.rejectedQuantity ??
            item.rejected ??
            0
        ) > 0
    )
  ) {
    return "Rejected";
  }

  if (
    items.length &&
    items.every(
      (item) =>
        normalizeInspection(item.inspectionStatus ?? item.inspection) ===
        "Passed"
    )
  ) {
    return "Accepted";
  }

  return "Pending";
}

function getBadgeVariant(value) {
  const normalized = String(value || "").toLowerCase().trim();

  if (
    ["passed", "accepted", "received", "completed"].includes(normalized)
  ) {
    return "success";
  }

  if (
    ["pending", "partially passed", "partially received"].includes(normalized)
  ) {
    return "warning";
  }

  if (
    ["failed", "rejected", "cancelled", "canceled"].includes(normalized)
  ) {
    return "danger";
  }

  return "default";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN");
}

function getWarehouseName(warehouse) {
  if (typeof warehouse === "string") return warehouse;
  return warehouse?.label || warehouse?.name || "-";
}

function getReceiptItems(receipt) {
  if (Array.isArray(receipt?.items) && receipt.items.length) {
    return receipt.items;
  }

  if (
    Array.isArray(receipt?.receiptData?.items) &&
    receipt.receiptData.items.length
  ) {
    return receipt.receiptData.items;
  }

  return [];
}

function normalizeReceipt(receipt) {
  const source = receipt?.receiptData
    ? { ...receipt.receiptData, ...receipt }
    : receipt;

  const items = Array.isArray(source?.items) ? source.items : [];
  const receiptDate = String(
    source?.receiptDate ?? source?.receivedAt ?? ""
  ).slice(0, 10);

  const warehouse =
    getWarehouseName(source?.warehouse) !== "-"
      ? getWarehouseName(source?.warehouse)
      : source?.warehouseName ?? source?.warehouseId ?? "-";

  const normalizedItems = items.map((item) => ({
    ...item,
    inspection: normalizeInspection(
      item.inspection ?? item.inspectionStatus
    ),
    inspectionStatus: normalizeInspection(
      item.inspectionStatus ?? item.inspection
    ),
    receivedQty: Number(
      item.receivedQty ?? item.receivedQuantity ?? item.received ?? 0
    ),
    acceptedQty: Number(
      item.acceptedQty ?? item.acceptedQuantity ?? item.accepted ?? 0
    ),
    rejectedQty: Number(
      item.rejectedQty ?? item.rejectedQuantity ?? item.rejected ?? 0
    ),
  }));

  return {
    ...source,
    id: source?.id ?? source?.receiptId,
    grnNumber: source?.grnNumber ?? source?.grn_number ?? "",
    receiptCode: source?.receiptCode ?? source?.receipt_code ?? "",
    receiptDate,
    poNumber:
      source?.poNumber ??
      source?.purchaseOrderNumber ??
      source?.purchase_order_number ??
      source?.purchaseOrder?.number ??
      "",
    purchaseOrderId:
      source?.purchaseOrderId ??
      source?.purchase_order_id ??
      source?.purchaseOrder?.id ??
      "",
    supplierName:
      source?.supplierName ??
      source?.supplier_name ??
      source?.supplier?.name ??
      source?.purchaseOrder?.supplier ??
      "",
    warehouse,
    currency: source?.currency ?? "INR",
    deliveryNoteNo:
      source?.deliveryNoteNo ?? source?.deliveryNoteNumber ?? "",
    vehicleNumber: source?.vehicleNumber ?? "",
    receivedBy: source?.receivedBy ?? source?.received_by ?? "",
    totalItems: source?.totalItems ?? normalizedItems.length,
    inspectionStatus:
      source?.inspectionStatus ?? getInspectionStatus(normalizedItems),
    status: source?.status ?? getReceiptStatus(normalizedItems),
    totalReceived:
      source?.totalReceived ??
      normalizedItems.reduce((sum, item) => sum + item.receivedQty, 0),
    totalAccepted:
      source?.totalAccepted ??
      normalizedItems.reduce((sum, item) => sum + item.acceptedQty, 0),
    totalRejected:
      source?.totalRejected ??
      normalizedItems.reduce((sum, item) => sum + item.rejectedQty, 0),
    items: normalizedItems,
    receiptData: source?.receiptData ?? source,
  };
}

function PurchaseReceipt() {
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
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

  const receiptsRef = useRef(receipts);

  useEffect(() => {
    receiptsRef.current = receipts;
  }, [receipts]);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await apiRequest(API_BASE);
      const list = extractList(response).map(normalizeReceipt);
      setReceipts(list);
    } catch (error) {
      setPageError(
        `${error.message}. Check the Purchase Receipt API connection.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWarehouses = useCallback(async () => {
    try {
      const response = await apiRequest(WAREHOUSE_API);
      setWarehouses(extractList(response));
    } catch (error) {
      console.error("Unable to load warehouses:", error);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
    loadWarehouses();
  }, [loadReceipts, loadWarehouses]);

  const inspectionOptions = useMemo(() => {
    const values = [
      ...new Set(
        receipts
          .map((receipt) => normalizeInspection(receipt.inspectionStatus))
          .filter(Boolean)
      ),
    ];

    return [
      { label: "All Inspection Status", value: "" },
      ...values.map((value) => ({ label: value, value })),
    ];
  }, [receipts]);

  const receiptStatusOptions = useMemo(() => {
    const values = [
      ...new Set(
        receipts.map((receipt) => String(receipt.status || "").trim()).filter(Boolean)
      ),
    ];

    return [
      { label: "All Receipt Status", value: "" },
      ...values.map((value) => ({ label: value, value })),
    ];
  }, [receipts]);

  const warehouseOptions = useMemo(() => {
    const values = [
      ...new Set([
        ...warehouses
          .map((item) =>
            typeof item === "string"
              ? item
              : item.name ?? item.warehouseName ?? item.label
          )
          .filter(Boolean),
        ...receipts.map((receipt) => receipt.warehouse).filter(Boolean),
      ]),
    ];

    return [
      { label: "All Warehouses", value: "" },
      ...values.map((value) => ({ label: value, value })),
    ];
  }, [warehouses, receipts]);

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

      return (
        (!query ||
          searchableValues.some((value) =>
            String(value ?? "").toLowerCase().includes(query)
          )) &&
        (!inspectionStatus || receipt.inspectionStatus === inspectionStatus) &&
        (!receiptStatus || receipt.status === receiptStatus) &&
        (!warehouse || receipt.warehouse === warehouse) &&
        (!fromDate || receipt.receiptDate >= fromDate) &&
        (!toDate || receipt.receiptDate <= toDate)
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

  const stats = useMemo(
    () => [
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
    ],
    [receipts]
  );

  const openCreateModal = () => {
    setActionError("");
    setEditingReceipt(null);
    setModalOpen(true);
  };

  const openEditModal = (receipt) => {
    const latestReceipt =
      receiptsRef.current.find((item) => item.id === receipt.id) ?? receipt;

    setActionError("");
    setEditingReceipt(latestReceipt);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingReceipt(null);
  };

  const buildReceiptRow = useCallback((receiptData, existingReceipt = null) => {
    const po = receiptData.purchaseOrder;
    const incomingItems = Array.isArray(receiptData.items)
      ? receiptData.items
      : [];

    const normalizedItems = incomingItems.map((item) => ({
      ...item,
      inspection: normalizeInspection(
        item.inspection ?? item.inspectionStatus
      ),
      inspectionStatus: normalizeInspection(
        item.inspectionStatus ?? item.inspection
      ),
      receivedQty: Number(
        item.receivedQty ?? item.receivedQuantity ?? item.received ?? 0
      ),
      acceptedQty: Number(
        item.acceptedQty ?? item.acceptedQuantity ?? item.accepted ?? 0
      ),
      rejectedQty: Number(
        item.rejectedQty ?? item.rejectedQuantity ?? item.rejected ?? 0
      ),
    }));

    const receiptDate = String(
      receiptData.receiptDate ??
        receiptData.receivedAt ??
        existingReceipt?.receiptDate ??
        ""
    ).slice(0, 10);

    const id = existingReceipt?.id ?? receiptData.id;

    const poNumber =
      po?.number ??
      receiptData.poNumber ??
      receiptData.purchaseOrderNumber ??
      existingReceipt?.poNumber ??
      receiptData.purchaseOrderId ??
      "-";

    const supplierName =
      po?.supplier ??
      receiptData.supplierName ??
      existingReceipt?.supplierName ??
      "-";

    const incomingWarehouse = getWarehouseName(receiptData.warehouse);

    const warehouseName =
      incomingWarehouse !== "-"
        ? incomingWarehouse
        : receiptData.warehouseId ??
          existingReceipt?.warehouse ??
          "-";

    const hasItems = normalizedItems.length > 0;
    const previousReceiptData = existingReceipt?.receiptData ?? {};

    const row = {
      id,
      grnNumber:
        receiptData.grnNumber ?? existingReceipt?.grnNumber ?? "",
      receiptCode:
        receiptData.receiptCode ?? existingReceipt?.receiptCode ?? "",
      receiptDate,
      poNumber,
      purchaseOrderId:
        receiptData.purchaseOrderId ??
        po?.id ??
        existingReceipt?.purchaseOrderId ??
        "",
      supplierName,
      warehouse: warehouseName,
      currency: receiptData.currency ?? existingReceipt?.currency ?? "INR",
      deliveryNoteNo:
        receiptData.deliveryNoteNumber ??
        receiptData.deliveryNoteNo ??
        existingReceipt?.deliveryNoteNo ??
        "",
      vehicleNumber:
        receiptData.vehicleNumber ?? existingReceipt?.vehicleNumber ?? "",
      receivedBy: receiptData.receivedBy ?? existingReceipt?.receivedBy ?? "",
      totalItems: hasItems
        ? normalizedItems.length
        : existingReceipt?.totalItems ?? 0,
      inspectionStatus: hasItems
        ? getInspectionStatus(normalizedItems)
        : existingReceipt?.inspectionStatus ?? "Pending",
      status: hasItems
        ? getReceiptStatus(normalizedItems)
        : existingReceipt?.status ?? "Pending",
      totalReceived:
        receiptData.totalReceived ?? existingReceipt?.totalReceived ?? 0,
      totalAccepted:
        receiptData.totalAccepted ?? existingReceipt?.totalAccepted ?? 0,
      totalRejected:
        receiptData.totalRejected ?? existingReceipt?.totalRejected ?? 0,
      items: hasItems ? normalizedItems : existingReceipt?.items ?? [],
    };

    row.receiptData = {
      ...previousReceiptData,
      ...receiptData,
      id,
      receiptDate,
      poNumber,
      purchaseOrderId: row.purchaseOrderId,
      purchaseOrder:
        po ?? receiptData.purchaseOrder ?? previousReceiptData.purchaseOrder,
      supplierName,
      warehouse: warehouseName,
      warehouseId:
        receiptData.warehouseId ??
        previousReceiptData.warehouseId ??
        warehouseName,
      deliveryNoteNumber: receiptData.deliveryNoteNumber ?? row.deliveryNoteNo,
      items: row.items,
      totalReceived: row.totalReceived,
      totalAccepted: row.totalAccepted,
      totalRejected: row.totalRejected,
    };

    return row;
  }, []);

  const handleCreate = async (receiptData) => {
    setActionError("");

    try {
      const existingId = editingReceipt?.id ?? receiptData.id;
      const isUpdating = Boolean(existingId);

      const savedResponse = await apiRequest(
        isUpdating ? `${API_BASE}/${existingId}` : API_BASE,
        {
          method: isUpdating ? "PUT" : "POST",
          body: JSON.stringify(receiptData),
        }
      );

      const savedRecord =
        savedResponse?.data ??
        savedResponse?.receipt ??
        savedResponse;

      const row = buildReceiptRow(
        {
          ...receiptData,
          ...(savedRecord && typeof savedRecord === "object"
            ? savedRecord
            : {}),
        },
        isUpdating
          ? receiptsRef.current.find(
              (receipt) => String(receipt.id) === String(existingId)
            )
          : null
      );

      if (row.id == null) {
        await loadReceipts();
      } else {
        setReceipts((previous) => {
          const alreadyExists = previous.some(
            (receipt) => String(receipt.id) === String(row.id)
          );

          return alreadyExists
            ? previous.map((receipt) =>
                String(receipt.id) === String(row.id)
                  ? { ...receipt, ...row }
                  : receipt
              )
            : [row, ...previous];
        });
      }

      closeFormModal();
    } catch (error) {
      setActionError(`Unable to save receipt: ${error.message}`);
      throw error;
    }
  };

  const handleReceiptAutoSave = useCallback(
    async (updatedReceipt) => {
      if (!updatedReceipt || !editingReceipt?.id) return;

      const targetId = editingReceipt.id;
      const existingReceipt = receiptsRef.current.find(
        (receipt) => String(receipt.id) === String(targetId)
      );

      if (!existingReceipt) return;

      const row = buildReceiptRow(
        { ...updatedReceipt, id: targetId },
        existingReceipt
      );

      // Draft autosave remains local until the backend team provides a draft API.
      setReceipts((previous) =>
        previous.map((receipt) =>
          String(receipt.id) === String(targetId)
            ? { ...receipt, ...row }
            : receipt
        )
      );
    },
    [editingReceipt, buildReceiptRow]
  );

  const handleInlineSave = async (updatedReceipt) => {
    if (!updatedReceipt?.id) return;

    const existingReceipt = receiptsRef.current.find(
      (receipt) => String(receipt.id) === String(updatedReceipt.id)
    );

    if (!existingReceipt) return;

    const row = buildReceiptRow(updatedReceipt, existingReceipt);

    try {
      await apiRequest(`${API_BASE}/${updatedReceipt.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...existingReceipt.receiptData,
          ...updatedReceipt,
        }),
      });

      setReceipts((previous) =>
        previous.map((receipt) =>
          String(receipt.id) === String(row.id)
            ? { ...receipt, ...row }
            : receipt
        )
      );
    } catch (error) {
      setActionError(`Unable to update receipt: ${error.message}`);
      await loadReceipts();
    }
  };

  const handleDelete = async (receiptOrId) => {
    const id =
      typeof receiptOrId === "object" ? receiptOrId?.id : receiptOrId;

    if (id == null) return;

    if (!window.confirm("Are you sure you want to delete this receipt?")) {
      return;
    }

    setActionError("");

    try {
      await apiRequest(`${API_BASE}/${id}`, { method: "DELETE" });

      setReceipts((previous) =>
        previous.filter((receipt) => String(receipt.id) !== String(id))
      );

      setViewReceipt((previous) =>
        String(previous?.id) === String(id) ? null : previous
      );

      setEditingReceipt((previous) =>
        String(previous?.id) === String(id) ? null : previous
      );
    } catch (error) {
      setActionError(`Unable to delete receipt: ${error.message}`);
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

  const hasFilters = Boolean(
    search || inspectionStatus || receiptStatus || warehouse || fromDate || toDate
  );

  const receiptItems = getReceiptItems(viewReceipt);

  return (
    <div className="purchase-receipt-page">
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

      <section className="receipt-records-container">
        <div className="receipt-records-header">
          <div className="receipt-records-title">
            <h2>Receipt Records</h2>
            <p>{loading ? "Loading receipts..." : `${filteredReceipts.length} receipts found`}</p>
          </div>

          <Button type="button" onClick={openCreateModal}>
            <Plus size={16} />
            Add Receipt
          </Button>
        </div>

        {pageError && (
          <div className="pr-error" role="alert">
            {pageError}
            <Button type="button" onClick={loadReceipts}>
              Retry
            </Button>
          </div>
        )}

        {actionError && (
          <div className="pr-error" role="alert">
            {actionError}
            <Button type="button" onClick={() => setActionError("")}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="pr-filter-toolbar">
          <input
            type="text"
            className="pr-search-input"
            placeholder="Search GRN, PO, supplier..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="pr-filter-dropdown">
            <Dropdown
              options={inspectionOptions}
              value={inspectionStatus}
              onChange={setInspectionStatus}
              placeholder="All Inspection Status"
            />
          </div>

          <div className="pr-filter-dropdown">
            <Dropdown
              options={receiptStatusOptions}
              value={receiptStatus}
              onChange={setReceiptStatus}
              placeholder="All Receipt Status"
            />
          </div>

          <Button
            type="button"
            className="secondary-button"
            onClick={() => setShowFilters((previous) => !previous)}
          >
            <Filter size={16} />
            Filters
          </Button>

          {hasFilters && (
            <Button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              <X size={15} />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="pr-advanced-filters">
            <div className="pr-filter-dropdown">
              <Dropdown
                options={warehouseOptions}
                value={warehouse}
                onChange={setWarehouse}
                placeholder="All Warehouses"
              />
            </div>

            <div className="pr-date-filter">
              <label>From Date</label>
              <DatePicker value={fromDate} onChange={setFromDate} />
            </div>

            <div className="pr-date-filter">
              <label>To Date</label>
              <DatePicker value={toDate} onChange={setToDate} />
            </div>
          </div>
        )}

        <div className="receipt-records-table">
          {loading ? (
            <p>Loading purchase receipts...</p>
          ) : (
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
              onUpdate={handleInlineSave}
            />
          )}

          {!loading && !pageError && filteredReceipts.length === 0 && (
            <p className="pr-view-empty">No matching records found.</p>
          )}
        </div>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={closeFormModal}
        closeOnEnter={false}
        closeOnOutsideClick={false}
      >
        <PurchaseReceiptForm
          key={editingReceipt?.id ?? "new-receipt"}
          onCancel={closeFormModal}
          onCreate={handleCreate}
          onDraftChange={
            editingReceipt ? handleReceiptAutoSave : undefined
          }
          initialData={
            editingReceipt
              ? editingReceipt.receiptData ?? editingReceipt
              : null
          }
          mode={editingReceipt ? "edit" : "create"}
        />
      </Modal>

      <Modal
        isOpen={Boolean(viewReceipt)}
        onClose={() => setViewReceipt(null)}
      >
        {viewReceipt && (
          <div className="pr-view-modal">
            <div className="pr-view-header">
              <div>
                <h2>Purchase Receipt Details</h2>
                <p>Receipt information and received item inspection</p>
              </div>

              <Badge variant={getBadgeVariant(viewReceipt.status)}>
                {viewReceipt.status || "-"}
              </Badge>
            </div>

            <section className="pr-view-section">
              <h3>Receipt Information</h3>

              <div className="pr-view-grid">
                <DetailsField label="GRN Number" value={viewReceipt.grnNumber} />
                <DetailsField label="Receipt Code" value={viewReceipt.receiptCode} />
                <DetailsField
                  label="Receipt Date"
                  value={formatDate(viewReceipt.receiptDate)}
                />
                <DetailsField label="PO Number" value={viewReceipt.poNumber} />
                <DetailsField label="Supplier" value={viewReceipt.supplierName} />
                <DetailsField label="Warehouse" value={viewReceipt.warehouse} />
                <DetailsField label="Received By" value={viewReceipt.receivedBy} />
                <DetailsField
                  label="Delivery Note No."
                  value={viewReceipt.deliveryNoteNo}
                />
              </div>
            </section>

            <section className="pr-view-section">
              <h3>Inspection Summary</h3>

              <div className="pr-view-grid">
                <DetailsField label="Total Items" value={viewReceipt.totalItems} />

                <div className="details-field">
                  <span className="details-field-label">Inspection Status</span>
                  <Badge variant={getBadgeVariant(viewReceipt.inspectionStatus)}>
                    {viewReceipt.inspectionStatus || "-"}
                  </Badge>
                </div>

                <div className="details-field">
                  <span className="details-field-label">Receipt Status</span>
                  <Badge variant={getBadgeVariant(viewReceipt.status)}>
                    {viewReceipt.status || "-"}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="pr-view-section">
              <h3>Received Items</h3>

              {receiptItems.length > 0 ? (
                <div className="pr-view-items">
                  {receiptItems.map((item, index) => (
                    <div
                      className="pr-view-item"
                      key={
                        item.id ??
                        item.purchaseOrderItemId ??
                        item.itemId ??
                        index
                      }
                    >
                      <div className="pr-view-item-info">
                        <strong>
                          {item.itemName ||
                            item.name ||
                            item.itemDescription ||
                            item.description ||
                            item.productName ||
                            "Item"}
                        </strong>

                        <span>
                          {item.itemCode || item.code || item.itemId || "-"}
                        </span>
                      </div>

                      <div className="pr-view-item-quantity">
                        <strong>
                          {item.receivedQuantity ??
                            item.receivedQty ??
                            item.received ??
                            item.quantity ??
                            0}{" "}
                          {item.unit || item.quantityUnit || "PCS"}
                        </strong>

                        <Badge
                          variant={getBadgeVariant(
                            normalizeInspection(
                              item.inspectionStatus ?? item.inspection
                            )
                          )}
                        >
                          {normalizeInspection(
                            item.inspectionStatus ?? item.inspection
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pr-view-empty">
                  No received item details available.
                </div>
              )}
            </section>

            <div className="pr-actions">
              <Button
                type="button"
                className="secondary-button"
                onClick={() => setViewReceipt(null)}
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

export default PurchaseReceipt;
