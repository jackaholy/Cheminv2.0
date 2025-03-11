import React, { useState, useEffect } from "react";
export const ManufacturerSelector = ({ value, onChange }) => {
  const [manufacturers, setManufacturers] = useState([]);
  useEffect(() => {
    fetch(`/api/manufacturers`)
      .then((response) => response.json())
      .then((data) => {
        setManufacturers(data);
        if (!value && data.length > 0) {
          onChange(data[0]);
        }
      })
      .catch(console.error);
  }, [value, onChange]);

  return (
    <div>
      <label className="form-label">Manufacturer Name</label>
      <select
        className="form-select"
        value={value?.id || ""}
        onChange={(e) =>
          onChange(manufacturers.find((m) => m.id === parseInt(e.target.value)))
        }
      >
        {manufacturers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
};
