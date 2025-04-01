import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
export const MissingMSDSModal = ({ show, handleClose }) => {
  const [missingChemicals, setMissingChemicals] = useState([]);
  useEffect(() => {
    fetch("/api/get_missing_msds")
      .then((response) => response.json())
      .then((data) => setMissingChemicals(data))
      .catch((error) => console.error(error));
  }, []);
  console.log(missingChemicals);
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Missing Safety Datasheet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table className="table mb-2">
          <thead>
            <tr>
              <th scope="col">Sticker Number</th>
              <th scope="col">Chemical</th>
              <th scope="col">Manufacturer</th>
              <th scope="col">Product Number</th>
            </tr>
          </thead>
          <tbody>
            {missingChemicals.map((chemical, index) => (
              <tr>
                <td>{chemical.sticker_number}</td>
                <td>{chemical.chemical_name}</td>
                <td>{chemical.manufacturer_name}</td>
                <td>{chemical.product_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
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
