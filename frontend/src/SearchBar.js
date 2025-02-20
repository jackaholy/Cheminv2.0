import React, { useRef } from "react";
import "@material/web/all.js";

const SearchBar = ({ onSearch }) => {
  const inputRef = useRef(null);

  const handleSearch = () => {
    if (onSearch && inputRef.current) {
      onSearch(inputRef.current.value);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
      <md-outlined-text-field label="Search" ref={inputRef}>
        <md-icon slot="trailing-icon">search</md-icon>
      </md-outlined-text-field>

      <md-filled-button onClick={handleSearch}>Go</md-filled-button>
    </div>
  );
};

export default SearchBar;
