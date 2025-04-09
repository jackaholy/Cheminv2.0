import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { StatusMessage } from "./StatusMessage";

const ManufacturerModal = ({ show, handleClose }) => {
    const [manufacturers, setManufacturers] = useState([]);
    const [filter, setFilter] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("success");

    const loadManufacturers = async () => {
        try {
            const response = await fetch("/api/manufacturers?active=false");
            const data = await response.json();
            setManufacturers(data.map((man) => ({ ...man, selected: false })));
        } catch (error) {
            console.error("Error fetching manufacturers:", error);
        }
    };

    useEffect(() => {
        if (show) {
            loadManufacturers();
        }
    }, [show]);

    const handleCheckboxChange = (index) => {
        setManufacturers((prevManufacturers) =>
            prevManufacturers.map((manufacturer, i) =>
                i === index
                    ? { ...manufacturer, selected: !manufacturer.selected }
                    : manufacturer
            )
        );
    };

    const handleSuccess = (message) => {
        setStatusMessage(message || "Operation successful");
        setStatusColor("success");
        loadManufacturers();
    };

    const handleError = (message) => {
        setStatusMessage(message || "An error occurred");
        setStatusColor("danger");
    };

    const filteredManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Manufacturers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StatusMessage statusMessage={statusMessage} color={statusColor} />
                    <Form className="d-flex mb-3">
                        <Form.Control
                            type="search"
                            placeholder="Search by manufacturer name"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <Button variant="outline-success" type="submit">Search</Button>
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Manufacturer Name</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredManufacturers.map((manufacturer, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={manufacturer.selected}
                                            onChange={() => handleCheckboxChange(index)}
                                        />
                                    </td>
                                    <td>{manufacturer.name}</td>
                                    <td>
                                        <Button
                                            variant="outline-success"
                                            onClick={() => {
                                                setSelectedManufacturer(manufacturer);
                                                setShowEdit(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowAdd(true)}>Add Manufacturer</Button>
                    <Button variant="secondary" onClick={() => setShowDelete(true)}>Remove Manufacturer</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <AddManufacturerModal 
                show={showAdd} 
                handleClose={() => setShowAdd(false)} 
                onSuccess={handleSuccess}
                onError={handleError}
                onUpdate={loadManufacturers} // Pass onUpdate
            />
            <EditManufacturerModal
                show={showEdit}
                handleClose={() => setShowEdit(false)}
                manufacturer={selectedManufacturer}
                onSuccess={handleSuccess}
                onError={handleError}
                onUpdate={loadManufacturers} // Pass onUpdate
            />
            <DeleteManufacturerModal
                show={showDelete}
                handleClose={() => setShowDelete(false)}
                selectedManufacturers={filteredManufacturers.filter((manufacturer) => manufacturer.selected)}
                onSuccess={handleSuccess}
                onError={handleError}
                onUpdate={loadManufacturers} // Pass onUpdate
            />
        </>
    );
};

const AddManufacturerModal = ({ show, handleClose, onSuccess, onError, onUpdate }) => {
    const [manufacturerName, setManufacturerName] = useState("");

    const handleSave = async () => {
        if (!manufacturerName) {
            onError("Please provide a manufacturer name.");
            return;
        }

        try {
            const response = await fetch("/api/add_manufacturer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: manufacturerName }),
            });

            if (response.ok) {
                handleClose();
                onSuccess("Manufacturer added successfully");
                onUpdate(); // Refresh data
            } else {
                onError("Failed to add manufacturer");
            }
        } catch (error) {
            console.error("Error adding manufacturer:", error);
            onError("Error adding manufacturer");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Manufacturer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Manufacturer Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name..."
                        value={manufacturerName}
                        onChange={(e) => setManufacturerName(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditManufacturerModal = ({ show, handleClose, manufacturer, onSuccess, onError, onUpdate }) => {
    const [manufacturerName, setManufacturerName] = useState(manufacturer ? manufacturer.name : "");

    useEffect(() => {
        if (manufacturer) {
            setManufacturerName(manufacturer.name);
        }
    }, [manufacturer]);

    const handleSave = async () => {
        if (!manufacturerName) {
            onError("Please provide a manufacturer name.");
            return;
        }

        try {
            const response = await fetch(`/api/manufacturers/${manufacturer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: manufacturerName }),
            });

            if (response.ok) {
                handleClose();
                onSuccess("Manufacturer updated successfully");
                onUpdate(); // Refresh data
            } else {
                onError("Failed to update manufacturer");
            }
        } catch (error) {
            console.error("Error updating manufacturer:", error);
            onError("Error updating manufacturer");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Manufacturer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Manufacturer Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name..."
                        value={manufacturerName}
                        onChange={(e) => setManufacturerName(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const DeleteManufacturerModal = ({ show, handleClose, selectedManufacturers, onSuccess, onError, onUpdate }) => {
    const handleDelete = async () => {
        try {
            const response = await fetch("/api/delete_manufacturers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedManufacturers.map((man) => man.id) }),
            });

            if (response.ok) {
                handleClose();
                onSuccess("Manufacturers deleted successfully");
                onUpdate(); // Refresh data
            } else {
                onError("Failed to delete manufacturers");
            }
        } catch (error) {
            console.error("Error deleting manufacturers:", error);
            onError("Error deleting manufacturers");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the following manufacturers?
                <ul>
                    {selectedManufacturers.map((manufacturer) => (
                        <li key={manufacturer.id}>{manufacturer.name}</li>
                    ))}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleDelete}>Yes</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ManufacturerModal;
