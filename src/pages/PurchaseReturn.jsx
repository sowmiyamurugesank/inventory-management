
import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

import StatCard from "../StatCard.jsx";
import Table from "../component/Table.jsx";
import "../styles/PurchaseReturn.css";

const PurchaseReturn = () => {
  const [returnData, setReturnData] = useState([]);
  const [loading, setLoading] = useState(false);

  // API fetch will be connected here
  const fetchReturns = async () => {
    try {
      setLoading(true);

      // Add your Warehouse Return API endpoint here
      // const response = await fetch(`${API_BASE_URL}/...`);
      // if (!response.ok) throw new Error("Failed to fetch returns");
      // const result = await response.json();
      // setReturnData(result.data || result);

    } catch (error) {
      console.error("Purchase Return Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const columns = [
    { key: "return_number", label: "Return Number" },
    { key: "vendor_name", label: "Vendor Name" },
    { key: "invoice_number", label: "Purchase Invoice" },
    { key: "return_date", label: "Return Date", format: "date" },
    { key: "return_reason", label: "Return Reason" },
    { key: "policy_decision", label: "Policy Decision" },
    {
      key: "total_return_amount",
      label: "Total Return Amount",
      format: "currency",
    },
    { key: "settlement_status", label: "Settlement Status" },
    { key: "status", label: "Return Status" },
  ];

  const totalReturns = returnData.length;

  const pendingReturns = returnData.filter(
    (item) => String(item.status ?? "").toUpperCase() === "PENDING"
  ).length;

  const approvedReturns = returnData.filter(
    (item) => String(item.status ?? "").toUpperCase() === "APPROVED"
  ).length;

  const totalReturnAmount = returnData.reduce(
    (total, item) =>
      total + (Number(item.total_return_amount) || 0),
    0
  );

  const handleView = (item) => {
    // View function will be implemented later
  };

  const handleEdit = (item) => {
    // Edit function will be implemented later
  };

  return (
    <div className="purchase-return-page">
      <div className="purchase-return-container">
        <h2 className="purchase-return-heading">
          Purchase Return
        </h2>

        <div className="purchase-return-stats">
          <StatCard
            title="Total Returns"
            value={totalReturns}
            icon={<Package />}
          />

          <StatCard
            title="Pending Returns"
            value={pendingReturns}
            icon={<Clock />}
          />

          <StatCard
            title="Approved Returns"
            value={approvedReturns}
            icon={<CheckCircle />}
          />

          <StatCard
            title="Total Return Amount"
            value={new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            }).format(totalReturnAmount)}
            icon={<IndianRupee />}
          />
        </div>

        {loading ? (
          <div className="purchase-return-loading">
            Loading purchase returns...
          </div>
        ) : (
          <Table
            data={returnData}
            columns={columns}
            onView={handleView}
            onEdit={handleEdit}
            type="return"
            showSearch={true}
            showCategoryFilter={false}
            showStatusFilter={true}
            statusOptions={["PENDING", "APPROVED", "REJECTED", "COMPLETED"]}
            itemsPerPage={10}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseReturn;

