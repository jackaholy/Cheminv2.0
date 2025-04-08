import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ManufacturerSelector } from "./ManufacturerSelector";
import { LocationSelector } from "./LocationSelector";

export const InventoryEditModal = ({ inventory, show, handleClose }) => {
  const [stickerNumber, setStickerNumber] = useState(inventory?.sticker || "");
  const [productNumber, setProductNumber] = useState(inventory?.product_number || "");
  const [location, setLocation] = useState(inventory?.location || null);
  const [subLocation, setSubLocation] = useState(inventory?.sub_location || null);
  const [manufacturer, setManufacturer] = useState(
    inventory?.manufacturer ? { id: inventory.manufacturer_id, name: inventory.manufacturer } : null
  );
  const [manufacturerId, setManufacturerId] = useState(inventory?.manufacturer_id || null);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/update_inventory/${inventory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sticker_number: stickerNumber,
          product_number: productNumber,
          sub_location_id: subLocation.sub_location_id,
          manufacturer_id: manufacturerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      handleClose();
      // You might want to add a callback here to refresh the parent component
      // if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating inventory:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Inventory</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="mb-3">
            <label htmlFor="stickerNumber" className="form-label">
              Sticker Number
            </label>
            <input
              type="text"
              className="form-control"
              id="stickerNumber"
              value={stickerNumber}
              onChange={(e) => setStickerNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productNumber" className="form-label">
              Product Number
            </label>
            <input
              type="text"
              className="form-control"
              id="productNumber"
              value={productNumber}
              onChange={(e) => setProductNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <LocationSelector
              onChange={(loc, subLoc) => {
                setLocation(loc);
                setSubLocation(subLoc);
              }}
              sublocationSelection={true}
            />
          </div>
          <div className="mb-3">
            <ManufacturerSelector
              value={manufacturer}
              onChange={(selectedManufacturer) => {
                setManufacturer(selectedManufacturer);
                setManufacturerId(selectedManufacturer?.id || null);
              }}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};
