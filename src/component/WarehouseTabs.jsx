const tabs = [
  "Details",
  "Address",
  "Capacity",
  "Hours",
  "Zones",
];

function WarehouseTabs({ activeTab, setActiveTab }) {
  return (
    <div className="warehouse-tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={
            activeTab === index
              ? "warehouse-tab active"
              : "warehouse-tab"
          }
          onClick={() => setActiveTab(index)}
        >
          <span className="tab-number">{index + 1}</span>
          {tab}
        </button>
      ))}
    </div>
  );
}

export default WarehouseTabs;