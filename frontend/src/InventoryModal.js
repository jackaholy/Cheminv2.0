import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {LocationSelector} from "./LocationSelector";

export const InventoryModal = ({ show, handleClose: parentHandleClose }) => {
    const [rooms, setRooms] = useState([]);
    const [setSelectedLocation] = useState(null);
    const [setSelectedSubLocation] = useState(null);

    // Reset all state when the modal closes.
    const resetState = () => {
        setSelectedLocation(null);
        setSelectedSubLocation(null);
    };

    const handleClose = () => {
        resetState();
        parentHandleClose();
    };

  useEffect(() => {
    fetch("/api/locations", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((error) => console.error(error));
  }, []);

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
          <input type="text" className="form-control" placeholder="Type here..." />

          <button type="button" className="btn btn-secondary">
            Search
          </button>
          <button type="button" className="btn btn-secondary">
            Reset
          </button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary">
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
