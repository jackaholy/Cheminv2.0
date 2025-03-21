import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
export const ChemicalModal = ({ chemical, show, handleClose }) => {
  const handleModalClose = () => {
    setChemicalDescription("");
    setChemicalImage("");
    handleClose();
  };
  const [chemicalDescription, setChemicalDescription] = useState("");
  useEffect(() => {
    if (!chemical) return;
    fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${chemical?.chemical_name}/description/json`
    )
      .then((response) => response.json())
      .then((data) => {
        // Easy hueristic for "best" description
        let longestDescription = "";
        for (const information of data["InformationList"]["Information"]) {
          if (
            "Description" in information &&
            information["Description"].length > longestDescription.length
          ) {
            longestDescription = information["Description"];
          }
        }
        setChemicalDescription(longestDescription);
      })
      .catch((error) => console.error(error));
  }, [chemical]);
  const [chemicalImage, setChemicalImage] = useState("");
  useEffect(() => {
    if (!chemical) return;
    fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${chemical?.chemical_name}/PNG`
    )
      .then((response) => response.blob())
      .then((blob) => {
        console.log(blob);
        setChemicalImage(URL.createObjectURL(blob));
      })
      .catch((error) => console.error(error));
  }, [chemical]);

  if (!chemical) return null; // Don't render if no chemical is selected
  console.log(chemicalImage);
  return (
    <Modal show={show} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{chemical.chemical_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            {chemicalImage && (
              <div className="col-md-4">
                <img
                  src={chemicalImage}
                  alt={chemical.chemical_name}
                  className="tw-max-w-full tw-h-auto"
                  onError={(event) => setChemicalImage(null)}
                />
              </div>
            )}
            <div className="col-md-8">
              <p>
                <b>Storage Class:</b> {chemical.storage_class}
              </p>
              <p>
                {chemicalDescription && <b>Description: </b>}
                {chemicalDescription}
              </p>
            </div>
          </div>
        </div>
        <table className="table mb-2">
          <thead>
            <tr>
              <th scope="col">Sticker #</th>
              <th scope="col">Product #</th>
              <th scope="col">Location</th>
              <th scope="col">Sub-Location</th>
              <th scope="col">Manufacturer</th>
            </tr>
          </thead>
          <tbody>
            {chemical.inventory?.map((item, index) => (
              <tr key={index}>
                <th scope="row">{item.sticker}</th>
                <td>{item.product_number}</td>
                <td>{item.location}</td>
                <td>{item.sub_location}</td>
                <td>{item.manufacturer}</td>
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
