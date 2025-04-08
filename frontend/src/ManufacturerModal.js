import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const ManufacturerModal = ({ show, handleClose }) => {
    const [manufacturers, setManufacturers] = useState([]);
    const [filter, setFilter] = useState(""); // State for the filter input
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null); // State for selected manufacturer

    // Fetch manufacturers from the API
    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const response = await fetch("/api/manufacturers?active=false");
                const data = await response.json();
                setManufacturers(data.map((man) => ({ ...man, selected: false })));
            } catch (error) {
                console.error("Error fetching manufacturers:", error);
            }
        };

        if (show) {
            fetchManufacturers();
        }
    }, [show]);

    // Handle checkbox selection
    const handleCheckboxChange = (index) => {
        setManufacturers((prevManufacturers) =>
            prevManufacturers.map((manufacturer, i) =>
                i === index
                    ? { ...manufacturer, selected: !manufacturer.selected }
                    : manufacturer
            )
        );
    };

    // Filtered manufacturers based on the filter input
    const filteredManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <>
            {/* Manufacturer Modal */}
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Manufacturers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="d-flex mb-3">
                        <Form.Control
                            type="search"
                            placeholder="Search by manufacturer name"
                            value={filter} // Bind input to state
                            onChange={(e) => setFilter(e.target.value)} // Update state on change
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

            <AddManufacturerModal show={showAdd} handleClose={() => setShowAdd(false)} />
            <EditManufacturerModal
                show={showEdit}
                handleClose={() => setShowEdit(false)}
                manufacturer={selectedManufacturer}
            />
            <DeleteManufacturerModal
                show={showDelete}
                handleClose={() => setShowDelete(false)}
                selectedManufacturers={filteredManufacturers.filter((manufacturer) => manufacturer.selected)} // Inline filter
            />
        </>
    );
};

const AddManufacturerModal = ({ show, handleClose }) => {
    const [manufacturerName, setManufacturerName] = useState(""); // State for manufacturer name

    const handleSave = async () => {
        if (!manufacturerName) {
            alert("Please provide a manufacturer name.");
            return;
        }

        try {
            const response = await fetch("/api/add_manufacturer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: manufacturerName }),
            });

            if (response.ok) {
                alert("Manufacturer added successfully");
                handleClose();
            } else {
                console.error("Failed to add manufacturer");
            }
        } catch (error) {
            console.error("Error adding manufacturer:", error);
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
                        value={manufacturerName} // Bind input to state
                        onChange={(e) => setManufacturerName(e.target.value)} // Update state on change
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

const EditManufacturerModal = ({ show, handleClose, manufacturer }) => {
    const [manufacturerName, setManufacturerName] = useState(manufacturer ? manufacturer.name : "");

    useEffect(() => {
        if (manufacturer) {
            setManufacturerName(manufacturer.name);
        }
    }, [manufacturer]);

    const handleSave = async () => {
        if (!manufacturerName) {
            alert("Please provide a manufacturer name.");
            return;
        }

        try {
            const response = await fetch(`/api/manufacturers/${manufacturer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: manufacturerName }),
            });

            if (response.ok) {
                alert("Manufacturer updated successfully");
                handleClose();
            } else {
                console.error("Failed to update manufacturer");
            }
        } catch (error) {
            console.error("Error updating manufacturer:", error);
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
                        value={manufacturerName} // Bind input to state
                        onChange={(e) => setManufacturerName(e.target.value)} // Update state on change
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

const DeleteManufacturerModal = ({ show, handleClose, selectedManufacturers }) => {
    const handleDelete = async () => {
        try {
            const response = await fetch("/api/delete_manufacturers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedManufacturers.map((man) => man.id) }),
            });

            if (response.ok) {
                alert("Manufacturers deleted successfully");
                handleClose();
            } else {
                console.error("Failed to delete manufacturers");
            }
        } catch (error) {
            console.error("Error deleting manufacturers:", error);
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
