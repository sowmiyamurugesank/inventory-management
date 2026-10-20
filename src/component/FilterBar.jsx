
import { useState } from "react";
import "../styles/FilterBar.css";

function FilterBar({
  onSearch,
  onDateChange,
  filters = [],
}) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  function handleSearch(value) {
    setSearch(value);
    onSearch?.(value);
  }

  function handleDateChange(value) {
    setDate(value);
    onDateChange?.(value);
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="filter-search"
        placeholder="Search..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <input
        type="date"
        className="filter-date"
        value={date}
        onChange={(e) => handleDateChange(e.target.value)}
      />

      {filters.map((filter) => (
        <select
          key={filter.name}
          className="filter-select"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          <option value="">
            All {filter.label}
          </option>

          {filter.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

export default FilterBar;
