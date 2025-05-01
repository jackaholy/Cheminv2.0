import {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {StatusMessage} from "./StatusMessage";
import {Alert} from "react-bootstrap";

export const MissingMSDSModal = ({show, handleClose}) => {
    const [missingChemicals, setMissingChemicals] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("success");
    const [addedChemical, setAddedChemical] = useState(null);
    useEffect(() => {
        getMissingMSDS();
    }, [show]);

    function getMissingMSDS() {
        fetch("/api/get_missing_msds")
            .then((response) => response.json())
            .then((data) => setMissingChemicals(data))
            .catch((error) => console.error(error));
    }

    function addMSDS(chemical) {
        fetch("/api/add_msds", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({inventory_id: chemical.inventory_id}),
        })
            .then((response) => response.json())
            .then((data) => {
                setAddedChemical(chemical);
                setStatusMessage(
                    `Marked ${chemical.chemical_name} from ${chemical.manufacturer_name} as having an MSDS.`
                );
                setStatusColor("success");
                getMissingMSDS();
            })
            .catch((error) => console.error(error));
    }

    function clearMsds(chemical) {
        fetch("/api/clear_msds", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({inventory_id: chemical.inventory_id}),
        })
            .then((response) => response.json())
            .then((data) => {
                setStatusColor("warning");
                setStatusMessage(
                    `Marked ${chemical.chemical_name} from ${chemical.manufacturer_name} as not having an MSDS.`
                );
                getMissingMSDS();
            })
            .catch((error) => console.error(error));
    }

    return (
        <Modal show={show} onHide={handleClose} centered size="xl" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Missing Safety Datasheet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <StatusMessage statusMessage={statusMessage} color={statusColor}>
                    {addedChemical ? (
                        <Alert.Link
                            href="#"
                            onClick={() => {
                                clearMsds(addedChemical);
                                setAddedChemical(null);
                            }}
                        >
                            Undo
                        </Alert.Link>
                    ) : null}
                </StatusMessage>
                <table className="table mb-2">
                    <thead>
                    <tr>
                        <th scope="col">Sticker Number</th>
                        <th scope="col">Chemical</th>
                        <th scope="col">Manufacturer</th>
                        <th scope="col">Product Number</th>
                        <th scope="col">Done</th>
                    </tr>
                    </thead>
                    <tbody>
                    {missingChemicals.map((chemical, index) => (
                        <tr>
                            <td>{chemical.sticker_number}</td>
                            <td>{chemical.chemical_name}</td>
                            <td>{chemical.manufacturer_name}</td>
                            <td>{chemical.product_number}</td>
                            <td>
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        addMSDS(chemical);
                                    }}
                                >
                                    Done
                                </button>
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
