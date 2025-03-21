import React, { useState, useEffect } from "react";
export const StorageClassSelector = ({ value, onChange }) => {
  const [storageClasses, setStorageClasses] = useState([]);
  useEffect(() => {
    fetch(`/api/storage_classes`)
      .then((response) => response.json())
      .then((data) => {
        setStorageClasses(data);
        if (!value && data.length > 0) {
          onChange(data[0]);
        }
      })
      .catch(console.error);
  }, [value, onChange]);

  return (
    <div>
      <label className="form-label">Storage Class</label>
      <select
        className="form-select"
        value={value?.id || ""}
        onChange={(e) =>
          onChange(
            storageClasses.find((s) => s.id === parseInt(e.target.value))
          )
        }
      >
        {storageClasses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
};
