import { useState } from "react";
import {
    Package,
    AlertTriangle,
    PackageX,
    IndianRupee,
} from "lucide-react";

import ProductManagement from "../component/ProductManagement";
import StatCard from "../StatCard";
import "../styles/Product.css";

function Products() {
    const [activeTab, setActiveTab] = useState("All Products");

    const tabs = [
        "All Products",
        "Categories",
        "Stock Management",
        "Suppliers",
    ];

    return (
        <div className="products-page">

            {/* Heading */}
            <div className="products-heading">
                <Package className="products-heading-icon" />

                <div>
                    <h1>Products</h1>
                    <p>
                        Manage your products, categories, stock and suppliers.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="product-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={
                            activeTab === tab
                                ? "product-tab active"
                                : "product-tab"
                        }
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="product-cards">
                <StatCard
                    title="Total Products"
                    value="0"
                    icon={<Package className="stat-icon-image" />}
                />

                <StatCard
                    title="Low Stock"
                    value="0"
                    icon={<AlertTriangle className="stat-icon-image" />}
                />

                <StatCard
                    title="Out of Stock"
                    value="0"
                    icon={<PackageX className="stat-icon-image" />}
                />

                <StatCard
                    title="Total Value"
                    value="₹ 0.00"
                    icon={<IndianRupee className="stat-icon-image" />}
                />
            </div>

            {/* Categories / Stock Management / Suppliers */}
            {activeTab !== "All Products" && (
                <div className="product-tab-content">
                    <ProductManagement activeTab={activeTab} />
                </div>
            )}

        </div>
    );
}

export default Products;