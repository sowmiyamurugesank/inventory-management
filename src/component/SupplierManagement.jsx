
import { useEffect, useState } from "react";

import DataTable from "./DataTable";
import Button from "./Button";
import Pagination from "./Pagination";

import Input from "./Atom/Input";
import Label from "./Atom/Label";
import SelectField from "./Atom/SelectField";
import Textarea from "./Atom/Textarea";

import "../styles/Supplier.css";
import supplierSchema from "../schema/supplierSchema";

import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../api";

const emptySupplierForm = {
  vendorType: "Business",
  vendorCode: "",
  numericCode: "",
  vendorName: "",
  description: "",
  contactPerson: "",
  email: "",
  phone: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "IN",
  gstin: "",
  pan: "",
  paymentTerms: "",
  creditLimit: "",
  currency: "INR",
  activeVendor: true,
  verifiedVendor: false,
};

const supplierSteps = [
  "Vendor Info",
  "Contact Details",
  "Address",
  "Tax & Payment",
  "Status",
];

function vendorToForm(vendor) {
  return {
    vendorType:
      vendor.vendor_type === "INDIVIDUAL"
        ? "Individual"
        : "Business",
    vendorCode: vendor.code || "",
    numericCode: vendor.code_int ?? "",
    vendorName: vendor.name || "",
    description: vendor.description || "",
    contactPerson: vendor.contact_person || "",
    email: vendor.email || "",
    phone: vendor.phone || "",
    website: vendor.website || "",
    addressLine1: vendor.address_line_1 || "",
    addressLine2: vendor.address_line_2 || "",
    city: vendor.city || "",
    state: vendor.state || "",
    postalCode: vendor.postal_code || "",
    countryCode: vendor.country_code || "IN",
    gstin: vendor.gstin || "",
    pan: vendor.pan || "",
    paymentTerms: vendor.payment_terms_days ?? "",
    creditLimit: vendor.credit_limit ?? "",
    currency: vendor.currency_code || "INR",
    activeVendor: vendor.is_active ?? true,
    verifiedVendor: vendor.is_verified ?? false,
  };
}

function buildVendorPayload(form) {
  const optionalText = (value) =>
    value.trim() || undefined;

  const optionalNumber = (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value);

  return {
    code: form.vendorCode.trim(),
    code_int: optionalNumber(form.numericCode),
    name: form.vendorName.trim(),
    description: optionalText(form.description),
    vendor_type: form.vendorType.toUpperCase(),
    contact_person: optionalText(form.contactPerson),
    email: optionalText(form.email),
    phone: optionalText(form.phone),
    website: optionalText(form.website),
    address_line_1: optionalText(form.addressLine1),
    address_line_2: optionalText(form.addressLine2),
    city: optionalText(form.city),
    state: optionalText(form.state),
    postal_code: optionalText(form.postalCode),
    country_code: form.countryCode.trim().toUpperCase(),
    gstin: optionalText(form.gstin),
    pan: optionalText(form.pan),
    payment_terms_days: optionalNumber(form.paymentTerms),
    credit_limit: optionalNumber(form.creditLimit),
    currency_code: form.currency,
    is_active: form.activeVendor,
    is_verified: form.verifiedVendor,
  };
}

function SupplierManagement() {
  const [supplierPage, setSupplierPage] = useState(1);

  const [showSupplierForm, setShowSupplierForm] =
    useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);

  const [supplierForm, setSupplierForm] =
    useState({ ...emptySupplierForm });

  const [supplierErrors, setSupplierErrors] =
    useState({});

  const [supplierApiError, setSupplierApiError] =
    useState("");

  const [isSavingSupplier, setIsSavingSupplier] =
    useState(false);

  const [suppliers, setSuppliers] = useState([]);

  const [activeSupplierStep, setActiveSupplierStep] =
    useState(0);

  const supplierColumns = [
    { key: "serialNo", label: "S.No" },
    { key: "name", label: "Supplier Name" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ];

  const loadVendors = async () => {
    try {
      setSupplierApiError("");

      const vendorData = await getVendors();

      setSuppliers(
        vendorData.map((vendor, index) => ({
          ...vendor,
          serialNo: index + 1,
          contact: vendor.contact_person || "",
          status: vendor.is_active ? "Active" : "Inactive",
        }))
      );
    } catch (error) {
      setSupplierApiError(
        error.message || "Unable to load suppliers"
      );
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const openAddSupplierForm = () => {
    setEditingSupplier(null);
    setSupplierForm({ ...emptySupplierForm });
    setSupplierErrors({});
    setSupplierApiError("");
    setActiveSupplierStep(0);
    setShowSupplierForm(true);
  };

  const closeSupplierForm = () => {
    if (isSavingSupplier) return;

    setShowSupplierForm(false);
    setEditingSupplier(null);
    setSupplierForm({ ...emptySupplierForm });
    setSupplierErrors({});
    setSupplierApiError("");
    setActiveSupplierStep(0);
  };

  const updateSupplierField = (field, value) => {
    setSupplierForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSupplierErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSupplierApiError("");
  };

  const handleSupplierSubmit = async () => {
    const errors = {};

    if (!supplierForm.vendorCode.trim()) {
      errors.vendorCode = "Please enter vendor code";
    }

    if (!supplierForm.vendorName.trim()) {
      errors.vendorName = "Please enter vendor name";
    }

    if (!supplierForm.countryCode.trim()) {
      errors.countryCode = "Please enter country code";
    }

    if (Object.keys(errors).length > 0) {
      setSupplierErrors(errors);

      if (errors.vendorCode || errors.vendorName) {
        setActiveSupplierStep(0);
      } else {
        setActiveSupplierStep(2);
      }

      return;
    }

    const validation =
      supplierSchema.safeParse(supplierForm);

    if (!validation.success) {
      const zodErrors = {};

      validation.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });

      setSupplierErrors(zodErrors);
      setSupplierApiError(
        "Please correct the invalid supplier details."
      );

      const firstInvalidField = validation.error.issues[0]?.path[0];

      const fieldStepMap = {
        vendorType: 0,
        vendorCode: 0,
        numericCode: 0,
        vendorName: 0,
        description: 0,
        contactPerson: 1,
        email: 1,
        phone: 1,
        website: 1,
        addressLine1: 2,
        addressLine2: 2,
        city: 2,
        state: 2,
        postalCode: 2,
        countryCode: 2,
        gstin: 3,
        pan: 3,
        paymentTerms: 3,
        creditLimit: 3,
        currency: 3,
        activeVendor: 4,
        verifiedVendor: 4,
      };

      setActiveSupplierStep(
        fieldStepMap[firstInvalidField] ?? 0
      );

      return;
    }

    try {
      setIsSavingSupplier(true);
      setSupplierErrors({});
      setSupplierApiError("");

      const payload = buildVendorPayload(supplierForm);

      if (editingSupplier) {
        await updateVendor(editingSupplier.id, {
          ...payload,
          version: editingSupplier.version,
        });
      } else {
        await createVendor(payload);
      }

      await loadVendors();
      closeSupplierForm();
    } catch (error) {
      setSupplierApiError(
        error.message ||
          `Unable to ${
            editingSupplier ? "update" : "add"
          } supplier`
      );
    } finally {
      setIsSavingSupplier(false);
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm(vendorToForm(supplier));
    setSupplierErrors({});
    setSupplierApiError("");
    setActiveSupplierStep(0);
    setShowSupplierForm(true);
  };

  const handleDeleteSupplier = async (supplier) => {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setSupplierApiError("");
      await deleteVendor(supplier.id);
      await loadVendors();
    } catch (error) {
      setSupplierApiError(
        error.message || "Unable to delete supplier"
      );
    }
  };

  const handlePreviousStep = () => {
    setActiveSupplierStep((previous) =>
      Math.max(previous - 1, 0)
    );
  };

  const handleNextStep = () => {
    setActiveSupplierStep((previous) =>
      Math.min(previous + 1, supplierSteps.length - 1)
    );
  };

  return (
    <>
      <div className="supplier-header">
        <h3>Suppliers</h3>

        <Button
          className="add-supplier-button"
          onClick={openAddSupplierForm}
        >
          + Add Supplier
        </Button>
      </div>

      {supplierApiError && !showSupplierForm && (
        <p className="validation-error">
          {supplierApiError}
        </p>
      )}

      {showSupplierForm && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            {/* Header */}
            <div className="supplier-modal-header">
              <h3>
                {editingSupplier
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h3>

              <button
                type="button"
                onClick={closeSupplierForm}
                disabled={isSavingSupplier}
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="supplier-form-tabs">
              {supplierSteps.map((step, index) => (
                <button
                  type="button"
                  key={step}
                  className={`supplier-form-tab ${
                    activeSupplierStep === index ? "active" : ""
                  }`}
                  onClick={() => setActiveSupplierStep(index)}
                >
                  {step}
                </button>
              ))}
            </div>

            {/* STEP 1: VENDOR INFORMATION */}
            <div
              className="supplier-section"
              style={{
                display: activeSupplierStep === 0 ? "block" : "none",
              }}
            >
              <h4>Vendor Information</h4>

              <SelectField
                label="Vendor Type"
                name="vendorType"
                value={supplierForm.vendorType}
                onChange={(e) =>
                  updateSupplierField("vendorType", e.target.value)
                }
                options={[
                  { value: "Business", label: "Business" },
                  { value: "Individual", label: "Individual" },
                ]}
                placeholder="Select Vendor Type"
                required
              />

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="vendorCode" required>
                    Vendor Code
                  </Label>

                  <Input
                    name="vendorCode"
                    value={supplierForm.vendorCode}
                    onChange={(e) =>
                      updateSupplierField("vendorCode", e.target.value)
                    }
                    required
                  />

                  {supplierErrors.vendorCode && (
                    <p className="validation-error">
                      {supplierErrors.vendorCode}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numericCode">
                    Numeric Code
                  </Label>

                  <Input
                    name="numericCode"
                    type="number"
                    value={supplierForm.numericCode}
                    onChange={(e) =>
                      updateSupplierField("numericCode", e.target.value)
                    }
                  />
                </div>
              </div>

              <Label htmlFor="vendorName" required>
                Vendor Name
              </Label>

              <Input
                name="vendorName"
                value={supplierForm.vendorName}
                onChange={(e) =>
                  updateSupplierField("vendorName", e.target.value)
                }
                required
              />

              {supplierErrors.vendorName && (
                <p className="validation-error">
                  {supplierErrors.vendorName}
                </p>
              )}

              <Label htmlFor="description">
                Description
              </Label>

              <Textarea
                name="description"
                value={supplierForm.description}
                onChange={(e) =>
                  updateSupplierField("description", e.target.value)
                }
              />
            </div>

            {/* STEP 2: CONTACT DETAILS */}
            <div
              className="supplier-section"
              style={{
                display: activeSupplierStep === 1 ? "block" : "none",
              }}
            >
              <h4>Contact Details</h4>

              <Label htmlFor="contactPerson">
                Contact Person
              </Label>

              <Input
                name="contactPerson"
                value={supplierForm.contactPerson}
                onChange={(e) =>
                  updateSupplierField("contactPerson", e.target.value)
                }
              />

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="email">
                    Email Address
                  </Label>

                  <Input
                    name="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) =>
                      updateSupplierField("email", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number
                  </Label>

                  <Input
                    name="phone"
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) =>
                      updateSupplierField("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              <Label htmlFor="website">
                Website
              </Label>

              <Input
                name="website"
                value={supplierForm.website}
                onChange={(e) =>
                  updateSupplierField("website", e.target.value)
                }
              />
            </div>

            {/* STEP 3: ADDRESS */}
            <div
              className="supplier-section"
              style={{
                display: activeSupplierStep === 2 ? "block" : "none",
              }}
            >
              <h4>Address Details</h4>

              <Label htmlFor="addressLine1">
                Address Line 1
              </Label>

              <Input
                name="addressLine1"
                value={supplierForm.addressLine1}
                onChange={(e) =>
                  updateSupplierField("addressLine1", e.target.value)
                }
              />

              <Label htmlFor="addressLine2">
                Address Line 2
              </Label>

              <Input
                name="addressLine2"
                value={supplierForm.addressLine2}
                onChange={(e) =>
                  updateSupplierField("addressLine2", e.target.value)
                }
              />

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="city">
                    City
                  </Label>

                  <Input
                    name="city"
                    value={supplierForm.city}
                    onChange={(e) =>
                      updateSupplierField("city", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="state">
                    State
                  </Label>

                  <Input
                    name="state"
                    value={supplierForm.state}
                    onChange={(e) =>
                      updateSupplierField("state", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="postalCode">
                    Postal Code
                  </Label>

                  <Input
                    name="postalCode"
                    value={supplierForm.postalCode}
                    onChange={(e) =>
                      updateSupplierField("postalCode", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="countryCode" required>
                    Country Code
                  </Label>

                  <Input
                    name="countryCode"
                    maxLength="2"
                    value={supplierForm.countryCode}
                    onChange={(e) =>
                      updateSupplierField("countryCode", e.target.value)
                    }
                    required
                  />

                  {supplierErrors.countryCode && (
                    <p className="validation-error">
                      {supplierErrors.countryCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: TAX & PAYMENT */}
            <div
              className="supplier-section"
              style={{
                display: activeSupplierStep === 3 ? "block" : "none",
              }}
            >
              <h4>Tax &amp; Payment Details</h4>

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="gstin">
                    GSTIN
                  </Label>

                  <Input
                    name="gstin"
                    value={supplierForm.gstin}
                    onChange={(e) =>
                      updateSupplierField("gstin", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="pan">
                    PAN
                  </Label>

                  <Input
                    name="pan"
                    value={supplierForm.pan}
                    onChange={(e) =>
                      updateSupplierField("pan", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="supplier-form-row">
                <div>
                  <Label htmlFor="paymentTerms">
                    Payment Terms (Days)
                  </Label>

                  <Input
                    name="paymentTerms"
                    type="number"
                    min="0"
                    value={supplierForm.paymentTerms}
                    onChange={(e) =>
                      updateSupplierField("paymentTerms", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="creditLimit">
                    Credit Limit
                  </Label>

                  <Input
                    name="creditLimit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={supplierForm.creditLimit}
                    onChange={(e) =>
                      updateSupplierField("creditLimit", e.target.value)
                    }
                  />
                </div>
              </div>

              <SelectField
                label="Currency"
                name="currency"
                value={supplierForm.currency}
                onChange={(e) =>
                  updateSupplierField("currency", e.target.value)
                }
                options={[
                  { value: "INR", label: "INR" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ]}
                placeholder="Select Currency"
                required
              />
            </div>

            {/* STEP 5: STATUS */}
            <div
              className="supplier-section"
              style={{
                display: activeSupplierStep === 4 ? "block" : "none",
              }}
            >
              <h4>Vendor Status</h4>

              <label className="supplier-checkbox">
                <Input
                  name="activeVendor"
                  type="checkbox"
                  checked={supplierForm.activeVendor}
                  onChange={(e) =>
                    updateSupplierField("activeVendor", e.target.checked)
                  }
                />
                Active Vendor
              </label>

              <label className="supplier-checkbox">
                <Input
                  name="verifiedVendor"
                  type="checkbox"
                  checked={supplierForm.verifiedVendor}
                  onChange={(e) =>
                    updateSupplierField("verifiedVendor", e.target.checked)
                  }
                />
                Verified Vendor
              </label>
            </div>

            {supplierApiError && (
              <p className="validation-error">
                {supplierApiError}
              </p>
            )}

            {/* Previous / Next / Submit */}
            <div className="supplier-step-navigation">
              <div className="supplier-navigation-buttons">
                {activeSupplierStep > 0 && (
                  <Button
                    onClick={handlePreviousStep}
                    disabled={isSavingSupplier}
                  >
                    Previous
                  </Button>
                )}

                {activeSupplierStep < supplierSteps.length - 1 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={isSavingSupplier}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSupplierSubmit}
                    disabled={isSavingSupplier}
                  >
                    {isSavingSupplier
                      ? "Saving..."
                      : editingSupplier
                      ? "Update Supplier"
                      : "Add Supplier"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Table */}
      <DataTable
        columns={supplierColumns}
        data={suppliers}
        actions={(item) => (
          <>
            <Button onClick={() => handleEditSupplier(item)}>
              Edit
            </Button>

            <Button onClick={() => handleDeleteSupplier(item)}>
              Delete
            </Button>
          </>
        )}
      />

      {suppliers.length > 15 && (
        <Pagination
          currentPage={supplierPage}
          totalPages={Math.ceil(suppliers.length / 15)}
          onPageChange={setSupplierPage}
        />
      )}
    </>
  );
}

export default SupplierManagement;
