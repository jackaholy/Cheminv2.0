import React from "react";
import Modal from "react-bootstrap/Modal";
export const InventoryModal = ({}) => {
  return (
    <Modal show={show} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Inventory</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div class="grouped-section">
          <label class="form-label">Location</label>
          <select class="form-select">
            <option selected>Pick a Location</option>
            <option value="FC 111">FC 111</option>
            <option value="FC 114">FC 114</option>
            <option value="FC 115">FC 115</option>
          </select>

          <label class="form-label">Sub Location</label>
          <select class="form-select">
            <option selected>Pick a Location</option>
            <option value="FC 111">Acid Cabinet</option>
            <option value="FC 114">Corr White</option>
            <option value="FC 115">Flam Red</option>
          </select>

          <label class="form-label">Sticker Number</label>
          <input type="text" class="form-control" placeholder="Type here..." />

          <button type="button" class="btn btn-secondary">
            Search
          </button>
          <button type="button" class="btn btn-secondary">
            Reset
          </button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" class="btn btn-secondary">
          Complete Sub Location
        </button>
        <button type="button" class="btn btn-secondary">
          Complete Room
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Finish
        </button>
      </Modal.Footer>
    </Modal>
  );
};
