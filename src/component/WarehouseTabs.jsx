
import "../styles/WarehouseTabs.css";

function WarehouseTabs({
  tabs = [],
  activeTab = 0,
  setActiveTab,
  disabled = false,
}) {
  return (
    <nav className="" aria-label="Form steps">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`warehouse-tab ${
            activeTab === index ? "active" : ""
          } ${activeTab > index ? "completed" : ""}`}
          onClick={() => setActiveTab(index)}
          disabled={disabled}
          aria-current={activeTab === index ? "step" : undefined}
        >
          
          <span>{tab}</span>
        </button>
      ))}
    </nav>
  );
}

export default WarehouseTabs;
