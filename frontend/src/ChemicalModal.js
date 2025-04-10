import React, {useState, useEffect} from "react";
import Modal from "react-bootstrap/Modal";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {StatusMessage} from "./StatusMessage";
import {Accordion} from "react-bootstrap";
import { InventoryEditModal } from "./InventoryEditModal"; // Import the InventoryEditModal

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
  const [chemicalImage, setChemicalImage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("success");
  const [user, setUser] = useState({});

  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const handleEditClick = (inventory) => {
    setSelectedInventory(inventory);
    setEditModalShow(true);
  };

  const handleEditModalClose = () => {
    setEditModalShow(false);
    setSelectedInventory(null);
  };

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
        // Easy heuristic for "best" description
        let longestDescription = "";
        for (const info of data["InformationList"]["Information"]) {
          if ("Description" in info && info["Description"].length > longestDescription.length) {
            longestDescription = info["Description"];
          }
        }
        setChemicalDescription(longestDescription);
      })
      .catch((error) => console.error(error));
  }, [chemical]);

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
      console.error("Error marking chemical as alive:", error);
      setStatusMessage("Error marking chemical as alive");
      setStatusColor("danger");
    }
  }

  const aliveInventory = chemical.inventory?.filter((item) => !item.dead);
  const deadInventory = chemical.inventory?.filter((item) => item.dead);

  return (
    <>
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
                  onError={() => setChemicalImage(null)}
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

          <StatusMessage statusMessage={statusMessage} color={statusColor} />

          <table className="table mb-2">
            <thead>
              <tr>
              <th>Sticker #</th>
              <th>Product #</th>
              <th>Location</th>
              <th>Sub-Location</th>
              <th>Manufacturer</th>
              {["Editor", "Full Access"].includes(user.access) && <th>Edit</th>}
              </tr>
            </thead>
            <tbody>
            {aliveInventory?.map((item, index) => (
              <tr key={index}>
                  <th scope="row">{item.sticker}</th>
                  <td>{item.product_number}</td>
                  <td>{item.location}</td>
                  <td>{item.sub_location}</td>
                  <td>{item.manufacturer}</td>
                {["Editor", "Full Access"].includes(user.access) && (
                    <td>
                     <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id="button-tooltip-edit">Edit</Tooltip>}
                      >
                        <button
                          className="btn btn-secondary btn-sm me-1"
                          title="Edit"
                          onClick={() => handleEditClick(item)}
                        ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                      </svg>
                        </button>
                      </OverlayTrigger>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip id="mark-dead">Mark as dead</Tooltip>}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Mark as dead"
                        onClick={() => markDead(item)}
                      >
                        <i className="bi bi-clipboard-x"></i>
                      </button>
                    </OverlayTrigger>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {deadInventory.length > 0 && (
          <div className="px-0">
            <Accordion flush className="w-100">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  Show Dead Bottles ({deadInventory.length})
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  <table className="table mb-0">
                    <tbody>
                      {deadInventory.map((item, index) => (
                        <tr key={index} className="tw-italic tw-line-through">
                          <th scope="row">{item.sticker}</th>
                          <td>{item.product_number}</td>
                          <td>{item.location}</td>
                          <td>{item.sub_location}</td>
                          <td>{item.manufacturer}</td>
                          {["Editor", "Full Access"].includes(user.access) && (
                            <td>
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="mark-alive">Mark as alive</Tooltip>}
                              >
                                <button
                                  className="btn btn-secondary btn-sm"
                                  title="Mark as alive"
                                  onClick={() => markAlive(item)}
                                >
                                  <i className="bi bi-clipboard-check"></i>
                                </button>
                              </OverlayTrigger>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        )}
        </Modal.Body>
        <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
      {selectedInventory && (
        <InventoryEditModal
          inventory={selectedInventory}
          show={editModalShow}
          handleClose={handleEditModalClose}
          onUpdate={refreshChemicals}
        />
      )}
    </>
  );
};
