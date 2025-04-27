import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ManufacturerSelector } from "./ManufacturerSelector";
import { LocationSelector } from "./LocationSelector";

export const InventoryEditModal = ({
  inventory,
  show,
  handleClose,
  onUpdate,
}) => {
  const [stickerNumber, setStickerNumber] = useState(inventory?.sticker || "");
  const [productNumber, setProductNumber] = useState(
    inventory?.product_number || ""
  );
  const [subLocation, setSubLocation] = useState(
    inventory?.sub_location || null
  );
  const [manufacturer, setManufacturer] = useState(
    inventory?.manufacturer
      ? { id: inventory.manufacturer_id, name: inventory.manufacturer }
      : null
  );
  const [manufacturerId, setManufacturerId] = useState(
    inventory?.manufacturer_id || null
  );
  const [msds, setMsds] = useState(inventory?.msds || false);
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/update_inventory/${inventory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sticker_number: stickerNumber,
          product_number: productNumber,
          sub_location_id: subLocation.sub_location_id,
          manufacturer_id: manufacturerId,
          msds: msds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory");
      }

      if (onUpdate) onUpdate();
      handleClose();
    } catch (error) {
      console.error("Error updating inventory:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="xl">
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
              onChange={(_, subLoc) => {
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
          <div className="mb-3">
            <input
              type="checkbox"
              className="form-check-input me-1"
              checked={msds}
              onChange={(e) => setMsds(e.target.checked)}
              id="msds_check"
        
            />
            <label className="form-check-label" for="msds_check">
              Safety data sheet added
            </label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};
