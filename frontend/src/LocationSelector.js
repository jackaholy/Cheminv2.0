import React, { useState, useEffect } from "react";
export const LocationSelector = ({ onChange }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);

  useEffect(() => {
    fetch(`/api/locations`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
        const initLoc = data[0];
        const initSub = data[0].sub_locations[0];
        setSelectedLocation(initLoc);
        setSelectedSubLocation(initSub);
        onChange && onChange(initLoc, initSub);
      })
      .catch(console.error);
  }, []);

  const handleLocationChange = (e) => {
    const locationId = parseInt(e.target.value);
    const location = locations.find((loc) => loc.location_id === locationId);
    setSelectedLocation(location);
    const newSub = location.sub_locations[0];
    setSelectedSubLocation(newSub);
    onChange && onChange(location, newSub);
  };

  const handleSubLocationChange = (e) => {
    const subId = parseInt(e.target.value);
    const sub = selectedLocation.sub_locations.find(
      (subLoc) => subLoc.sub_location_id === subId
    );
    setSelectedSubLocation(sub);
    onChange && onChange(selectedLocation, sub);
  };

  return (
    <div className="grouped-section">
      <label className="form-label">Location</label>
      <select
        className="form-select"
        value={selectedLocation ? selectedLocation.location_id : ""}
        onChange={handleLocationChange}
      >
        {locations.map((loc) => (
          <option key={loc.location_id} value={loc.location_id}>
            {loc.building} {loc.room}
          </option>
        ))}
      </select>
      <label className="form-label">Sub-Location</label>
      <select
        className="form-select"
        value={selectedSubLocation ? selectedSubLocation.sub_location_id : ""}
        onChange={handleSubLocationChange}
      >
        {selectedLocation &&
          selectedLocation.sub_locations.map((sub) => (
            <option key={sub.sub_location_id} value={sub.sub_location_id}>
              {sub.sub_location_name}
            </option>
          ))}
      </select>
    </div>
  );
};
