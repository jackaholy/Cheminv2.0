import React, { useState, useEffect } from "react";

// Reusable modal container component
const ModalWrapper = ({ show, handleClose, header, children, footer }) => (
  <div
    className={`modal fade ${show ? "show d-block" : "d-none"}`}
    tabIndex="-1"
  >
    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div className="modal-content">
        {header && (
          <div className="modal-header">
            {header}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  </div>
);

// --- New Components for Server Data ---

// LocationSelector fetches locations and manages both location and sub-location selection.
const LocationSelector = ({ onChange }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);

  useEffect(() => {
    fetch(`/api/locations`)
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
        const initialLocation = data[0];
        const initialSubLocation = data[0].sub_locations[0];
        setSelectedLocation(initialLocation);
        setSelectedSubLocation(initialSubLocation);
        onChange && onChange(initialLocation, initialSubLocation);
      })
      .catch((error) => console.error(error));
  }, [onChange]);

  const handleLocationChange = (e) => {
    const locationId = parseInt(e.target.value);
    const location = locations.find((loc) => loc.location_id === locationId);
    setSelectedLocation(location);
    const newSubLocation = location.sub_locations[0];
    setSelectedSubLocation(newSubLocation);
    onChange && onChange(location, newSubLocation);
  };

  const handleSubLocationChange = (e) => {
    const subLocationId = parseInt(e.target.value);
    const subLocation = selectedLocation.sub_locations.find(
      (sub) => sub.sub_location_id === subLocationId
    );
    setSelectedSubLocation(subLocation);
    onChange && onChange(selectedLocation, subLocation);
  };

  return (
    <div className="grouped-section">
      <label className="form-label">Location</label>
      <select
        className="form-select"
        value={selectedLocation ? selectedLocation.location_id : ""}
        onChange={handleLocationChange}
      >
        {locations.map((location) => (
          <option key={location.location_id} value={location.location_id}>
            {location.building} {location.room}
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
          selectedLocation.sub_locations.map((sub_location) => (
            <option
              key={sub_location.sub_location_id}
              value={sub_location.sub_location_id}
            >
              {sub_location.sub_location_name}
            </option>
          ))}
      </select>
    </div>
  );
};

// ManufacturerSelector fetches the list of manufacturers and renders a select field.
const ManufacturerSelector = ({ value, onChange }) => {
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
      .catch((error) => console.error(error));
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
        {manufacturers.map((manufacturer) => (
          <option key={manufacturer.id} value={manufacturer.id}>
            {manufacturer.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// StorageClassSelector fetches storage classes and renders a select field.
const StorageClassSelector = ({ value, onChange }) => {
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
      .catch((error) => console.error(error));
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
        {storageClasses.map((storageClass) => (
          <option key={storageClass.id} value={storageClass.id}>
            {storageClass.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// --- Main Modal and Other Inputs ---

export const AddChemicalModal = ({ show, handleClose }) => {
  const [chemicalID, setChemicalID] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [productNumber, setProductNumber] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  const [chemicalLookupMethod, setChemicalLookupMethod] =
    useState("product_number");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);
  const [stickerNumber, setStickerNumber] = useState(0);

  function addBottle() {
    fetch("/api/add_bottle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chemical_id: chemicalID,
        manufacturer_id: selectedManufacturer?.id,
        location_id: selectedLocation?.location_id,
        sub_location_id: selectedSubLocation?.sub_location_id,
        sticker_number: stickerNumber,
        product_number: productNumber,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        handleClose();
      })
      .catch((error) => console.error(error));
  }

  console.log(chemicalLookupMethod, chemicalID);

  if (chemicalLookupMethod === "product_number" && !chemicalID) {
    return (
      <ModalWrapper show={show} handleClose={handleClose}>
        <ProductNumberInput
          setChemicalID={setChemicalID}
          selectedManufacturer={selectedManufacturer}
          setSelectedManufacturer={setSelectedManufacturer}
          productNumber={productNumber}
          setProductNumber={setProductNumber}
          setChemicalLookupMethod={setChemicalLookupMethod}
        />
      </ModalWrapper>
    );
  }

  if (chemicalLookupMethod === "chemical_name" && !chemicalID) {
    return (
      <ModalWrapper show={show} handleClose={handleClose}>
        <p className="text-danger">
          We couldn't find {productNumber}. Try looking chemical up by name
          instead:
        </p>
        <ChemicalNameInput
          setChemicalID={setChemicalID}
          setChemicalLookupMethod={setChemicalLookupMethod}
          chemicalName={chemicalName}
          setChemicalName={setChemicalName}
        />
      </ModalWrapper>
    );
  }

  if (chemicalLookupMethod === "new_chemical" && !chemicalID) {
    return (
      <ModalWrapper show={show} handleClose={handleClose}>
        <p>
          Looks like we couldn't find your chemical by product number or name.
          Enter the details below:
        </p>
        <NewChemicalType
          productNumber={productNumber}
          setChemicalID={setChemicalID}
          selectedManufacturer={selectedManufacturer}
          setSelectedManufacturer={setSelectedManufacturer}
          setChemicalLookupMethod={setChemicalLookupMethod}
          chemicalName={chemicalName}
          setChemicalName={setChemicalName}
        />
      </ModalWrapper>
    );
  }

  if (chemicalLookupMethod === "chemical_name" && chemicalID) {
    const footer = (
      <button
        type="button"
        className="btn btn-success"
        onClick={() => setChemicalLookupMethod("chemical_found")}
      >
        Next
      </button>
    );
    return (
      <ModalWrapper show={show} handleClose={handleClose} footer={footer}>
        <p>We found your chemical, but we don't know which manufacturer</p>
        <ManufacturerSelector
          value={selectedManufacturer}
          onChange={setSelectedManufacturer}
        />
      </ModalWrapper>
    );
  }

  // Default modal for adding bottle details.
  const header = (
    <h1 className="modal-title fs-5" id="addChemicalLabel">
      Add Chemical
    </h1>
  );
  const footer = (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setChemicalLookupMethod("product_number");
          setChemicalID(0);
        }}
      >
        Back
      </button>
      <button type="button" className="btn btn-primary" onClick={addBottle}>
        Save Chemical
      </button>
    </>
  );

  return (
    <ModalWrapper
      show={show}
      handleClose={handleClose}
      header={header}
      footer={footer}
    >
      <div className="grouped-section">
        <label className="form-label">Sticker Number</label>
        <input
          type="number"
          className="form-control"
          value={stickerNumber}
          onChange={(e) => setStickerNumber(parseInt(e.target.value))}
        />
      </div>
      <LocationSelector
        onChange={(loc, subLoc) => {
          setSelectedLocation(loc);
          setSelectedSubLocation(subLoc);
        }}
      />
    </ModalWrapper>
  );
};

const ProductNumberInput = ({
  setChemicalID,
  selectedManufacturer,
  setSelectedManufacturer,
  productNumber,
  setProductNumber,
  setChemicalLookupMethod,
}) => {
  const lookupProductNumber = () => {
    fetch(
      `/api/chemicals/product_number_lookup?product_number=${productNumber}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProductNumber(productNumber);
        if (Object.keys(data).length === 0) {
          setChemicalLookupMethod("chemical_name");
          return;
        }
        setChemicalID(data.chemical_id);
        setSelectedManufacturer(data.manufacturer);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <label className="form-label">Product Number</label>
      <input
        type="text"
        className="form-control"
        value={productNumber}
        onInput={(e) => setProductNumber(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && lookupProductNumber()}
      />
      <button
        type="button"
        className="ms-auto btn btn-success mt-2"
        onClick={lookupProductNumber}
      >
        Next
      </button>
    </div>
  );
};

const ChemicalNameInput = ({
  chemicalName,
  setChemicalName,
  setSelectedManufacturer,
  setChemicalID,
  setChemicalLookupMethod,
}) => {
  const [searchResults, setSearchResults] = useState([]);

  const searchByName = () => {
    fetch(`/api/search?query=${chemicalName}&synonyms=false`)
      .then((response) => response.json())
      .then((data) => setSearchResults(data))
      .catch((error) => console.error(error));
  };

  const lookupChemicalByName = () => {
    fetch("/api/chemicals/chemical_name_lookup?chemical_name=" + chemicalName)
      .then((response) => response.json())
      .then((data) => {
        if (Object.keys(data).length === 0) {
          setChemicalLookupMethod("new_chemical");
          return;
        }
        setChemicalID(data.chemical_id);
      });
  };

  return (
    <div>
      <label className="form-label">Chemical Name</label>
      <input
        list="chemicalResultsList"
        type="text"
        className="form-control"
        value={chemicalName}
        onInput={(e) => {
          setChemicalName(e.target.value);
          searchByName();
        }}
        onKeyDown={(e) => e.key === "Enter" && lookupChemicalByName()}
      />
      <datalist id="chemicalResultsList">
        {searchResults.map((result, index) => (
          <option key={index} value={result.chemical_name} />
        ))}
      </datalist>
      <button
        type="button"
        className="ms-auto btn btn-secondary mt-2 me-1"
        onClick={() => {
          setChemicalLookupMethod("product_number");
          setChemicalID(0);
        }}
      >
        Back
      </button>
      <button
        type="button"
        className="ms-auto btn btn-success mt-2"
        onClick={lookupChemicalByName}
      >
        Next
      </button>
    </div>
  );
};

const NewChemicalType = ({
  productNumber,
  setProductNumber,
  setChemicalID,
  selectedManufacturer,
  setSelectedManufacturer,
  chemicalName,
  setChemicalName,
  setChemicalLookupMethod,
}) => {
  const [chemicalFormula, setChemicalFormula] = useState("");
  const [selectedStorageClass, setSelectedStorageClass] = useState(null);

  const createNewChemical = () => {
    const data = {
      product_number: productNumber,
      chemical_name: chemicalName,
      chemical_formula: chemicalFormula,
      storage_class_id: selectedStorageClass?.id,
      manufacturer_id: selectedManufacturer?.id,
    };
    console.log(data);
    fetch("/api/add_chemical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => setChemicalID(data.chemical_id))
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <div>
        <label className="form-label">Chemical Name</label>
        <input
          type="text"
          className="form-control"
          value={chemicalName}
          onChange={(e) => setChemicalName(e.target.value)}
        />
        <label className="form-label">Chemical Formula/Common Name</label>
        <input
          type="text"
          className="form-control"
          value={chemicalFormula}
          onChange={(e) => setChemicalFormula(e.target.value)}
        />
        <StorageClassSelector
          value={selectedStorageClass}
          onChange={setSelectedStorageClass}
        />
      </div>
      <ManufacturerSelector
        value={selectedManufacturer}
        onChange={setSelectedManufacturer}
      />
      <label className="form-label">Product Number</label>
      <input
        type="text"
        className="form-control"
        placeholder="N0155"
        value={productNumber}
        onChange={(e) => setProductNumber(e.target.value)}
      />
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setChemicalLookupMethod("chemical_name");
            setChemicalID(0);
          }}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={createNewChemical}
        >
          Create
        </button>
      </div>
    </div>
  );
};
