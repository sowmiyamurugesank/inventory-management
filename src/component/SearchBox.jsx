
import "../styles/SearchBox.css";

function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBox;
