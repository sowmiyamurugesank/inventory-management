
import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle,
  FileEdit,
  Ban,
  ArrowLeft,
  Building2,
  CalendarDays,
  ShieldCheck as ShieldIcon,
  ClipboardCheck,
  Wallet,
  FileText,
} from "lucide-react";

import Table from "../component/Table.jsx";
import StatCard from "../StatCard.jsx";
import Dropdown from "../component/Dropdown.jsx";

import DetailsSection from "../component/Atom/DetailsSection.jsx"
import Badge from "../component/Atom/Badge.jsx"
import Button from "../component/Button.jsx";

import "../styles/ReturnPolicy.css";

const API_BASE_URL = "http://localhost:5000/api";

const statusFilterOptions = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "EXPIRED", label: "Expired" },
];

const ReturnPolicy = ({ onEditPolicy }) => {
  const [returnPolicies, setReturnPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Fetch Purchase Return Policies
  const fetchReturnPolicies = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/purchase-return-policies`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch return policies");
      }

      const result = await response.json();

      const policies = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.items)
        ? result.items
        : Array.isArray(result.results)
        ? result.results
        : [];

      const formattedPolicies = policies.map((policy) => {
        const methods =
          policy.allowed_return_methods ??
          policy.allowedResolutionMethods ??
          [];

        return {
          ...policy,

          id: policy.id ?? policy.policy_id,

          purchase_receipt_id:
            policy.purchase_receipt_id ??
            policy.purchaseReceiptId ??
            policy.receipt_id ??
            policy.receiptId ??
            null,

          code: policy.code ?? policy.policy_code ?? "",

          policy_name:
            policy.policy_name ?? policy.policyName ?? "",

          vendor_name:
            policy.vendor_name ??
            policy.vendors?.name ??
            policy.vendorName ??
            "",

          product_name:
            policy.product_name ??
            policy.item_list?.name ??
            policy.productName ??
            "",

          vendor_id:
            policy.vendor_id ??
            policy.vendorId ??
            policy.vendors?.id ??
            "",

          item_id:
            policy.item_id ??
            policy.itemId ??
            policy.product_id ??
            policy.productId ??
            policy.item_list?.id ??
            "",

          return_window: `${
            policy.return_window_days ??
            policy.returnWindow ??
            0
          } Days from ${
            policy.return_window_basis ??
            policy.windowStartsFrom ??
            "Receipt Date"
          }`,

          allowed_return_methods: Array.isArray(methods)
            ? methods.join(", ")
            : methods,

          effective_from:
            policy.effective_from ??
            policy.effectiveFrom ??
            "",

          effective_until:
            policy.effective_until ??
            policy.effectiveUntil ??
            "",

          status: policy.status ?? "DRAFT",
        };
      });

      setReturnPolicies(formattedPolicies);
    } catch (error) {
      console.error("Return Policy Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnPolicies();
  }, []);

  // Search and Status Filter
  const filteredPolicies = useMemo(() => {
    return returnPolicies.filter((policy) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch = [
        policy.code,
        policy.policy_name,
        policy.vendor_name,
        policy.product_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        policy.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returnPolicies, searchTerm, statusFilter]);

  // Statistics
  const totalPolicies = returnPolicies.length;

  const activePolicies = returnPolicies.filter(
    (policy) => policy.status === "ACTIVE"
  ).length;

  const draftPolicies = returnPolicies.filter(
    (policy) => policy.status === "DRAFT"
  ).length;

  const suspendedPolicies = returnPolicies.filter(
    (policy) => policy.status === "SUSPENDED"
  ).length;

  // Edit Policy
  const handleEdit = (policy) => {
    const receiptId =
      policy.purchase_receipt_id ??
      policy.purchaseReceiptId ??
      policy.receipt_id ??
      policy.receiptId;

    if (!receiptId) {
      alert("Purchase Receipt ID not found for this policy.");
      console.error("Policy details:", policy);
      return;
    }

    onEditPolicy?.({
      ...policy,
      purchaseReceiptId: receiptId,
    });
  };

  // View Policy
  const handleView = (policy) => {
    setSelectedPolicy(policy);
  };

  // Close View
  const handleCloseView = () => {
    setSelectedPolicy(null);
  };

  // Deactivate Policy
  const handleDeactivate = async (policy) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${policy.policy_name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/purchase-return-policies/${policy.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "SUSPENDED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deactivate policy");
      }

      await fetchReturnPolicies();
    } catch (error) {
      console.error("Deactivate Error:", error);
      alert("Unable to deactivate return policy");
    }
  };

  // Table Columns
  const columns = [
    { key: "code", label: "Policy Code" },
    { key: "policy_name", label: "Policy Name" },
    { key: "vendor_name", label: "Vendor" },
    { key: "product_name", label: "Product" },
    { key: "return_window", label: "Return Window" },
    {
      key: "allowed_return_methods",
      label: "Return Methods",
    },
    {
      key: "effective_from",
      label: "Effective From",
    },
    {
      key: "effective_until",
      label: "Effective Until",
    },
    {
      key: "status",
      label: "Policy Status",
    },
  ];

  // Helper for policy values
  const getValue = (...values) =>
    values.find(
      (value) => value !== undefined && value !== null && value !== ""
    );

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Boolean display
  const getBoolean = (value) => {
    if (typeof value === "boolean") return value;

    if (typeof value === "number") return value === 1;

    if (typeof value === "string") {
      return ["true", "1", "yes"].includes(
        value.toLowerCase()
      );
    }

    return false;
  };

  // Return Policy View
  const renderPolicyView = () => {
    const policy = selectedPolicy;

    const returnConditions =
      policy.return_conditions ??
      policy.returnConditions ??
      {};

    const resolutionMethods =
      policy.allowed_return_methods ??
      policy.allowedResolutionMethods ??
      [];

    const methods = Array.isArray(resolutionMethods)
      ? resolutionMethods.map((method) =>
          String(method).toLowerCase().replace(/[_\s-]/g, "")
        )
      : String(resolutionMethods)
          .split(",")
          .map((method) =>
            method.toLowerCase().replace(/[_\s-]/g, "")
          );

    const refundAllowed = getValue(
      policy.refund_allowed,
      policy.refundAllowed
    );

    const creditNoteAllowed = getValue(
      policy.credit_note_allowed,
      policy.creditNoteAllowed
    );

    const replacementAllowed = getValue(
      policy.replacement_allowed,
      policy.replacementAllowed
    );

    const refund = refundAllowed !== undefined
      ? getBoolean(refundAllowed)
      : methods.includes("refund");

    const creditNote = creditNoteAllowed !== undefined
      ? getBoolean(creditNoteAllowed)
      : methods.includes("creditnote");

    const replacement = replacementAllowed !== undefined
      ? getBoolean(replacementAllowed)
      : methods.includes("replacement");

    const returnWindow = getValue(
      policy.return_window_days,
      policy.returnWindow
    );

    const windowBasis = getValue(
      policy.return_window_basis,
      policy.windowStartsFrom,
      "Receipt Date"
    );

    const eligibility = [
      {
        label: "Returns allowed",
        value: getValue(
          policy.returns_allowed,
          policy.returnsAllowed,
          policy.return_allowed,
          policy.returnAllowed
        ),
      },
      {
        label: "Damaged goods accepted",
        value: getValue(
          policy.damaged_goods_accepted,
          policy.damagedGoodsAccepted,
          returnConditions.damaged
        ),
      },
      {
        label: "Defective goods accepted",
        value: getValue(
          policy.defective_goods_accepted,
          policy.defectiveGoodsAccepted,
          returnConditions.defective
        ),
      },
      {
        label: "Wrong items accepted",
        value: getValue(
          policy.wrong_items_accepted,
          policy.wrongItemsAccepted,
          returnConditions.wrongItem
        ),
      },
      {
        label: "Expired goods accepted",
        value: getValue(
          policy.expired_goods_accepted,
          policy.expiredGoodsAccepted,
          returnConditions.expired
        ),
      },
      {
        label: "Opened items accepted",
        value: getValue(
          policy.opened_items_accepted,
          policy.openedItemsAccepted,
          returnConditions.opened
        ),
      },
    ];

    const requirements = [
      {
        label: "Original packaging required",
        value: getValue(
          policy.original_packaging_required,
          policy.originalPackagingRequired,
          returnConditions.originalPackaging
        ),
      },
      {
        label: "Original invoice required",
        value: getValue(
          policy.original_invoice_required,
          policy.originalInvoiceRequired,
          returnConditions.originalInvoice
        ),
      },
      {
        label: "Inspection required",
        value: getValue(
          policy.inspection_required,
          policy.inspectionRequired,
          returnConditions.inspection
        ),
      },
      {
        label: "Vendor approval required",
        value: getValue(
          policy.vendor_approval_required,
          policy.vendorApprovalRequired,
          returnConditions.vendorApproval
        ),
      },
    ];

    const renderYesNo = (value) => {
      if (value === undefined) {
        return <Badge variant="default">Not specified</Badge>;
      }

      return getBoolean(value) ? (
        <Badge variant="success">Yes</Badge>
      ) : (
        <Badge variant="danger">No</Badge>
      );
    };

    const renderRequired = (value) => {
      if (value === undefined) {
        return <Badge variant="default">Not specified</Badge>;
      }

      return getBoolean(value) ? (
        <Badge variant="warning">Required</Badge>
      ) : (
        <Badge variant="default">Not required</Badge>
      );
    };

    return (
      <div className="return-policy-view">
        <div className="return-policy-view-header">
          <div>
            <h2>Purchase Return Policy</h2>
            <p>View Policy Details</p>
          </div>

          <Badge
            variant={
              policy.status === "ACTIVE"
                ? "success"
                : policy.status === "SUSPENDED"
                ? "danger"
                : "warning"
            }
          >
            {policy.status}
          </Badge>
        </div>

        <div className="return-policy-view-title">
          <div>
            <h2>
              {getValue(
                policy.policy_name,
                policy.policyName,
                "Standard Return Policy"
              )}
            </h2>
            <span>
              {getValue(policy.code, policy.policy_code, "—")}
            </span>
          </div>
        </div>

        <div className="return-policy-view-content">

          {/* Vendor & Product */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <Building2 />
              <h3>Vendor & Product</h3>
            </div>

            <DetailsSection
              title=""
              fields={[
                {
                  label: "Vendor",
                  value: getValue(
                    policy.vendor_name,
                    policy.vendors?.name,
                    policy.vendorName
                  ),
                },
                {
                  label: "Product",
                  value: getValue(
                    policy.product_name,
                    policy.item_list?.name,
                    policy.productName
                  ),
                },
                {
                  label: "Vendor ID",
                  value: getValue(
                    policy.vendor_id,
                    policy.vendorId,
                    policy.vendors?.id
                  ),
                },
                {
                  label: "Item ID",
                  value: getValue(
                    policy.item_id,
                    policy.itemId,
                    policy.product_id,
                    policy.productId,
                    policy.item_list?.id
                  ),
                },
              ]}
            />
          </div>

          {/* Validity & Return Window */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <CalendarDays />
              <h3>Validity & Return Window</h3>
            </div>

            <DetailsSection
              title=""
              fields={[
                {
                  label: "Effective From",
                  value: formatDate(
                    getValue(
                      policy.effective_from,
                      policy.effectiveFrom
                    )
                  ),
                },
                {
                  label: "Effective Until",
                  value: policy.effective_until ||
                    policy.effectiveUntil
                    ? formatDate(
                        policy.effective_until ??
                        policy.effectiveUntil
                      )
                    : "No end date",
                },
                {
                  label: "Return Window",
                  value:
                    returnWindow !== undefined
                      ? `${returnWindow} days`
                      : "Not specified",
                },
                {
                  label: "Window Basis",
                  value: windowBasis,
                },
                {
                  label: "Maximum Return Quantity",
                  value: getValue(
                    policy.maximum_return_quantity,
                    policy.maximumReturnQuantity,
                    "Not specified"
                  ),
                },
                {
                  label: "Restocking Fee",
                  value: `${getValue(
                    policy.restocking_fee,
                    policy.restockingFee,
                    0
                  )}%`,
                },
              ]}
            />
          </div>

          {/* Return Eligibility */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <ShieldIcon />
              <h3>Return Eligibility</h3>
            </div>

            <div className="return-policy-view-status-list">
              {eligibility.map((item) => (
                <div
                  className="return-policy-view-status-row"
                  key={item.label}
                >
                  <span>{item.label}</span>
                  {renderYesNo(item.value)}
                </div>
              ))}
            </div>
          </div>

          {/* Return Requirements */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <ClipboardCheck />
              <h3>Return Requirements</h3>
            </div>

            <div className="return-policy-view-status-list">
              {requirements.map((item) => (
                <div
                  className="return-policy-view-status-row"
                  key={item.label}
                >
                  <span>{item.label}</span>
                  {renderRequired(item.value)}
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Methods */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <Wallet />
              <h3>Allowed Resolution Methods</h3>
            </div>

            <div className="return-policy-view-methods">
              {[
                { label: "Refund", allowed: refund },
                {
                  label: "Credit Note",
                  allowed: creditNote,
                },
                {
                  label: "Replacement",
                  allowed: replacement,
                },
              ].map((method) => (
                <div
                  key={method.label}
                  className={`return-policy-view-method ${
                    method.allowed ? "allowed" : "not-allowed"
                  }`}
                >
                  <CheckCircle />
                  <span>{method.label}</span>
                </div>
              ))}
            </div>

            <div className="return-policy-view-flags">
              <h4>Individual Resolution Flags</h4>

              <div className="return-policy-view-flags-grid">
                <div>
                  <span>Refund</span>
                  <Badge variant={refund ? "success" : "danger"}>
                    {String(refund)}
                  </Badge>
                </div>

                <div>
                  <span>Credit Note</span>
                  <Badge
                    variant={creditNote ? "success" : "danger"}
                  >
                    {String(creditNote)}
                  </Badge>
                </div>

                <div>
                  <span>Replacement</span>
                  <Badge
                    variant={replacement ? "success" : "danger"}
                  >
                    {String(replacement)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Terms */}
          <div className="return-policy-view-card">
            <div className="return-policy-view-section-heading">
              <FileText />
              <h3>Policy Terms & Description</h3>
            </div>

            <div className="return-policy-view-text-block">
              <h4>Description</h4>
              <p>
                {getValue(
                  policy.description,
                  "Not specified"
                )}
              </p>
            </div>

            <div className="return-policy-view-text-block">
              <h4>Vendor Return Terms</h4>
              <p>
                {getValue(
                  policy.policy_terms,
                  policy.policyTerms,
                  "Not specified"
                )}
              </p>
            </div>
          </div>

        </div>

        <div className="return-policy-view-footer">
          <Button
            className="return-policy-close-btn"
            onClick={handleCloseView}
          >
            <ArrowLeft size={16} />
            Back to Policies
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="return-policy-page">

      {selectedPolicy ? (
        renderPolicyView()
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="return-policy-stats">
            <StatCard
              title="Total Policies"
              value={totalPolicies}
              icon={<ShieldCheck />}
            />

            <StatCard
              title="Active Policies"
              value={activePolicies}
              icon={<CheckCircle />}
            />

            <StatCard
              title="Draft Policies"
              value={draftPolicies}
              icon={<FileEdit />}
            />

            <StatCard
              title="Suspended Policies"
              value={suspendedPolicies}
              icon={<Ban />}
            />
          </div>

          {/* Main Container */}
          <div className="return-policy-container">
            <h2 className="return-policy-heading">
              Purchase Return Policy
            </h2>

            {/* Search and Filter */}
            <div className="return-policy-toolbar">
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search policy, vendor, product..."
              />

              <Dropdown
                options={statusFilterOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Status"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="return-policy-loading">
                Loading return policies...
              </div>
            ) : (
              <Table
                data={filteredPolicies}
                columns={columns}
                type="policy"
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeactivate}
                actionType="deactivate"
                showSearch={false}
                showCategoryFilter={false}
                showStatusFilter={false}
                itemsPerPage={10}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReturnPolicy;
