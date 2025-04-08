import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const SubLocationModal = ({ show, handleClose }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [filter, setFilter] = useState(""); // State for the filter input
    const [sublocations, setSubLocations] = useState([]); // State for fetched sublocations

    // Fetch sublocations from the backend
    useEffect(() => {
        if (show) {
            fetch("/api/sublocations")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setSubLocations(data);
                })
                .catch((error) => {
                    console.error("Error fetching sublocations:", error);
                });
        }
    }, [show]);

    // Handle checkbox selection
    const handleCheckboxChange = (id) => {
        setSubLocations((prevSubLocations) =>
            prevSubLocations.map((sublocation) =>
                sublocation.id === id
                    ? { ...sublocation, selected: !sublocation.selected }
                    : sublocation
            )
        );
    };

    // Filtered sublocations based on the filter input
    const filteredSubLocations = sublocations.filter((sublocation) =>
        sublocation.name.toLowerCase().includes(filter.toLowerCase()) ||
        `${sublocation.room} ${sublocation.building}`.toLowerCase().includes(filter.toLowerCase())
    );

    // Delete modal filtered sublocations
    const selectedForDeletion = filteredSubLocations.filter(
        (sublocation) => sublocation.selected
    );

    return (
        <>
            {/* Sub Location Modal */}
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Sub Locations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="d-flex mb-3">
                        <Form.Control
                            type="search"
                            placeholder="Filter by sublocation or location"
                            className="me-2"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Sublocation</th>
                                <th>Location</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubLocations.map((sublocation) => (
                                <tr key={sublocation.id}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            id={sublocation.id.toString()}
                                            checked={sublocation.selected}
                                            onChange={() => handleCheckboxChange(sublocation.id)}
                                        />
                                    </td>
                                    <td>{sublocation.name}</td>
                                    <td>{sublocation.room} {sublocation.building}</td>
                                    <td>
                                        <Button variant="outline-success" onClick={() => setShowEdit(true)}>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowAdd(true)}>Add Sub Location</Button>
                    <Button variant="secondary" onClick={() => setShowDelete(true)}>Remove Sub Location</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <AddSubLocationModal show={showAdd} handleClose={() => setShowAdd(false)} />
            <EditSubLocationModal show={showEdit} handleClose={() => setShowEdit(false)} />
            <DeleteSubLocationModal
                show={showDelete}
                handleClose={() => setShowDelete(false)}
                selectedSubLocations={selectedForDeletion}
            />
        </>
    );
};

const AddSubLocationModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Add Sub Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>Sub Location Name</Form.Label>
                <Form.Control type="text" placeholder="Name..." />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>Save</Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
    </Modal>
);

const EditSubLocationModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Edit Sub Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>Sub Location Name</Form.Label>
                <Form.Control type="text" placeholder="Name..." />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>Save</Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
    </Modal>
);

const DeleteSubLocationModal = ({ show, handleClose, selectedSubLocations }) => {
    const handleDelete = () => {
        const idsToDelete = selectedSubLocations.map((sublocation) => sublocation.id);

        fetch("/api/sublocations", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: idsToDelete }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete sublocations");
                }
                return response.json();
            })
            .then(() => {
                handleClose(); // Close the modal after successful deletion
            })
            .catch((error) => {
                console.error("Error deleting sublocations:", error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the following sublocations?
                <ul>
                    {selectedSubLocations.map((sublocation) => (
                        <li key={sublocation.id}>{sublocation.name} ({sublocation.room} {sublocation.building})</li>
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

export default SubLocationModal;
