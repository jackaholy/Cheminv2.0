import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
export const ManufacturerSelector = ({ value, onChange }) => {
  const [manufacturers, setManufacturers] = useState([]);
  useEffect(() => {
    fetch(`/api/manufacturers`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        setManufacturers(data);
        if (!value && data.length > 0) {
          onChange(data[0]);
        }
      })
      .catch(console.error);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const handleCreate = (inputValue) => {
    setIsLoading(true);
    fetch("/api/add_manufacturer", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: inputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        setManufacturers((prev) => [
          ...prev,
          { value: data.id, label: data.name },
        ]);
        onChange({ id: data.id, name: data.name });
      });
  };
  return (
    <div>
      <label className="form-label">Manufacturer Name</label>
      <CreatableSelect
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        options={manufacturers.map((m) => ({
          value: m.id,
          label: m.name,
        }))}
        value={value?.id ? { value: value.id, label: value.name } : null}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        onChange={(value) => {
          if (!value) {
            onChange(null);
            return;
          }
          onChange({ id: value.value, name: value.label });
        }}
        onCreateOption={handleCreate}
      />
    </div>
  );
};
