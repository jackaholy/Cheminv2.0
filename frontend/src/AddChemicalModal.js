import React, { useState, useEffect } from "react";

export const AddChemicalModal = ({ show, parentHandleClose }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState({});
  const [productNumber, setProductNumber] = useState("");
  const [stickerNumber, setStickerNumber] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  const [chemicalFormula, setChemicalFormula] = useState("");
  const [storageClass, setStorageClass] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [productNumberSubmitted, setProductNumberSubmitted] = useState(false);
  const [chemicalNameSubmitted, setChemicalNameSubmitted] = useState(false);

  function handleClose() {
    clearFields();
    parentHandleClose();
  }

  const clearFields = () => {
    setProductNumber("");
    setStickerNumber("");
    setChemicalName("");
    setChemicalFormula("");
    setStorageClass("");
    setSelectedLocation({});
    setSelectedManufacturer({});
    setAutoFilled(false);
    setProductNumberSubmitted(false);
  };

  const lookupProductNumber = () => {
    fetch(
      `/api/chemicals/product_number_lookup?product_number=${productNumber}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProductNumberSubmitted(true);
        if (Object.keys(data).length === 0) {
          setAutoFilled(false);

          return;
        }
        setChemicalName(data.chemical_name);
        setChemicalFormula(data.chemical_formula);
        setSelectedManufacturer(
          manufacturers.find(
            (manufacturer) => manufacturer.name === data.manufacturer
          )
        );
        setStorageClass(data.storage_class);
        setAutoFilled(true);
      })
      .catch((error) => console.error(error));
  };
  const lookupChemicalByName = () => {
    console.log("here");
  };

  const addChemical = () => {
    console.log(
      JSON.stringify({
        sticker_number: stickerNumber,
        chemical_name: chemicalName,
        chemical_formula: chemicalFormula,
        storage_class: storageClass,
        location_id: selectedLocation.id,
        manufacturer_id: selectedManufacturer.id,
        product_number: productNumber,
      })
    );
  };

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
  if (!productNumberSubmitted) {
    return (
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-body">
              <ProductNumberInput
                productNumber={productNumber}
                setProductNumber={setProductNumber}
                lookupProductNumber={lookupProductNumber}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!autoFilled && !chemicalNameSubmitted) {
    return (
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-body">
              <p className="text-danger">
                We couldn't find {productNumber}. Try looking chemical up by
                name instead:
              </p>
              <ChemicalNameInput
                clearFields={clearFields}
                chemicalName={chemicalName}
                setChemicalName={setChemicalName}
                lookupChemicalByName={lookupChemicalByName}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addChemicalLabel">
              Add Chemical
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
            {autoFilled ? (
              <p className="text-success">
                We found {productNumber}, just fill in the following details
              </p>
            ) : (
              <p className="text-danger">
                We couldn't find {productNumber}, please enter it manually
              </p>
            )}
            {/* Identification Section */}
            <div className="grouped-section">
              <label className="form-label">Sticker Number</label>
              <input
                type="number"
                className="form-control"
                value={stickerNumber}
                onChange={(e) => {
                  setStickerNumber(e.target.value);
                }}
              />
              {!autoFilled && (
                <div>
                  <label className="form-label">Chemical Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={chemicalName}
                    onChange={(e) => {
                      setChemicalName(e.target.value);
                    }}
                  />
                  <label className="form-label">
                    Chemical Formula/Common Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    value={chemicalFormula}
                    onChange={(e) => {
                      setChemicalFormula(e.target.value);
                    }}
                  />
                  <label className="form-label">Storage Class</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Corr White"
                    value={storageClass}
                    onChange={(e) => {
                      setStorageClass(e.target.value);
                    }}
                  />
                </div>
              )}
              {/*
              <button type="button" className="btn btn-secondary">
                Select Chemical
              </button>
              <button type="button" className="btn btn-secondary">
                Fix Chemical Typo
              </button>
              */}
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
            {!autoFilled && (
              <div className="grouped-section">
                <label className="form-label">Manufacturer Name</label>
                <select
                  className="form-select"
                  value={selectedManufacturer?.id}
                  onChange={(e) =>
                    setSelectedManufacturer(
                      manufacturers.find(
                        (manufacturer) =>
                          manufacturer.id === parseInt(e.target.value)
                      )
                    )
                  }
                >
                  {manufacturers.map((manufacturer) => (
                    <option value={manufacturer.id}>{manufacturer.name}</option>
                  ))}
                </select>
                <label className="form-label">Product Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="N0155"
                  value={productNumber}
                  onChange={(e) => setProductNumber(e.target.value)}
                />
                <label className="form-label">Material Safety Data Sheet</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MSDS Link"
                />
                <button type="button" className="btn btn-secondary">
                  Add Manufacturer
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                clearFields();
              }}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={addChemical}
            >
              Save Chemical
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const ChemicalNameInput = ({
  chemicalName,
  setChemicalName,
  clearFields,
  lookupChemicalByName,
}) => {
  const [searchResults, setSearchResults] = useState([]);
  function searchByName() {
    fetch(`/api/search?query=${chemicalName}&synonyms=false`)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data);
      })
      .catch((error) => console.error(error));
  }
  return (
    <div>
      <label className="form-label">Chemical Name</label>
      <input
        list="chemicalResultsList"
        type="text"
        className="form-control"
        placeholder=""
        value={chemicalName}
        onInput={(e) => {
          setChemicalName(e.target.value);
          searchByName();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            lookupChemicalByName();
          }
        }}
      />
      <datalist id="chemicalResultsList">
        {searchResults.map((result) => (
          <option>{result.chemical_name}</option>
        ))}
      </datalist>

      <button
        type="button"
        className="ms-auto btn btn-secondary mt-2 me-1"
        onClick={clearFields}
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

const ProductNumberInput = ({
  productNumber,
  setProductNumber,
  lookupProductNumber,
}) => {
  return (
    <div>
      <label className="form-label">Product Number</label>
      <input
        type="text"
        className="form-control"
        placeholder=""
        value={productNumber}
        onInput={(e) => {
          setProductNumber(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            lookupProductNumber();
          }
        }}
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
