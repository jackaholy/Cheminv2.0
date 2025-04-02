import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {LocationSelector} from "./LocationSelector";

export const InventoryModal = ({ show, handleClose: parentHandleClose }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedSubLocation, setSelectedSubLocation] = useState(null);
    const [chemicals, setChemicals] = useState([]);
    const [enteredChemicals, setEnteredChemicals] = useState(new Set());
    const [inputValue, setInputValue] = useState("");

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
        if (e.key === " " && inputValue.endsWith(" ")) {
            const stickerNumber = inputValue.trim();
            if (!stickerNumber) return;

            // Check if the entered sticker number exists in the list
            const matchingChemical = chemicals.find(chem => chem["sticker-number"] === stickerNumber);

            if (matchingChemical) {
                // Remove from displayed list
                setChemicals(chemicals.filter(chem => chem["sticker-number"] !== stickerNumber));

                // Add to entered set
                setEnteredChemicals(new Set([...enteredChemicals, stickerNumber]));
            }

            // Clear input
            setInputValue("");
        }
    };

    // Mark remaining chemicals as dead
    const handleCompleteSublocation = () => {
        const unenteredChemicals = chemicals
            .filter(chem => !enteredChemicals.has(chem["sticker-number"]))
            .map(chem => chem["sticker-number"]);

        fetch("/api/chemicals/mark_dead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inventory_ids: unenteredChemicals }),
        }).then((res) => res.json())
          .then((data) => alert(data.message));
    };

    // Fetch all chemicals in the sub-location when the component loads
    useEffect(() => {
        if (!selectedSubLocation)
            return
        fetch(`/api/chemicals/by_sublocation?sub_location_id=${selectedSubLocation.sub_location_id}`, {})
            .then((res) => res.json())
            .then((data) => setChemicals(data));
    }, [selectedSubLocation]);

    console.log(selectedSubLocation);
    console.log(chemicals)
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
          <input onKeyDown={handleKeyDown} type="text" className="form-control" placeholder="Enter sticker number..." />
            <br></br>
            <div>
        </div>


        </div>

        <label className="form-label">
            <b>Located in <u>{selectedSubLocation?.sub_location_name || "..."}</u></b>
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
                      "" + item["dead"] == "true" ? "tw-italic tw-line-through" : ""
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
        <button onClick={handleCompleteSublocation} type="button" className="btn btn-secondary">
          Complete Sub Location
        </button>
        <button type="button" className="btn btn-secondary">
          Complete Room
        </button>
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Finish
        </button>
      </Modal.Footer>
    </Modal>
  );
};
