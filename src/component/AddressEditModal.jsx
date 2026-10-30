
import { useEffect, useState } from "react";
import "../styles/AddressEditModal.css";

const EMPTY_ADDRESS = {
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
};

function AddressEditModal({
  isOpen,
  initialAddress = {},
  onClose,
  onSave,
  saving = false,
}) {
  const [formData, setFormData] = useState(EMPTY_ADDRESS);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        address_line_1: initialAddress.address_line_1 ?? "",
        address_line_2: initialAddress.address_line_2 ?? "",
        city: initialAddress.city ?? "",
        state: initialAddress.state ?? "",
        country: initialAddress.country ?? "",
        postal_code: initialAddress.postal_code ?? "",
      });

      setError("");
    }
  }, [isOpen, initialAddress]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.address_line_1.trim()) {
      setError("Address Line 1 is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!formData.country.trim()) {
      setError("Country is required.");
      return;
    }

    try {
      setError("");

      await onSave({
        address_line_1: formData.address_line_1.trim(),
        address_line_2: formData.address_line_2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        postal_code: formData.postal_code.trim(),
      });
    } catch (err) {
      setError(err.message || "Unable to save the address.");
    }
  }

  return (
    <div
      className="address-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        className="address-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
      >
        <div className="address-modal-header">
          <div>
            <h2 id="address-modal-title">Edit Warehouse Address</h2>
            <p>Update the warehouse's address details.</p>
          </div>

          <button
            type="button"
            className="address-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="address-modal-body">
            <div className="address-form-field">
              <label htmlFor="address_line_1">
                Address Line 1 <span>*</span>
              </label>

              <input
                id="address_line_1"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="House number, street name"
                autoComplete="address-line1"
                required
              />
            </div>

            <div className="address-form-field">
              <label htmlFor="address_line_2">Address Line 2</label>

              <input
                id="address_line_2"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                placeholder="Area, locality, landmark"
                autoComplete="address-line2"
              />
            </div>

            <div className="address-form-grid">
              <div className="address-form-field">
                <label htmlFor="address_city">
                  City <span>*</span>
                </label>

                <input
                  id="address_city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="address-form-field">
                <label htmlFor="address_state">State</label>

                <input
                  id="address_state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  autoComplete="address-level1"
                />
              </div>

              <div className="address-form-field">
                <label htmlFor="address_country">
                  Country <span>*</span>
                </label>

                <input
                  id="address_country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  autoComplete="country-name"
                  required
                />
              </div>

              <div className="address-form-field">
                <label htmlFor="address_postal_code">Postal Code</label>

                <input
                  id="address_postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  autoComplete="postal-code"
                />
              </div>
            </div>

            {error && (
              <p className="address-modal-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="address-modal-footer">
            <button
              type="button"
              className="address-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="address-btn-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddressEditModal;
