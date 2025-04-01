import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
export const ChemicalModal = ({ chemical, show, handleClose }) => {
  const handleModalClose = () => {
    setChemicalDescription("");
    setChemicalImage("");
    handleClose();
  };
  const [chemicalDescription, setChemicalDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    if (!chemical) return;
    fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${chemical?.chemical_name}/description/json`
    )
      .then((response) => response.json())
      .then((data) => {
        // Easy heuristic for "best" description
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
        setChemicalImage(URL.createObjectURL(blob));
      })
      .catch((error) => console.error(error));
  }, [chemical]);

  if (!chemical) return null; // Don't render if no chemical is selected
  async function markDead(item) {
    console.log("Marking chemical as dead:", item.id);
    try {
      const response = await fetch("/api/chemicals/mark_dead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventory_id: item.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setStatusMessage(
        `Marked bottle #${item.sticker} (${item.location}, ${item.sub_location}) as dead. Refresh to see changes.`
      );
      return data;
    } catch (error) {
      console.error("Error marking chemical as dead:", error);
    }
  }
  return (
    <Modal show={show} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{chemical.chemical_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row ">
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
                <b>Chemical Formula:</b> {chemical.formula}
              </p>
              <p>
                {chemicalDescription && <b>Description: </b>}
                {chemicalDescription}
              </p>
            </div>
          </div>
        </div>
        {statusMessage && (
          <Alert variant="success" className="my-3">
            {statusMessage}
          </Alert>
        )}
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
          <tbody>
            {chemical.inventory?.map((item, index) => (
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
                  {item.dead ? null : (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="button-tooltip-2">Mark as dead</Tooltip>
                      }
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Mark as dead"
                        onClick={() => {
                          console.log(item);
                          markDead(item);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash3"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </OverlayTrigger>
                  )}
                </td>
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
