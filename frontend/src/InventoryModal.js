import React, { useEffect, useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { LocationSelector } from "./LocationSelector";

export const InventoryModal = ({ show, handleClose: parentHandleClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);
  const [chemicals, setChemicals] = useState([]);
  const [enteredChemicals, setEnteredChemicals] = useState(new Set());
  const [removedChemicals, setRemovedChemicals] = useState(new Set());
  const [inputValue, setInputValue] = useState("");
  const lastEnterTimeRef = useRef(0);

  // Reset all state when the modal closes.
  const resetState = () => {
    setSelectedLocation(null);
    setSelectedSubLocation(null);
    setChemicals([]);
    setInputValue("");
    setEnteredChemicals(new Set());
    setRemovedChemicals(new Set());
  };

  // Handles closing modals
  const handleClose = () => {
    resetState();
    parentHandleClose();
  };

  // Detect double space
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const sticker_number = parseInt(inputValue.trim());

      if (!sticker_number) return;
      console.log("Entered Sticker Number:", sticker_number);
      const matchingChemical = chemicals.find(
          (chem) => chem.sticker_number === sticker_number
      );
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
        // If not found, check if the chemical exists elsewhere and offer to update location
        try {
          const locationResponse = await fetch(`/api/chemicals/sticker_lookup?sticker_number=${sticker_number}`);
          if (!locationResponse.ok) throw new Error("Unable to fetch sticker location");
          const location_data = await locationResponse.json();

          if (
              location_data.location_id !== selectedLocation?.location_id ||
              location_data.sub_location_id !== selectedSubLocation?.sub_location_id
          ) {
            const confirmMove = window.confirm(
                `This chemical was last found at:  "${location_data.location_name} - ${location_data.sub_location_name}".\nDo you want to move it to the current location?`
            );
            if (confirmMove) {
              await fetch(`api/chemicals/update_chemical_location`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                  inventory_id: location_data.inventory_id,
                  new_sub_location_id: selectedSubLocation?.sub_location_id,
                }),
              });
              alert("Location updated successfully.");
              // Reload list
              fetch(`/api/chemicals/by_sublocation?sub_location_id=${selectedSubLocation.sub_location_id}`)
                  .then((res) => res.json())
                  .then((data) => setChemicals(data));
            }
          }
        } catch (err) {
          console.error("Error checking or moving chemical:", err);
        }
      }
      setInputValue("");
      console.log("Available Chemicals:", chemicals);
    }
  };

  // Mark remaining chemicals as dead
  const handleCompleteSublocation = () => {
    const unenteredChemicals = chemicals
      .filter((chem) => !enteredChemicals.has(chem.sticker_number))
      .map((chem) => chem.sticker_number);

    if (unenteredChemicals.length === 0) {
      alert("No chemicals left to be marked dead.")
      return;
    }

    fetch("/api/chemicals/mark_many_dead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sticker_numbers: unenteredChemicals , sub_location_id: selectedSubLocation.sub_location_id}),
    })
      .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
      })
      .then((data) => alert(data.message))
      .catch((error) => console.error("Error marking chemicals as dead:", error));
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

  // console.log("Inventoried Chemicals:", removedChemicals);
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
            // Prevent scrolling in the "Type sticker number" text box
            onWheel={(e) => e.target.blur()}
            type="number"
            className="form-control"
            placeholder="Type in sticker number then press Enter to record chemical being found..."
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
                <th scope="col">Who Updated</th>
                <th scope="col">Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chemicals.filter((chem) => !removedChemicals.has(chem.sticker_number)) // Exclude removed ones
                .map((item, index) => (
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
                  <td>{item.who_updated}</td>
                  <td>{item.last_updated}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="me-auto">
          <button
            onClick={() => {
              if (selectedSubLocation) {
                fetch(`/api/chemicals/by_sublocation?sub_location_id=${selectedSubLocation.sub_location_id}`)
                  .then((res) => res.json())
                  .then((data) => {
                    setChemicals(data);
                    setRemovedChemicals(new Set());
                    setEnteredChemicals(new Set());
                    setInputValue("");
                  });
              }
            }}
            type="button"
            className="btn btn-secondary"
          >
            Reset
          </button>
        </div>
        <button
          onClick={handleCompleteSublocation}
          type="button"
          className="btn btn-secondary"
        >
          Complete Sub Location
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
