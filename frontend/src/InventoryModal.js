import React, { useEffect, useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { LocationSelector } from "./LocationSelector";

export const InventoryModal = ({ show, handleClose: parentHandleClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);
  const [chemicals, setChemicals] = useState([]);
  const [enteredChemicals, setEnteredChemicals] = useState(new Set());
  const [inputValue, setInputValue] = useState("");
  const lastEnterTimeRef = useRef(0);

  // if (!chemical) return null; // Don't render if no chemical is selected
  // Reset all state when the modal closes.
  const resetState = () => {
    setSelectedLocation(null);
    setSelectedSubLocation(null);
    setChemicals([]);
  };

  // Handles closing modals
  const handleClose = () => {
    resetState();
    parentHandleClose();
  };

  // Detect double space
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const currentTime = Date.now();
      const DOUBLE_ENTER_THRESHOLD = 500;
      const sticker_number = parseInt(inputValue.trim());

      if (currentTime - lastEnterTimeRef.current <= DOUBLE_ENTER_THRESHOLD) {
        if (!sticker_number) return;

        console.log("Entered Sticker Number:", sticker_number);
        console.log("Available Chemicals:", chemicals);

        // Check if the entered sticker number exists in the list
        const matchingChemical = chemicals.find(
          (chem) => chem.sticker_number === sticker_number
        );
        console.log("Chemical: " + matchingChemical);
        if (matchingChemical) {
          // Remove from displayed list
          setChemicals((prevChemicals) =>
            prevChemicals.filter(
              (chem) => chem.sticker_number !== sticker_number
            )
          );

          // Add to entered set
          setEnteredChemicals(
            (prevEntered) => new Set([...prevEntered, sticker_number])
          );
        } else {
          console.log("No matching chemical found.");
        }

        // Clear input
        setInputValue("");
      }
      // Update the last time the user pressed Enter.
      lastEnterTimeRef.current = currentTime;
    }
  };

  // Mark remaining chemicals as dead
  const handleCompleteSublocation = () => {
    const unenteredChemicals = chemicals
      .filter((chem) => !enteredChemicals.has(chem["sticker"]))
      .map((chem) => chem["sticker"]);

    fetch("/api/chemicals/mark_dead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory_ids: unenteredChemicals }),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message));
  };

  // Fetch all chemicals in the sub-location
  useEffect(() => {
    // Only load chemical data if a sublocation is given.
    if (!selectedSubLocation) return;
    fetch(
      `/api/chemicals/by_sublocation?sub_location_id=${selectedSubLocation.sub_location_id}`,
      {}
    )
      .then((res) => res.json())
      .then((data) => setChemicals(data));
  }, [selectedSubLocation]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Inventory</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="grouped-section">
          <LocationSelector
            onChange={(loc, subLoc) => {
              setSelectedLocation(loc);
              setSelectedSubLocation(subLoc);
            }}
          />

          <label className="form-label">Sticker Number</label>
          <input
            onKeyDown={handleKeyDown}
            type="number"
            className="form-control"
            placeholder="Enter sticker number then press Enter twice..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <br></br>
        </div>

        <label className="form-label">
          <b>
            Located in <u>{selectedSubLocation?.sub_location_name || "..."}</u>
          </b>
        </label>
        <div className="grouped-section">
          <table className="table mb-2">
            <thead>
              <tr>
                <th scope="col">Sticker #</th>
                <th scope="col">Name</th>
                <th scope="col">Product #</th>
                <th scope="col">Manufacturer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chemicals.map((item, index) => (
                <tr
                  key={index}
                  className={
                    "" + item["dead"] == "true"
                      ? "tw-italic tw-line-through"
                      : ""
                  }
                >
                  <th scope="row">{item.sticker_number}</th>
                  <td>{item.name}</td>
                  <td>{item.product_number}</td>
                  <td>{item.manufacturer}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          onClick={handleCompleteSublocation}
          type="button"
          className="btn btn-secondary"
        >
          Complete Sub Location
        </button>
        <button type="button" className="btn btn-secondary">
          Complete Room
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Finish
        </button>
      </Modal.Footer>
    </Modal>
  );
};
