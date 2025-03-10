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

export const AddChemicalModal = ({ show, handleClose }) => {
  const [chemicalID, setChemicalID] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState({});

  const [productNumber, setProductNumber] = useState("");
  const [chemicalName, setChemicalName] = useState("");

  const [chemicalLookupMethod, setChemicalLookupMethod] =
    useState("product_number");

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSubLocation, setSelectedSubLocation] = useState("");
  const [stickerNumber, setStickerNumber] = useState(0);

  useEffect(() => {
    fetch(`/api/locations`)
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
        setSelectedLocation(data[0]);
        setSelectedSubLocation(data[0].sub_locations[0]);
      })
      .catch((error) => console.error(error));
  }, []);

  function addBottle() {
    fetch("/api/add_bottle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chemical_id: chemicalID,
        manufacturer_id: selectedManufacturer.id,
        location_id: selectedLocation.id,
        sub_location_id: selectedSubLocation.sub_location_id,
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

  console.log(chemicalLookupMethod);
  console.log(chemicalID);

  // Branches for different chemical lookup methods
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
          Enter the details below
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
        <ManufacturerInput setSelectedManufacturer={setSelectedManufacturer} />
      </ModalWrapper>
    );
  }

  // Default modal for adding bottle details
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
        data-bs-dismiss="modal"
        aria-label="Close"
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

      <div className="grouped-section">
        <label className="form-label">Location</label>
        <select
          className="form-select"
          onChange={(e) =>
            setSelectedLocation(
              locations.find(
                (location) => location.location_id === parseInt(e.target.value)
              )
            )
          }
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
          onChange={(e) =>
            setSelectedSubLocation(
              selectedLocation.sub_locations.find(
                (sub_location) =>
                  sub_location.sub_location_id === parseInt(e.target.value)
              )
            )
          }
        >
          {selectedLocation &&
            selectedLocation.sub_locations &&
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
        placeholder=""
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
        placeholder=""
        value={chemicalName}
        onInput={(e) => {
          setChemicalName(e.target.value);
          searchByName();
        }}
        onKeyDown={(e) => e.key === "Enter" && lookupChemicalByName()}
      />
      <datalist id="chemicalResultsList">
        {searchResults.map((result, index) => (
          <option key={index}>{result.chemical_name}</option>
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
  const [storageClasses, setStorageClasses] = useState([]);
  const [selectedStorageClass, setSelectedStorageClass] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    fetch(`/api/manufacturers`)
      .then((response) => response.json())
      .then((data) => {
        setManufacturers(data);
        setSelectedManufacturer(data[0]);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch(`/api/storage_classes`)
      .then((response) => response.json())
      .then((data) => {
        setStorageClasses(data);
        setSelectedStorageClass(data[0]);
      })
      .catch((error) => console.error(error));
  }, []);

  const createNewChemical = () => {
    const data = {
      product_number: productNumber,
      chemical_name: chemicalName,
      chemical_formula: chemicalFormula,
      storage_class_id: selectedStorageClass.id,
      manufacturer_id: selectedManufacturer.id,
    };
    console.log(data);
    fetch("/api/add_chemical", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setChemicalID(data.chemical_id);
      })
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
          placeholder=""
          value={chemicalFormula}
          onChange={(e) => setChemicalFormula(e.target.value)}
        />
        <label className="form-label">Storage Class</label>
        <select
          className="form-select"
          value={selectedStorageClass?.id}
          onChange={(e) =>
            setSelectedStorageClass(
              storageClasses.find(
                (storageClass) => storageClass.id === parseInt(e.target.value)
              )
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

      <label className="form-label">Manufacturer Name</label>
      <select
        className="form-select"
        value={selectedManufacturer?.id}
        onChange={(e) =>
          setSelectedManufacturer(
            manufacturers.find(
              (manufacturer) => manufacturer.id === parseInt(e.target.value)
            )
          )
        }
      >
        {manufacturers.map((manufacturer) => (
          <option key={manufacturer.id} value={manufacturer.id}>
            {manufacturer.name}
          </option>
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
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
          aria-label="Close"
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

const ManufacturerInput = ({
  setSelectedManufacturer,
  selectedManufacturer,
}) => {
  const [manufacturers, setManufacturers] = useState([]);
  useEffect(() => {
    fetch(`/api/manufacturers`)
      .then((response) => response.json())
      .then((data) => {
        setManufacturers(data);
        setSelectedManufacturer(data[0]);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <div>
      <label className="form-label">Manufacturer Name</label>
      <select
        className="form-select"
        value={selectedManufacturer?.id}
        onChange={(e) =>
          setSelectedManufacturer(
            manufacturers.find(
              (manufacturer) => manufacturer.id === parseInt(e.target.value)
            )
          )
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
