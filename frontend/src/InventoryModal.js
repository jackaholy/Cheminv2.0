import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
export const InventoryModal = ({ show, handleClose }) => {
    const [rooms, setRooms] = useState([]);

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
          <label className="form-label">Location</label>
          <select className="form-select">

            <option selected>Pick a Location</option>
                {rooms.map((room) => (
              <option key={room.Location_ID} value={room.Location_ID}>
                {room.building} {room.room}
              </option>
            ))}
          </select>

          <label className="form-label">Sub Location</label>
          <select className="form-select">
            <option selected>Pick a Location</option>
            <option value="FC 111">Acid Cabinet</option>
            <option value="FC 114">Corr White</option>
            <option value="FC 115">Flam Red</option>
          </select>

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
