import "./Modal.css";

function Modal({ product, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal">

                <div className="modal-header">
                    <h2>Product Details</h2>
                    <button onClick={onClose}>×</button>
                </div>

                <div className="product-details">

                    <div className="detail-row">
                        <span>Product Code</span>
                        <strong>{product.code}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Product Name</span>
                        <strong>{product.name}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Brand</span>
                        <strong>{product.brand_name}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Unit</span>
                        <strong>{product.base_unit}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Purchase Cost</span>
                        <strong>₹{product.purchase_cost}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Selling Price</span>
                        <strong>₹{product.selling_price}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Status</span>
                        <strong>{product.status}</strong>
                    </div>

                </div>

                <div className="modal-footer">
                    <button onClick={onClose}>Close</button>
                </div>

            </div>
        </div>
    );
}

export default Modal;