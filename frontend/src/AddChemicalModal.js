import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationSelector } from "./LocationSelector";
import { ManufacturerSelector } from "./ManufacturerSelector";
import { StorageClassSelector } from "./StorageClassSelector";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

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
  const searchByName = (query = chemicalName) => {
    fetch(`/api/search?query=${query}&synonyms=false`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then(setSearchResults)
      .catch(console.error);
  };

  return (
    <div>
      <label className="form-label">Chemical Name</label>
      {/*<Select
        value={{
          value: chemicalName,
          label: chemicalName,
        }}
        options={searchResults.map((result) => ({
          value: result.chemical_name,
          label: result.chemical_name,
        }))}
        onChange={(newValue) => {
          setChemicalName(newValue.value);
          searchByName();
        }}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        onInputChange={(inputValue) => {
          searchByName(inputValue);
        }}
      />*/}
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
  const [animationDirection, setAnimationDirection] = useState("forward");
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
    setAnimationDirection("backward");
    if (step === "product_number") {
      handleClose();
    } else if (step === "chemical_name") {
      setStep("product_number");
    } else if (step === "manufacturer") {
      setStep("product_number");
    } else if (step === "new_chemical") {
      setStep("chemical_name");
    } else if (step === "bottle_details") {
      setStep("manufacturer");
    }
  };
  const handleNext = () => {
    setAnimationDirection("forward");
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

  const addBottle = () => {
    fetch("/api/add_bottle", {
      method: "POST",
      credentials: "include",
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
      `/api/chemicals/product_number_lookup?product_number=${productNumber}`,
      { credentials: "include" }
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
    fetch(`/api/chemicals/chemical_name_lookup?chemical_name=${chemicalName}`, {
      credentials: "include",
    })
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
      credentials: "include",
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
        <div>
          <i>
            We couldn't find {productNumber}. Try searching for a chemical name
            instead?
          </i>
          <ChemicalNameInput
            chemicalName={chemicalName}
            setChemicalName={setChemicalName}
            onEnter={handleNext}
          />
        </div>
      );
    } else if (step === "manufacturer") {
      return (
        <>
          <i>We found your chemical, but we don't know which manufacturer.</i>
          <ManufacturerSelector
            value={selectedManufacturer}
            onChange={setSelectedManufacturer}
          />
        </>
      );
    } else if (step === "new_chemical") {
      return (
        <>
          <i>We couldn't find that chemical. Create it below</i>
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
        </>
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
              onChange={(e) => setStickerNumber(parseInt(e.target.value, 10))}
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

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Chemical</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          overflow: "hidden", // Crucial for containment
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{
              opacity: 0,
              x: animationDirection === "forward" ? "100%" : "-100%",
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: animationDirection === "forward" ? "-20%" : "20%", // Adjust exit based on direction
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              width: "100%",
              originX: 0,
            }}
            layout="position"
          >
            {renderBody()}
          </motion.div>
        </AnimatePresence>
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  );
};
