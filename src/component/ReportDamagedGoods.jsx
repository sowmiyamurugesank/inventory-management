
import { useState } from "react";
import { X } from "lucide-react";
import Button from "./Button.jsx";
import "../styles/ReportDamagedGoods.css";

function ReportDamagedGoods({ record = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    productName: record.itemName ?? record.productName ?? "",
    warehouse: record.warehouse ?? "",
    zone: record.zone ?? "",
    availableQuantity: record.available ?? record.availableQuantity ?? "",
    damagedQuantity: "",
    damageType: "Physical Damage",
    reason: "",
    status: "Pending",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const damagedQuantity = Number(form.damagedQuantity);
    const availableQuantity = Number(form.availableQuantity);

    if (!form.productName.trim() || !form.warehouse.trim()) {
      window.alert("Please enter product name and warehouse.");
      return;
    }

    if (!damagedQuantity || damagedQuantity <= 0) {
      window.alert("Please enter a valid damaged quantity.");
      return;
    }

    if (
      form.availableQuantity !== "" &&
      damagedQuantity > availableQuantity
    ) {
      window.alert("Damaged quantity cannot exceed available quantity.");
      return;
    }

    if (!form.reason.trim()) {
      window.alert("Please enter the damage reason.");
      return;
    }

    onSubmit({
      ...form,
      damageDate: new Date().toISOString(),
      damagedQuantity,
      availableQuantity:
        form.availableQuantity === ""
          ? ""
          : availableQuantity - damagedQuantity,
    });
  }

  return (
    <div
      className="damage-report-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="damage-report-modal" role="dialog" aria-modal="true">
        <header className="damage-report-header">
          <div>
            <h2>Report Damaged Goods</h2>
            <p>Enter the product and damage details.</p>
          </div>

          <button
            type="button"
            className="damage-report-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="damage-report-grid">
            <label>
              Product Name *
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                readOnly={Boolean(record.itemName || record.productName)}
                required
              />
            </label>

            <label>
              Warehouse *
              <input
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                placeholder="Enter warehouse"
                readOnly={Boolean(record.warehouse)}
                required
              />
            </label>

            <label>
              Zone
              <input
                name="zone"
                value={form.zone}
                onChange={handleChange}
                placeholder="Enter zone"
                readOnly={Boolean(record.zone)}
              />
            </label>

            <label>
              Available Quantity
              <input
                type="number"
                name="availableQuantity"
                min="0"
                value={form.availableQuantity}
                onChange={handleChange}
                readOnly={record.available !== undefined || record.availableQuantity !== undefined}
              />
            </label>

            <label>
              Damaged Quantity *
              <input
                type="number"
                name="damagedQuantity"
                min="1"
                value={form.damagedQuantity}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Damage Type *
              <select
                name="damageType"
                value={form.damageType}
                onChange={handleChange}
                required
              >
                <option>Physical Damage</option>
                <option>Broken</option>
                <option>Water Damage</option>
                <option>Packaging Damage</option>
                <option>Other</option>
              </select>
            </label>

            <label className="damage-report-full">
              Reason *
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Enter the reason for damage"
                required
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>Under Inspection</option>
                <option>Resolved</option>
              </select>
            </label>
          </div>

          <footer className="damage-report-footer">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              Save Damage Report
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ReportDamagedGoods;
