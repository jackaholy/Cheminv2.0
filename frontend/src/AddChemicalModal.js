import React, { useState, useEffect } from "react";
import { LocationSelector } from "./LocationSelector";
import { ManufacturerSelector } from "./ManufacturerSelector";
import { StorageClassSelector } from "./StorageClassSelector";

// --- Step components (render only the inputs) ---
const ProductNumberInput = ({ productNumber, setProductNumber, onEnter }) => (
  <div>
    <label className="form-label">Product Number</label>
    <input
      type="text"
      className="form-control"
      value={productNumber}
      onInput={(e) => setProductNumber(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter && onEnter();
        }
      }}
    />
  </div>
);

const ChemicalNameInput = ({ chemicalName, setChemicalName, onEnter }) => {
  const [searchResults, setSearchResults] = useState([]);
  const searchByName = () => {
    fetch(`/api/search?query=${chemicalName}&synonyms=false`)
      .then((response) => response.json())
      .then(setSearchResults)
      .catch(console.error);
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter && onEnter();
          }
        }}
      />
      <datalist id="chemicalResultsList">
        {searchResults.map((result, index) => (
          <option key={index} value={result.chemical_name} />
        ))}
      </datalist>
    </div>
  );
};

// Updated NewChemicalType without createNewChemicalFn.
// Note that we now lift state up to the parent for newChemicalFormula and newStorageClass.
const NewChemicalType = ({
  productNumber,
  chemicalName,
  setChemicalName,
  selectedManufacturer,
  setSelectedManufacturer,
  newChemicalFormula,
  setNewChemicalFormula,
  newStorageClass,
  setNewStorageClass,
}) => {
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
          value={newChemicalFormula}
          onChange={(e) => setNewChemicalFormula(e.target.value)}
        />
        <label className="form-label">Storage Class</label>
        <StorageClassSelector
          value={newStorageClass}
          onChange={setNewStorageClass}
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
        readOnly
      />
    </div>
  );
};

// --- Main Modal as a Multi-Step Wizard ---
export const AddChemicalModal = ({ show, handleClose: parentHandleClose }) => {
  // Common chemical state.
  const [chemicalID, setChemicalID] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [productNumber, setProductNumber] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  // Steps: "product_number", "chemical_name", "manufacturer", "new_chemical", "bottle_details"
  const [step, setStep] = useState("product_number");
  const [stickerNumber, setStickerNumber] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);

  // New state variables for new chemical details.
  const [newChemicalFormula, setNewChemicalFormula] = useState("");
  const [newStorageClass, setNewStorageClass] = useState(null);

  // Reset all state when the modal closes.
  const resetState = () => {
    setChemicalID(0);
    setSelectedManufacturer(null);
    setProductNumber("");
    setChemicalName("");
    setStep("product_number");
    setStickerNumber(0);
    setSelectedLocation(null);
    setSelectedSubLocation(null);
    setNewChemicalFormula("");
    setNewStorageClass(null);
  };

  const handleClose = () => {
    resetState();
    parentHandleClose();
  };

  // Common navigation functions.
  const handleBack = () => {
    if (step === "product_number") {
      handleClose();
    } else if (step === "chemical_name") {
      setStep("product_number");
    } else if (step === "manufacturer") {
      setStep("chemical_name");
    } else if (step === "new_chemical") {
      setStep("chemical_name");
    } else if (step === "bottle_details") {
      setStep("manufacturer");
    }
  };

  const addBottle = () => {
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
      .catch(console.error);
  };

  const lookupProductNumber = () => {
    fetch(
      `/api/chemicals/product_number_lookup?product_number=${productNumber}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (Object.keys(data).length === 0) {
          setStep("chemical_name");
        } else {
          setChemicalID(data.chemical_id);
          setSelectedManufacturer(data.manufacturer);
          setStep("manufacturer");
        }
      })
      .catch(console.error);
  };
  const lookupChemicalName = () => {
    fetch(`/api/chemicals/chemical_name_lookup?chemical_name=${chemicalName}`)
      .then((response) => response.json())
      .then((data) => {
        if (Object.keys(data).length === 0) {
          setStep("new_chemical");
        } else {
          setChemicalID(data.chemical_id);
          setStep("manufacturer");
        }
      })
      .catch(console.error);
  };
  const addChemical = () => {
    // Directly create the new chemical using lifted state.
    const payload = {
      product_number: productNumber,
      chemical_name: chemicalName,
      chemical_formula: newChemicalFormula,
      storage_class_id: newStorageClass?.id,
      manufacturer_id: selectedManufacturer?.id,
    };
    fetch("/api/add_chemical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        setChemicalID(data.chemical_id);
        setStep("bottle_details");
      })
      .catch(console.error);
  };
  const handleNext = () => {
    if (step === "product_number") {
      lookupProductNumber();
    } else if (step === "chemical_name") {
      lookupChemicalName();
    } else if (step === "manufacturer") {
      setStep("bottle_details");
    } else if (step === "new_chemical") {
      addChemical();
    } else if (step === "bottle_details") {
      addBottle();
    }
  };

  // Render body based on current step.
  const renderBody = () => {
    if (step === "product_number") {
      return (
        <ProductNumberInput
          productNumber={productNumber}
          setProductNumber={setProductNumber}
          onEnter={handleNext}
        />
      );
    } else if (step === "chemical_name") {
      return (
        <ChemicalNameInput
          chemicalName={chemicalName}
          setChemicalName={setChemicalName}
          onEnter={handleNext}
        />
      );
    } else if (step === "manufacturer") {
      return (
        <>
          <p>We found your chemical, but we don't know which manufacturer.</p>
          <ManufacturerSelector
            value={selectedManufacturer}
            onChange={setSelectedManufacturer}
          />
        </>
      );
    } else if (step === "new_chemical") {
      return (
        <NewChemicalType
          productNumber={productNumber}
          chemicalName={chemicalName}
          setChemicalName={setChemicalName}
          selectedManufacturer={selectedManufacturer}
          setSelectedManufacturer={setSelectedManufacturer}
          newChemicalFormula={newChemicalFormula}
          setNewChemicalFormula={setNewChemicalFormula}
          newStorageClass={newStorageClass}
          setNewStorageClass={setNewStorageClass}
        />
      );
    } else if (step === "bottle_details") {
      return (
        <>
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
        </>
      );
    }
  };

  // Footer with consistent spacing and green "Next" button.
  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-secondary me-2"
        onClick={handleBack}
      >
        Back
      </button>
      <button type="button" className="btn btn-success" onClick={handleNext}>
        {step === "bottle_details" ? "Save Chemical" : "Next"}
      </button>
    </div>
  );

  // Header always shows title and close (x) button.
  const renderHeader = () => (
    <div className="modal-header">
      <h1 className="modal-title fs-5" id="addChemicalLabel">
        Add Chemical
      </h1>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={handleClose}
      ></button>
    </div>
  );

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          {renderHeader()}
          <div className="modal-body">{renderBody()}</div>
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};
