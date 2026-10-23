
import { Package, IndianRupee, Barcode, Tags } from "lucide-react";
import Modal1 from "../component/Modal1";
import Button from "../component/Button";
import StatCard from "../component/StatCard";
import DetailsSection from "../component/DetailsSection";
import DetailsAccordion from "../component/DetailsAccordion";
import "../styles/ProductDetails.css";

function ProductDetails({ product, onClose }) {
  if (!product) return null;

  const getValue = (...keys) => {
    for (const key of keys) {
      const value = product[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return "-";
  };

  const itemName = getValue("name", "itemName");
  const itemCode = getValue("code", "itemCode");
  const category = getValue("category_name", "category");
  const itemType = getValue("item_type", "itemType");
  const baseUnit = getValue("base_unit", "baseUnit");
  const quantity = Number(product.quantity ?? 0);

  const sellingPrice = Number(
    getValue("selling_price", "sellingPrice") === "-"
      ? 0
      : getValue("selling_price", "sellingPrice")
  );

  const currencyValue = getValue("currency_code", "currency");
  const currency = currencyValue === "-" ? "INR" : currencyValue;

  const stockStatus =
    quantity <= 0
      ? "Out of Stock"
      : quantity <= 5
        ? "Low Stock"
        : "In Stock";

  const formatPrice = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0);
    } catch {
      return `₹${Number(amount) || 0}`;
    }
  };

  const barcode = getValue("barcode", "barcode_number");
  const attributes = getValue("item_attributes", "itemAttributes", "attributes");
  
  const renderAttributes = (data) => {
    if (!data || data === "-") {
      return <p className="details-optional-note">No attributes available.</p>;
    }

    let entries = [];

    if (Array.isArray(data)) {
      entries = data.map((item, index) => [
        item.name ?? item.attribute_name ?? `Attribute ${index + 1}`,
        item.value ?? item.attribute_value ?? "-",
      ]);
    } else if (typeof data === "object") {
      entries = Object.entries(data);
    } else {
      return <p>{String(data)}</p>;
    }

    if (!entries.length) {
      return <p className="details-optional-note">No attributes available.</p>;
    }

    return (
      <div className="details-attribute-grid">
        {entries.map(([key, value], index) => (
          <div className="details-attribute" key={`${key}-${index}`}>
            <span>{String(key).replace(/_/g, " ")}</span>
            <strong>
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value ?? "-")}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal1 isOpen={!!product} onClose={onClose}>
      <main className="product-details-page">
        <header className="product-details-header">
          <div className="product-details-icon">
            <Package size={27} />
          </div>

          <div className="product-details-heading">
            <h1>{itemName}</h1>

            <p>
              Item Code: {itemCode}
              <span>•</span>
              {category}
            </p>

            <div className="product-details-badges">
              <span
                className={`details-badge ${
                  quantity <= 0
                    ? "badge-danger"
                    : quantity <= 5
                      ? "badge-warning"
                      : "badge-success"
                }`}
              >
                {stockStatus}
              </span>

              {(product.is_verified === true ||
                product.verified === true) && (
                <span className="details-badge badge-verified">
                  Verified
                </span>
              )}

              <span
                className={`details-badge ${
                  product.is_active === false ||
                  product.active === false
                    ? "badge-danger"
                    : "badge-success"
                }`}
              >
                {product.is_active === false || product.active === false
                  ? "Inactive"
                  : "Active"}
              </span>
            </div>
          </div>
        </header>

        <section className="product-details-summary">
          <StatCard
            icon={<Package size={22} />}
            title="Stock Quantity"
            value={`${quantity} ${baseUnit === "-" ? "PCS" : baseUnit}`}
          />

          <StatCard
            icon={<IndianRupee size={22} />}
            title="Selling Price"
            value={formatPrice(sellingPrice)}
          />
        </section>

        <DetailsSection
          title="Product Information"
          fields={[
            { label: "Item Code", value: itemCode },
            { label: "Item Name", value: itemName },
            { label: "Item Type", value: itemType },
            { label: "Category", value: category },
            { label: "Brand", value: getValue("brand_name", "brandName") },
            {
              label: "Manufacturer",
              value: getValue("manufacturer_name", "manufacturer"),
            },
            {
              label: "Manufacturer Part Number",
              value: getValue(
                "manufacturer_part_number",
                "manufacturerPartNumber"
              ),
            },
            { label: "Base Unit", value: baseUnit },
            { label: "Description", value: getValue("description") },
          ]}
        />

        <DetailsSection
          title="Pricing Details"
          fields={[
            {
              label: "Purchase Cost",
              value: formatPrice(
                getValue("purchase_cost", "purchaseCost") === "-"
                  ? 0
                  : getValue("purchase_cost", "purchaseCost")
              ),
            },
            {
              label: "Selling Price",
              value: formatPrice(sellingPrice),
            },
            {
              label: "MRP",
              value: formatPrice(
                getValue("mrp") === "-" ? 0 : getValue("mrp")
              ),
            },
            { label: "Currency", value: currency },
          ]}
        />

        <DetailsSection
          title="Stock Details"
          fields={[
            { label: "Stock Status", value: stockStatus },
            {
              label: "Warehouse",
              value: getValue("warehouse_name", "warehouseName"),
            },
            {
              label: "Warehouse Zone",
              value: getValue("warehouse_zone_name", "warehouseZoneName"),
            },
            {
              label: "Expiry Date",
              value: getValue("expiry_date", "expiryDate"),
            },
          ]}
        />

        {barcode !== "-" && (
          <DetailsAccordion title="Barcode">
            <div className="details-barcode">
              <Barcode size={22} />
              <strong>{barcode}</strong>
            </div>
          </DetailsAccordion>
        )}

        <DetailsAccordion title="Item Attributes">
          {renderAttributes(attributes)}
        </DetailsAccordion>

       
        {barcode === "-" && attributes === "-" && (
        <div className="details-optional-note">
            <Tags size={18} />
            Barcode and item attributes are not available for this product.
        </div>
        )}

        <div className="product-details-modal-footer">
          <Button onClick={onClose}>Close</Button>
        </div>
      </main>
    </Modal1>
  );
}

export default ProductDetails;
