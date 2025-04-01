import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
export const ChemicalModal = ({
  chemical,
  show,
  handleClose,
  refreshChemicals,
}) => {
  const handleModalClose = () => {
    setChemicalDescription("");
    setChemicalImage("");
    handleClose();
  };
  const [chemicalDescription, setChemicalDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("success");

  const [user, setUser] = useState({});

  useEffect(() => {
    fetch("/api/user", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error(error));
  }, []);
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
      refreshChemicals();
      setStatusMessage(
        `Marked bottle #${item.sticker} (${item.location}, ${item.sub_location}) as dead`
      );
      setStatusColor("warning");
      return data;
    } catch (error) {
      console.error("Error marking chemical as dead:", error);
      setStatusMessage("Error marking chemical as dead");
      setStatusColor("danger");
    }
  }
  async function markAlive(item) {
    console.log("Marking chemical as dead:", item.id);
    try {
      const response = await fetch("/api/chemicals/mark_alive", {
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
      refreshChemicals();
      setStatusMessage(
        `Marked bottle #${item.sticker} (${item.location}, ${item.sub_location}) as alive`
      );
      setStatusColor("success");
      return data;
    } catch (error) {
      console.error("Error marking chemical as dead:", error);
      setStatusMessage("Error marking chemical as dead");
      setStatusColor("danger");
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
          <Alert variant={statusColor} className="my-3">
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
              {user.access == "Editor" || user.access == "Full Access" ? (
                <th scope="col"></th>
              ) : null}
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
                {user.access == "Editor" || user.access == "Full Access" ? (
                  <td>
                    {item.dead ? (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id="button-tooltip-2">Mark as alive</Tooltip>
                        }
                      >
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Mark as alive"
                          onClick={() => {
                            console.log(item);
                            markAlive(item);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-clipboard-check-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                          </svg>
                        </button>
                      </OverlayTrigger>
                    ) : (
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
                            class="bi bi-clipboard-x-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm4 7.793 1.146-1.147a.5.5 0 1 1 .708.708L8.707 10l1.147 1.146a.5.5 0 0 1-.708.708L8 10.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 10 6.146 8.854a.5.5 0 1 1 .708-.708z" />
                          </svg>
                        </button>
                      </OverlayTrigger>
                    )}
                  </td>
                ) : null}
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
