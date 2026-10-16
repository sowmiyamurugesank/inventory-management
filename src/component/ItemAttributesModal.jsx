
import "../styles/Modal.css";

function ItemAttributesModal({ attributes, setAttributes, onClose }) {
  function addAttribute() {
    setAttributes([
      ...attributes,
      { name: "", value: "" },
    ]);
  }

  function updateAttribute(index, field, value) {
    setAttributes(
      attributes.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeAttribute(index) {
    setAttributes(attributes.filter((_, i) => i !== index));
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Item Attributes</h2>

        {attributes.map((item, index) => (
          <div className="attribute-row" key={index}>
            <input
              placeholder="Attribute name"
              value={item.name}
              onChange={(e) =>
                updateAttribute(index, "name", e.target.value)
              }
            />

            <input
              placeholder="Value"
              value={item.value}
              onChange={(e) =>
                updateAttribute(index, "value", e.target.value)
              }
            />

            <button type="button" onClick={() => removeAttribute(index)}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addAttribute}>
          + Add Attribute
        </button>

        <button type="button" onClick={onClose}>
          Save Attributes
        </button>
      </div>
    </div>
  );
}

export default ItemAttributesModal;
