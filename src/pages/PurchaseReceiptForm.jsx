
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { purchaseReceiptSchema } from "../schema/purchaseReceiptSchema.js";
import FormField from "../component/Atom/FormField-LIE.jsx";
import SearchBox from "../component/SearchBox.jsx";
import DatePicker from "../component/DatePicker.jsx";
import Textarea from "../component/Atom/Textarea.jsx";
import Dropdown from "../component/Dropdown.jsx";
import Checkbox from "../component/Checkbox.jsx";
import Toggle from "../component/Toggle.jsx";
import Button from "../component/Button.jsx";
import "../styles/PurchaseReceiptForm.css";

const API_BASE_URL = "http://localhost:5000/api";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${path} (${response.status})`);
  }

  const result = await response.json();

  return Array.isArray(result)
    ? result
    : result.data ?? result.items ?? result.results ?? [];
}

const fetchPurchaseOrders = () => apiGet("/purchase-orders");
const fetchWarehouses = () => apiGet("/warehouses");
const fetchFormOptions = () => apiGet("/purchase-receipts/form-options");

const fetchWarehouseZones = (warehouseId) =>
  apiGet(`/warehouses/${encodeURIComponent(warehouseId)}/zones`);

const tabs = [
  "Purchase Order Details",
  "Receipt Information",
  "Received Items",
  "Receipt Summary",
  "Purchase Return Policy",
  "Additional Details",
];

const today = () => new Date().toISOString().slice(0, 10);

const initialPolicy = {
  policyName: "",
  description: "",
  effectiveFrom: "",
  effectiveUntil: "",
  returnWindow: "",
  windowStartsFrom: "",
  maximumReturnQuantity: "",
  restockingFee: "",
  returnConditions: {},
  allowedResolutionMethods: [],
  policyTerms: "",
  status: "",
};

const getPOFromData = (data, purchaseOrders = []) => {
  if (!data) return null;

  const poNumber =
    data.poNumber ??
    data.purchaseOrderNumber ??
    data.purchaseOrder?.number ??
    data.purchaseOrderId ??
    "";

  return (
    purchaseOrders.find(
      (po) =>
        String(po.id) === String(data.purchaseOrderId) ||
        String(po.number) === String(poNumber) ||
        String(po.id) === String(poNumber)
    ) ??
    data.purchaseOrder ??
    null
  );
};

const normalizePurchaseOrder = (po) => ({
  ...po,
  id: String(po.id ?? po.purchaseOrderId ?? ""),
  number: String(
    po.number ?? po.poNumber ?? po.purchaseOrderNumber ?? ""
  ),
  supplier:
    po.supplier?.name ??
    po.supplierName ??
    po.vendorName ??
    (typeof po.supplier === "string" ? po.supplier : "") ??
    "",
  date: String(po.date ?? po.poDate ?? po.orderDate ?? "").slice(0, 10),
  currency: po.currency ?? "",
  items: (po.items ?? po.purchaseOrderItems ?? []).map((item) => ({
    ...item,
    id: item.id ?? item.purchaseOrderItemId ?? item.itemId,
    code: item.code ?? item.itemCode ?? "",
    description:
      item.description ??
      item.itemDescription ??
      item.productName ??
      item.name ??
      "",
    unit: item.unit ?? item.unitName ?? item.baseUnit ?? "",
    ordered: Number(
      item.ordered ?? item.orderedQuantity ?? item.quantity ?? 0
    ),
    previouslyReceived: Number(
      item.previouslyReceived ??
        item.previousReceived ??
        item.receivedQuantity ??
        0
    ),
    unitCost: Number(item.unitCost ?? item.cost ?? 0),
  })),
});

const normalizeDropdownOptions = (options = []) =>
  options.map((option) => {
    if (Array.isArray(option)) {
      return { label: String(option[1] ?? option[0]), value: String(option[0]) };
    }

    if (typeof option === "string" || typeof option === "number") {
      return { label: String(option), value: String(option) };
    }

    return {
      label: String(option.label ?? option.name ?? option.title ?? ""),
      value: String(option.value ?? option.code ?? option.id ?? ""),
    };
  });

const createReceiptItem = (item) => {
  const ordered = Number(item.ordered ?? item.orderedQuantity ?? 0);
  const previouslyReceived = Number(
    item.previouslyReceived ?? item.previousReceived ?? 0
  );

  return {
    ...item,
    id: item.id ?? item.purchaseOrderItemId ?? item.itemId ?? item.code,
    code: item.code ?? item.itemCode ?? "",
    description:
      item.description ??
      item.itemDescription ??
      item.productName ??
      item.name ??
      "",
    ordered,
    previouslyReceived,
    remaining: Math.max(
      0,
      Number(
        item.remaining ??
          item.remainingQuantity ??
          ordered - previouslyReceived
      )
    ),
    received: "",
    accepted: "",
    rejected: "",
    zone: item.zone ?? item.storageZoneId ?? item.storageZone ?? "",
    inspection: item.inspection ?? item.inspectionStatus ?? "",
    unitCost: Number(item.unitCost ?? item.cost ?? 0),
    rejectionReason: item.rejectionReason ?? "",
    notes: item.notes ?? item.itemNotes ?? "",
  };
};

const normalizeReceiptItem = (item, poItem = {}) => {
  const base = { ...poItem, ...item };
  const normalized = createReceiptItem(base);

  const received =
    base.received ??
    base.receivedQty ??
    base.receivedQuantity ??
    "";

  const rejected =
    base.rejected ??
    base.rejectedQty ??
    base.rejectedQuantity ??
    "";

  const accepted =
    base.accepted ??
    base.acceptedQty ??
    base.acceptedQuantity ??
    (received !== ""
      ? Math.max(0, Number(received) - Number(rejected || 0))
      : "");

  return {
    ...normalized,
    received: received == null ? "" : String(received),
    accepted: accepted == null ? "" : String(accepted),
    rejected: rejected == null ? "" : String(rejected),
    zone: base.zone ?? base.storageZoneId ?? base.storageZone ?? "",
    inspection: String(
      base.inspection ?? base.inspectionStatus ?? ""
    ).replaceAll("_", " "),
    rejectionReason: base.rejectionReason ?? "",
    notes: base.notes ?? base.itemNotes ?? "",
  };
};

function PurchaseReceiptForm({
  onCancel,
  onCreate,
  onDraftChange,
  currentUser = "",
  initialData = null,
  mode = "create",
}) {
  const isEdit = mode === "edit";

  const [activeTab, setActiveTab] = useState(0);
  const [poSearch, setPoSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [showPOSuggestions, setShowPOSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [inspectionOptions, setInspectionOptions] = useState([]);
  const [windowStartOptions, setWindowStartOptions] = useState([]);
  const [resolutionOptions, setResolutionOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [returnConditionOptions, setReturnConditionOptions] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState("");

  const [formData, setFormData] = useState({
    warehouse: "",
    receiptCode: "",
    grnNumber: "",
    receivedBy: currentUser,
    receiptDate: today(),
    receiptNotes: "",
    deliveryNoteNumber: "",
    vehicleNumber: "",
  });

  const [items, setItems] = useState([]);
  const [policyEnabled, setPolicyEnabled] = useState(
    Boolean(initialData?.returnPolicy)
  );
  const [returnPolicy, setReturnPolicy] = useState({
    ...initialPolicy,
    ...(initialData?.returnPolicy || {}),
    returnConditions: {
      ...(initialData?.returnPolicy?.returnConditions || {}),
    },
    allowedResolutionMethods:
      initialData?.returnPolicy?.allowedResolutionMethods || [],
  });
  const [policyProductId, setPolicyProductId] = useState(
    initialData?.returnPolicy?.productId || ""
  );

  const saveTimerRef = useRef(null);
  const mountedRef = useRef(false);
  const latestPayloadRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadDropdownData = async () => {
      setPoLoading(true);
      setDropdownError("");

      try {
        const [orders, warehouses, options] = await Promise.all([
          fetchPurchaseOrders(),
          fetchWarehouses(),
          fetchFormOptions(),
        ]);

        if (cancelled) return;

        setPurchaseOrders(orders.map(normalizePurchaseOrder));

        setWarehouseOptions(
          warehouses.map((warehouse) => ({
            label: String(
              warehouse.name ??
                warehouse.warehouseName ??
                warehouse.label ??
                ""
            ),
            value: String(
              warehouse.id ??
                warehouse.warehouseId ??
                warehouse.value ??
                ""
            ),
          }))
        );

        setInspectionOptions(
          normalizeDropdownOptions(options.inspectionStatuses ?? [])
        );
        setWindowStartOptions(
          normalizeDropdownOptions(options.windowStartsFrom ?? [])
        );
        setResolutionOptions(
          normalizeDropdownOptions(options.resolutionMethods ?? [])
        );
        setStatusOptions(
          normalizeDropdownOptions(options.policyStatuses ?? [])
        );
        setReturnConditionOptions(options.returnConditions ?? []);

        if (options.defaultReturnPolicy) {
          setReturnPolicy((previous) => ({
            ...previous,
            ...options.defaultReturnPolicy,
            returnConditions: {
              ...previous.returnConditions,
              ...(options.defaultReturnPolicy.returnConditions ?? {}),
            },
            allowedResolutionMethods:
              options.defaultReturnPolicy.allowedResolutionMethods ??
              previous.allowedResolutionMethods,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setDropdownError("Unable to load dropdown data from the server.");
          console.error("Purchase receipt dropdown fetch failed:", error);
        }
      } finally {
        if (!cancelled) setPoLoading(false);
      }
    };

    loadDropdownData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadZones = async () => {
      if (!formData.warehouse) {
        setZoneOptions([]);
        return;
      }

      try {
        const zones = await fetchWarehouseZones(formData.warehouse);

        if (!cancelled) {
          setZoneOptions(
            zones.map((zone) => ({
              label: String(zone.name ?? zone.zoneName ?? zone.label ?? ""),
              value: String(zone.id ?? zone.zoneId ?? zone.value ?? ""),
            }))
          );
        }
      } catch (error) {
        if (!cancelled) {
          setZoneOptions([]);
          console.error("Warehouse zones fetch failed:", error);
        }
      }
    };

    loadZones();

    return () => {
      cancelled = true;
    };
  }, [formData.warehouse]);

  useEffect(() => {
    mountedRef.current = true;

    const po = getPOFromData(initialData, purchaseOrders);

    setSelectedPO(po);
    setPoSearch(
      po?.number ??
        initialData?.poNumber ??
        initialData?.purchaseOrderNumber ??
        ""
    );

    setFormData({
      warehouse:
        initialData?.warehouse?.value ??
        initialData?.warehouse?.label ??
        (typeof initialData?.warehouse === "string"
          ? initialData.warehouse
          : "") ??
        initialData?.warehouseId ??
        "",
      receiptCode: initialData?.receiptCode ?? "",
      grnNumber: initialData?.grnNumber ?? "",
      receivedBy: initialData?.receivedBy ?? currentUser,
      receiptDate: String(
        initialData?.receiptDate ?? initialData?.receivedAt ?? today()
      ).slice(0, 10),
      receiptNotes: initialData?.receiptNotes ?? initialData?.notes ?? "",
      deliveryNoteNumber:
        initialData?.deliveryNoteNumber ??
        initialData?.deliveryNoteNo ??
        "",
      vehicleNumber: initialData?.vehicleNumber ?? "",
    });

    const savedItems = initialData?.items;

    setItems(
      Array.isArray(savedItems) && savedItems.length
        ? savedItems.map((item, index) =>
            normalizeReceiptItem(
              item,
              po?.items?.find(
                (poItem) =>
                  poItem.id === item.purchaseOrderItemId ||
                  poItem.id === item.id ||
                  poItem.code === item.itemCode ||
                  poItem.code === item.code
              ) ??
                po?.items?.[index] ??
                {}
            )
          )
        : po?.items?.map(createReceiptItem) ?? []
    );

    const savedPolicy = initialData?.returnPolicy;

    setPolicyEnabled(Boolean(savedPolicy));
    setReturnPolicy({
      ...initialPolicy,
      ...(savedPolicy || {}),
      returnConditions: {
        ...(savedPolicy?.returnConditions || {}),
      },
      allowedResolutionMethods: savedPolicy?.allowedResolutionMethods || [],
    });
    setPolicyProductId(savedPolicy?.productId || "");

    setActiveTab(0);
    setErrors({});
    setSubmitMessage("");
    setSaveStatus("saved");

    return () => {
      mountedRef.current = false;
      clearTimeout(saveTimerRef.current);
    };
  }, [initialData?.id, currentUser, purchaseOrders]);

  const filteredPurchaseOrders = useMemo(() => {
    const search = poSearch.trim().toLowerCase();

    return purchaseOrders.filter(
      (po) =>
        po.number.toLowerCase().includes(search) ||
        po.supplier.toLowerCase().includes(search)
    );
  }, [purchaseOrders, poSearch]);

  const updateField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setSubmitMessage("");
  };

  const updatePolicy = (name, value) => {
    setReturnPolicy((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [`returnPolicy.${name}`]: "" }));
    setSubmitMessage("");
  };

  const updatePolicyCondition = (name, checked) => {
    setReturnPolicy((previous) => ({
      ...previous,
      returnConditions: {
        ...previous.returnConditions,
        [name]: checked,
      },
    }));
  };

  const updateResolution = (value, checked) => {
    setReturnPolicy((previous) => ({
      ...previous,
      allowedResolutionMethods: checked
        ? [...previous.allowedResolutionMethods.filter((item) => item !== value), value]
        : previous.allowedResolutionMethods.filter((item) => item !== value),
    }));

    setErrors((previous) => ({
      ...previous,
      "returnPolicy.allowedResolutionMethods": "",
    }));
  };

  const handlePOSelect = (po) => {
    setSelectedPO(po);
    setPoSearch(po.number);
    setShowPOSuggestions(false);
    setItems(po.items.map(createReceiptItem));
    setErrors({});
    setSubmitMessage("");
    setReturnPolicy((previous) => ({
      ...previous,
      effectiveFrom: previous.effectiveFrom || formData.receiptDate,
    }));
  };

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const updated = { ...item, [field]: value };

        if (field === "received" || field === "rejected") {
          const received = Number(
            field === "received" ? value || 0 : updated.received || 0
          );
          const rejected = Number(
            field === "rejected" ? value || 0 : updated.rejected || 0
          );

          updated.accepted = String(Math.max(0, received - rejected));
        }

        return updated;
      })
    );

    setErrors((previous) => {
      const next = { ...previous };

      [
        `items.${index}.receivedQuantity`,
        `items.${index}.acceptedQuantity`,
        `items.${index}.rejectedQuantity`,
        `items.${index}.storageZoneId`,
        `items.${index}.inspectionStatus`,
        `items.${index}.rejectionReason`,
      ].forEach((key) => delete next[key]);

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

  const validateReturnPolicy = () => {
    if (!policyEnabled) return {};

    const next = {};

    if (!returnPolicy.policyName.trim()) {
      next["returnPolicy.policyName"] = "Policy Name is required";
    }

    if (!policyProductId) {
      next["returnPolicy.productId"] = "Select a product";
    }

    if (!returnPolicy.effectiveFrom) {
      next["returnPolicy.effectiveFrom"] = "Effective From is required";
    }

    if (
      returnPolicy.effectiveUntil &&
      returnPolicy.effectiveFrom &&
      returnPolicy.effectiveUntil < returnPolicy.effectiveFrom
    ) {
      next["returnPolicy.effectiveUntil"] =
        "Effective Until must be on or after Effective From";
    }

    if (
      !returnPolicy.returnWindow ||
      !Number.isInteger(Number(returnPolicy.returnWindow)) ||
      Number(returnPolicy.returnWindow) < 1
    ) {
      next["returnPolicy.returnWindow"] =
        "Return Window must be at least 1 day";
    }

    if (
      returnPolicy.maximumReturnQuantity !== "" &&
      (!Number.isInteger(Number(returnPolicy.maximumReturnQuantity)) ||
        Number(returnPolicy.maximumReturnQuantity) < 1)
    ) {
      next["returnPolicy.maximumReturnQuantity"] =
        "Maximum Return Quantity must be at least 1";
    }

    if (
      returnPolicy.restockingFee === "" ||
      !Number.isFinite(Number(returnPolicy.restockingFee)) ||
      Number(returnPolicy.restockingFee) < 0 ||
      Number(returnPolicy.restockingFee) > 100
    ) {
      next["returnPolicy.restockingFee"] =
        "Restocking Fee must be between 0 and 100";
    }

    if (!returnPolicy.allowedResolutionMethods.length) {
      next["returnPolicy.allowedResolutionMethods"] =
        "Select at least one resolution method";
    }

    if (!returnPolicy.policyTerms.trim()) {
      next["returnPolicy.policyTerms"] = "Policy Terms are required";
    }

    return next;
  };

  const buildReturnPolicyPayload = () => {
    if (!policyEnabled) return null;

    const selectedProduct = items.find(
      (item) =>
        String(item.id) === String(policyProductId) ||
        String(item.code) === String(policyProductId)
    );

    return {
      ...returnPolicy,
      vendorName:
        selectedPO?.supplier ??
        initialData?.supplierName ??
        initialData?.supplier ??
        "",
      productId: policyProductId,
      productCode: selectedProduct?.code || "",
      productName: selectedProduct?.description || "",
      effectiveFrom: returnPolicy.effectiveFrom,
      effectiveUntil: returnPolicy.effectiveUntil || "",
      returnWindow: Number(returnPolicy.returnWindow),
      maximumReturnQuantity:
        returnPolicy.maximumReturnQuantity === ""
          ? null
          : Number(returnPolicy.maximumReturnQuantity),
      restockingFee: Number(returnPolicy.restockingFee),
      status: returnPolicy.status || "",
    };
  };

  const buildReceiptPayload = useCallback(() => {
    const receiptDate = String(formData.receiptDate ?? "").slice(0, 10);

    let receivedAt = "";

    if (receiptDate) {
      const date = new Date(`${receiptDate}T12:00:00`);
      if (!Number.isNaN(date.getTime())) receivedAt = date.toISOString();
    }

    const payload = {
      id: initialData?.id,
      purchaseOrderId: String(
        selectedPO?.id ?? initialData?.purchaseOrderId ?? ""
      ),
      poNumber: selectedPO?.number ?? initialData?.poNumber ?? "",
      warehouseId: String(formData.warehouse ?? ""),
      receiptCode: String(formData.receiptCode ?? "").trim(),
      grnNumber: String(formData.grnNumber ?? "").trim(),
      deliveryNoteNumber: String(formData.deliveryNoteNumber ?? ""),
      vehicleNumber: String(formData.vehicleNumber ?? ""),
      receivedBy: String(formData.receivedBy ?? "").trim(),
      receiptDate,
      receivedAt,
      currency: String(
        selectedPO?.currency ?? initialData?.currency ?? ""
      ),
      receiptNotes: String(formData.receiptNotes ?? ""),
      notes: String(formData.receiptNotes ?? ""),
      purchaseOrder: selectedPO,
      supplierName:
        selectedPO?.supplier ??
        initialData?.supplierName ??
        initialData?.supplier ??
        "",
      warehouse: formData.warehouse,
      items: items.map((item) => ({
        id: item.id,
        purchaseOrderItemId: String(
          item.purchaseOrderItemId ?? item.id ?? ""
        ),
        itemCode: String(item.code ?? item.itemCode ?? ""),
        code: String(item.code ?? item.itemCode ?? ""),
        itemDescription: String(
          item.description ?? item.itemDescription ?? ""
        ).trim(),
        description: String(
          item.description ?? item.itemDescription ?? ""
        ).trim(),
        unit: item.unit ?? "",
        orderedQuantity: Number(item.ordered || 0),
        ordered: Number(item.ordered || 0),
        previouslyReceived: Number(item.previouslyReceived || 0),
        remainingQuantity: Number(item.remaining || 0),
        remaining: Number(item.remaining || 0),
        receivedQuantity: Number(item.received || 0),
        receivedQty: Number(item.received || 0),
        received: item.received,
        acceptedQuantity: Number(item.accepted || 0),
        acceptedQty: Number(item.accepted || 0),
        accepted: item.accepted,
        rejectedQuantity: Number(item.rejected || 0),
        rejectedQty: Number(item.rejected || 0),
        rejected: item.rejected,
        storageZoneId: String(item.zone ?? ""),
        zone: item.zone ?? "",
        inspectionStatus: String(item.inspection ?? "")
          .toUpperCase()
          .replaceAll(" ", "_"),
        inspection: item.inspection ?? "",
        unitCost: Number(item.unitCost || 0),
        rejectionReason: String(item.rejectionReason ?? ""),
        itemNotes: String(item.notes ?? ""),
        notes: String(item.notes ?? ""),
      })),
      totalReceived,
      totalAccepted,
      totalRejected,
    };

    payload.returnPolicy = policyEnabled ? buildReturnPolicyPayload() : null;

    return payload;
  }, [
    initialData,
    selectedPO,
    formData,
    items,
    totalReceived,
    totalAccepted,
    totalRejected,
    policyEnabled,
    returnPolicy,
    policyProductId,
  ]);

  const saveDraft = useCallback(
    async (payload) => {
      if (!isEdit || !onDraftChange || !payload.id) return;

      latestPayloadRef.current = payload;
      if (mountedRef.current) setSaveStatus("saving");

      try {
        await onDraftChange(payload);
        if (mountedRef.current) setSaveStatus("saved");
      } catch (error) {
        console.error("Purchase receipt draft save failed:", error);
        if (mountedRef.current) setSaveStatus("error");
        throw error;
      }
    },
    [isEdit, onDraftChange]
  );

  useEffect(() => {
    if (!isEdit || !onDraftChange || !initialData?.id) return;

    const payload = buildReceiptPayload();
    latestPayloadRef.current = payload;

    clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      saveDraft(payload).catch(() => {});
    }, 1000);

    return () => clearTimeout(saveTimerRef.current);
  }, [
    isEdit,
    onDraftChange,
    initialData?.id,
    buildReceiptPayload,
    saveDraft,
  ]);

  const flushPendingSave = useCallback(async () => {
    clearTimeout(saveTimerRef.current);

    if (!isEdit || !onDraftChange || !initialData?.id) return;

    const payload = buildReceiptPayload();
    latestPayloadRef.current = payload;

    await saveDraft(payload);
  }, [isEdit, onDraftChange, initialData?.id, buildReceiptPayload, saveDraft]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage("");

    const payload = buildReceiptPayload();
    const result = purchaseReceiptSchema.safeParse(payload);

    let nextErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!nextErrors[path]) nextErrors[path] = issue.message;
      });
    }

    nextErrors = { ...nextErrors, ...validateReturnPolicy() };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);

      if (
        nextErrors.purchaseOrderId ||
        nextErrors.warehouseId ||
        nextErrors.currency
      ) {
        setActiveTab(0);
      } else if (
        nextErrors.receiptCode ||
        nextErrors.grnNumber ||
        nextErrors.receivedBy ||
        nextErrors.receiptDate
      ) {
        setActiveTab(1);
      } else if (
        Object.keys(nextErrors).some((key) => key.startsWith("items"))
      ) {
        setActiveTab(2);
      } else if (
        Object.keys(nextErrors).some((key) => key.startsWith("returnPolicy"))
      ) {
        setActiveTab(4);
      }

      return;
    }

    setErrors({});
    clearTimeout(saveTimerRef.current);

    const receiptPreview = {
      ...payload,
      ...result.data,
      id: initialData?.id,
      purchaseOrder: selectedPO,
      poNumber: selectedPO?.number ?? initialData?.poNumber ?? "",
      supplierName: selectedPO?.supplier ?? initialData?.supplierName ?? "",
      warehouse: formData.warehouse,
      currency: selectedPO?.currency ?? initialData?.currency ?? "",
      receiptDate: formData.receiptDate,
      deliveryNoteNumber: formData.deliveryNoteNumber,
      vehicleNumber: formData.vehicleNumber,
      receiptNotes: formData.receiptNotes,
      items: payload.items,
      returnPolicy: payload.returnPolicy,
      totalReceived,
      totalAccepted,
      totalRejected,
    };

    try {
      await onCreate?.(receiptPreview);
    } catch (error) {
      console.error("Purchase receipt submission failed:", error);
      if (mountedRef.current) {
        setSubmitMessage("Unable to save receipt. Please try again.");
      }
    }
  };

  const handleCancel = async () => {
    try {
      await flushPendingSave();
    } catch {
      setSubmitMessage("Draft could not be saved. Please try again.");
      return;
    }

    onCancel?.();
  };

  const input = (
    name,
    label,
    value,
    type = "text",
    disabled = false,
    required = false
  ) => (
    <div className="pr-field" key={name}>
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

  const policyField = (name, label, type = "text", required = false) => (
    <div className="pr-field" key={name}>
      <FormField
        name={`returnPolicy.${name}`}
        label={label}
        value={returnPolicy[name] ?? ""}
        type={type}
        required={required}
        onChange={(event) => updatePolicy(name, event.target.value)}
        error={errors[`returnPolicy.${name}`] || ""}
      />
    </div>
  );

  const errorMessage = (name) =>
    errors[name] ? <p className="pr-error">{errors[name]}</p> : null;

  const renderNativeSelect = (value, options, onChange, placeholder) => (
    <Dropdown
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
    />
  );

  return (
    <form className="purchase-receipt-form" onSubmit={handleSubmit}>
      <header className="pr-header">
        <div>
          <h2>
            {isEdit ? "Edit Purchase Receipt" : "Create Purchase Receipt"}
          </h2>
          <p>
            {isEdit
              ? "Update receipt details and received item quantities."
              : "Record delivered items and verify received quantities."}
          </p>
        </div>

        {isEdit && (
          <span className={`pr-save-status ${saveStatus}`}>
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "error"
                ? "Save failed"
                : "Draft saved"}
          </span>
        )}
      </header>

      {submitMessage && (
        <div className="pr-success-message">{submitMessage}</div>
      )}

      {dropdownError && (
        <div className="pr-error">{dropdownError}</div>
      )}

      <div className="pr-tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`pr-tab ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      <h3 className="pr-active-heading">{tabs[activeTab]}</h3>

      {activeTab === 0 && (
        <section className="pr-section">
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
                  setErrors((previous) => ({
                    ...previous,
                    purchaseOrderId: "",
                  }));
                }}
                placeholder="Search PO number or supplier..."
              />

              {showPOSuggestions && (
                <div className="pr-po-results">
                  {poLoading ? (
                    <p className="pr-no-results">Loading purchase orders...</p>
                  ) : filteredPurchaseOrders.length ? (
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
                    <p className="pr-no-results">
                      {dropdownError || "No matching purchase orders"}
                    </p>
                  )}
                </div>
              )}
              {errorMessage("purchaseOrderId")}
            </div>

            {input(
              "supplier",
              "Supplier",
              selectedPO?.supplier || initialData?.supplierName || "",
              "text",
              true
            )}

            {input(
              "poDate",
              "PO Date",
              selectedPO?.date || initialData?.poDate || "",
              "text",
              true
            )}

            <div className="pr-field">
              <label className="pr-label">
                Warehouse <span>*</span>
              </label>
              {renderNativeSelect(
                formData.warehouse,
                warehouseOptions,
                (value) => updateField("warehouse", value),
                "Select warehouse"
              )}
              {errorMessage("warehouseId")}
            </div>

            {input(
              "currency",
              "Currency",
              selectedPO?.currency || initialData?.currency || "",
              "text",
              true
            )}
          </div>
        </section>
      )}

      {activeTab === 1 && (
        <section className="pr-section">
          <div className="pr-grid">
            {input("receiptCode", "Receipt Code", formData.receiptCode, "text", false, true)}
            {input("grnNumber", "GRN Number", formData.grnNumber, "text", false, true)}
            {input("deliveryNoteNumber", "Delivery Note Number", formData.deliveryNoteNumber)}
            {input("vehicleNumber", "Vehicle Number", formData.vehicleNumber)}
            {input("receivedBy", "Received By", formData.receivedBy, "text", false, true)}

            <div className="pr-field">
              <DatePicker
                name="receiptDate"
                label="Receipt Date"
                value={formData.receiptDate}
                onChange={(value) => updateField("receiptDate", value)}
                required
              />
              {errorMessage("receiptDate")}
            </div>
          </div>
        </section>
      )}

      {activeTab === 2 && (
        <section className="pr-section">
          {errors.items && (
            <p className="pr-error pr-section-error">{errors.items}</p>
          )}

          {!selectedPO ? (
            <div className="pr-empty">
              <strong>No Purchase Order selected</strong>
              <p>Go to Purchase Order Details and select a Purchase Order.</p>
              <Button type="button" onClick={() => setActiveTab(0)}>
                Select Purchase Order
              </Button>
            </div>
          ) : (
            items.map((item, index) => (
              <div className="pr-item-card" key={item.id ?? index}>
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
                    <FormField
                      name={`received-${index}`}
                      label=""
                      type="number"
                      value={item.received}
                      onChange={(event) => updateItem(index, "received", event.target.value)}
                      error={errors[`items.${index}.receivedQuantity`] || ""}
                    />
                  </div>

                  <div className="pr-field">
                    <FormField
                      name={`accepted-${index}`}
                      label="Accepted Quantity"
                      type="number"
                      value={item.accepted}
                      onChange={(event) => updateItem(index, "accepted", event.target.value)}
                      error={errors[`items.${index}.acceptedQuantity`] || ""}
                    />
                  </div>

                  <div className="pr-field">
                    <FormField
                      name={`rejected-${index}`}
                      label="Rejected Quantity"
                      type="number"
                      value={item.rejected}
                      onChange={(event) => updateItem(index, "rejected", event.target.value)}
                      error={errors[`items.${index}.rejectedQuantity`] || ""}
                    />
                  </div>

                  <div className="pr-field">
                    <label className="pr-label">
                      Storage Zone <span>*</span>
                    </label>
                    {renderNativeSelect(
                      item.zone,
                      zoneOptions,
                      (value) => updateItem(index, "zone", value),
                      "Select zone"
                    )}
                    {errorMessage(`items.${index}.storageZoneId`)}
                  </div>

                  <div className="pr-field">
                    <label className="pr-label">
                      Inspection Status <span>*</span>
                    </label>
                    {renderNativeSelect(
                      item.inspection,
                      inspectionOptions,
                      (value) => updateItem(index, "inspection", value),
                      "Select status"
                    )}
                    {errorMessage(`items.${index}.inspectionStatus`)}
                  </div>

                  <div className="pr-field">
                    <FormField
                      name={`rejectionReason-${index}`}
                      label="Rejection Reason"
                      value={item.rejectionReason}
                      placeholder="Enter rejection reason"
                      onChange={(event) => updateItem(index, "rejectionReason", event.target.value)}
                      error={errors[`items.${index}.rejectionReason`] || ""}
                    />
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
      )}

      {activeTab === 3 && (
        <section className="pr-section">
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
      )}

      {activeTab === 4 && (
        <section className="pr-section pr-return-policy">
          <div className="pr-policy-header">
            <div>
              <h3>Purchase Return Policy</h3>
              <p>Configure the return rules for items in this receipt.</p>
            </div>

            <Toggle
              label="Create Return Policy"
              checked={policyEnabled}
              onChange={(checked) => {
                setPolicyEnabled(checked);
                setErrors((previous) =>
                  Object.fromEntries(
                    Object.entries(previous).filter(
                      ([key]) => !key.startsWith("returnPolicy.")
                    )
                  )
                );
              }}
            />
          </div>

          {!policyEnabled ? (
            <div className="pr-policy-empty">
              <strong>No return policy added</strong>
              <p>
                This is optional. You can continue and save the receipt without a
                return policy.
              </p>
            </div>
          ) : (
            <>
              <div className="pr-grid">
                <div className="pr-field">
                  <FormField
                    name="returnPolicyVendor"
                    label="Vendor"
                    value={
                      selectedPO?.supplier ||
                      initialData?.supplierName ||
                      initialData?.supplier ||
                      ""
                    }
                    disabled
                  />
                </div>

                <div className="pr-field">
                  <label className="pr-label">
                    Product <span>*</span>
                  </label>
                  <Dropdown
                    value={policyProductId}
                    options={items.map((item, index) => ({
                      value: String(item.id ?? item.code ?? index),
                      label: `${item.code} - ${item.description}`,
                    }))}
                    onChange={(value) => {
                      setPolicyProductId(value);
                      setErrors((previous) => ({
                        ...previous,
                        "returnPolicy.productId": "",
                      }));
                    }}
                    placeholder="Select product"
                  />
                  {errorMessage("returnPolicy.productId")}
                </div>

                {policyField("policyName", "Policy Name", "text", true)}
                {policyField("description", "Description")}

                <div className="pr-field">
                  <DatePicker
                    name="effectiveFrom"
                    label="Effective From"
                    value={returnPolicy.effectiveFrom}
                    onChange={(value) => updatePolicy("effectiveFrom", value)}
                    required
                  />
                  {errorMessage("returnPolicy.effectiveFrom")}
                </div>

                <div className="pr-field">
                  <DatePicker
                    name="effectiveUntil"
                    label="Effective Until"
                    value={returnPolicy.effectiveUntil}
                    onChange={(value) => updatePolicy("effectiveUntil", value)}
                  />
                  {errorMessage("returnPolicy.effectiveUntil")}
                </div>

                {policyField("returnWindow", "Return Window (days)", "number", true)}

                <div className="pr-field">
                  <label className="pr-label">Window Starts From</label>
                  <Dropdown
                    value={returnPolicy.windowStartsFrom}
                    options={windowStartOptions}
                    onChange={(value) => updatePolicy("windowStartsFrom", value)}
                    placeholder="Select start date"
                  />
                </div>

                {policyField("maximumReturnQuantity", "Maximum Return Quantity", "number")}
                {policyField("restockingFee", "Restocking Fee (%)", "number")}
              </div>

              <div className="pr-policy-section">
                <h4>Return Conditions</h4>
                <div className="pr-policy-check-grid">
                  {returnConditionOptions.map((option) => {
                    const [name, label] = Array.isArray(option)
                      ? option
                      : [option.value ?? option.code, option.label ?? option.name];

                    return (
                      <Checkbox
                        key={name}
                        name={name}
                        label={label}
                        checked={Boolean(returnPolicy.returnConditions[name])}
                        onChange={(checked) => updatePolicyCondition(name, checked)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pr-policy-section">
                <h4>Allowed Resolution Methods</h4>
                <div className="pr-policy-check-grid">
                  {resolutionOptions.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      name={value}
                      label={label}
                      checked={returnPolicy.allowedResolutionMethods.includes(value)}
                      onChange={(checked) => updateResolution(value, checked)}
                    />
                  ))}
                </div>
                {errorMessage("returnPolicy.allowedResolutionMethods")}
              </div>

              <div className="pr-field pr-policy-terms">
                <FormField
                  name="policyTerms"
                  label="Policy Terms"
                  type="textarea"
                  value={returnPolicy.policyTerms}
                  onChange={(event) => updatePolicy("policyTerms", event.target.value)}
                  placeholder="Enter the complete conditions here"
                  required
                  error={errors["returnPolicy.policyTerms"] || ""}
                />
              </div>

              <div className="pr-field pr-policy-status">
                <label className="pr-label">Policy Status</label>
                <Dropdown
                  value={returnPolicy.status}
                  options={statusOptions}
                  onChange={(value) => updatePolicy("status", value)}
                  placeholder="Select policy status"
                />
              </div>
            </>
          )}
        </section>
      )}

      {activeTab === 5 && (
        <section className="pr-section">
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
      )}

      <div className="pr-actions">
        <Button
          type="button"
          className="secondary-button"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <div className="pr-navigation">
          <Button
            type="button"
            className="secondary-button"
            disabled={activeTab === 0}
            onClick={() =>
              setActiveTab((previous) => Math.max(0, previous - 1))
            }
          >
            Previous
          </Button>

          {activeTab < tabs.length - 1 ? (
            <Button
              type="button"
              onClick={() =>
                setActiveTab((previous) =>
                  Math.min(previous + 1, tabs.length - 1)
                )
              }
            >
              Next
            </Button>
          ) : (
            <Button type="submit">
              {isEdit ? "Update Receipt" : "Add Receipt"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default PurchaseReceiptForm;
