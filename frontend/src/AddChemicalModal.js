const AddChemicalModal = ({ show, handleClose }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [manufacturers, setManufacturers] = useState([]);
  useEffect(() => {
    fetch(`/api/locations`)
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    fetch(`/api/manufacturers`)
      .then((response) => response.json())
      .then((data) => setManufacturers(data))
      .catch((error) => console.error(error));
  }, []);
  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addChemicalLabel">
              Acetic Acid
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Identification Section */}
            <div className="grouped-section">
              <label className="form-label">Sticker Number</label>
              <input type="number" className="form-control" />
              <label className="form-label">Chemical Name</label>
              <input type="text" className="form-control" />
              <label className="form-label">Chemical Formula/Common Name</label>
              <input type="text" className="form-control" placeholder="" />
              <label className="form-label">Storage Class</label>
              <input
                type="text"
                className="form-control"
                placeholder="Corr White"
              />
              <button type="button" className="btn btn-secondary">
                Select Chemical
              </button>
              <button type="button" className="btn btn-secondary">
                Fix Chemical Typo
              </button>
            </div>

            {/* Quantity Section */}
            {/* Unused Steve Harper feature? */}
            {/*
            <div className="grouped-section">
              <label className="form-label">Quantity</label>
              <input type="text" className="form-control" placeholder="1" />
              <label className="form-label">Unit</label>
              <select className="form-select">
                <option selected>Bottle</option>
                <option value="Liters">Liters</option>
                <option value="Milliliters">Milliliters</option>
                <option value="Kilograms">Kilograms</option>
              </select>
            </div>
            */}

            {/* Update Info Section */}
            {/* Automatically filled in with current user */}
            {/*
            <div className="grouped-section">
              <label className="form-label">Last Updated</label>
              <input
                type="text"
                className="form-control"
                placeholder="2024-09-19"
                readOnly
              />
              <label className="form-label">Updated By</label>
              <input
                type="text"
                className="form-control"
                placeholder="emowat"
                readOnly
              />
            </div>
            */}

            {/* Location Section */}
            <div className="grouped-section">
              <label className="form-label">Location</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setSelectedLocation(
                    locations.find(
                      (location) =>
                        location.location_id === parseInt(e.target.value)
                    )
                  )
                }
              >
                {locations.map((location) => (
                  <option value={location.location_id}>
                    {location.building} {location.room}
                  </option>
                ))}
              </select>
              <label className="form-label">Sub-Location</label>
              <select className="form-select">
                {selectedLocation &&
                  selectedLocation.sub_locations &&
                  selectedLocation.sub_locations.map((sub_location) => (
                    <option value={sub_location.sub_location_id}>
                      {sub_location.sub_location_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Manufacturer Section */}
            <div className="grouped-section">
              <label className="form-label">Manufacturer Name</label>
              <select className="form-select">
                {manufacturers.map((manufacturer) => (
                  <option value={manufacturer.id}>{manufacturer.name}</option>
                ))}
              </select>
              <label className="form-label">Product Number</label>
              <input type="text" className="form-control" placeholder="N0155" />
              <label className="form-label">Material Safety Data Sheet</label>
              <input
                type="text"
                className="form-control"
                placeholder="MSDS Link"
                readOnly
              />
              <button type="button" className="btn btn-secondary">
                Add Manufacturer
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary">
              Save Chemical
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
