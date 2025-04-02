import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {LocationSelector} from "./LocationSelector";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export const InventoryModal = ({ chemical, show, handleClose: parentHandleClose }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedSubLocation, setSelectedSubLocation] = useState(null);
    const [chemicals, setChemicals] = useState([]);

    // if (!chemical) return null; // Don't render if no chemical is selected
    // Reset all state when the modal closes.
    const resetState = () => {
        setSelectedLocation(null);
        setSelectedSubLocation(null);
        setChemicals([]);
    };

    const handleClose = () => {
        resetState();
        parentHandleClose();
    };

    useEffect(() => {
    if (selectedSubLocation) {
        fetch(`/api/chemicals/by_sublocation?sub_location_id=${selectedSubLocation}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setChemicals(data);
                } else {
                    setChemicals([]);
                }
            })
            .catch(error => {
                console.error("Error fetching chemicals:", error);
                setChemicals([]);
            });
    } else {
        setChemicals([]);
    }
}, [selectedSubLocation]); // Fetch chemicals when selectedSubLocation changes


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
            <br></br>


        </div>
      </Modal.Body>
        <p>Last Found in this SubLocation</p>
        <div className="grouped-section">
                <table className="table mb-2">
                  <thead>
                    <tr>
                      <th scope="col">Sticker #</th>
                      <th scope="col">Product #</th>
                      <th scope="col">Location</th>
                      <th scope="col">Sub-Location</th>
                      <th scope="col">Manufacturer</th>
                      <th></th>
                    </tr>
                  </thead>
                </table>
            </div>
        <tbody>
            {chemical?.inventory?.map((item, index) => (
              <tr
                key={index}
                className={
                  "" + item["dead"] == "true" ? "tw-italic tw-line-through" : ""
                }
              >
                <th scope="row">{item.sticker}</th>
                <td>{item.product_number}</td>
                <td>{item.location}</td>
                <td>{item.sub_location}</td>
                <td>{item.manufacturer}</td>
                <td>
                </td>
              </tr>
            ))}
          </tbody>
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
