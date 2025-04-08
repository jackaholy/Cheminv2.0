import React, { useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const ManufacturerModal = ({ show, handleClose }) => {
    const [manufacturers, setManufacturers] = useState(["Big Pharma", "Small Pharma", "Medium Pharma"]);
    const [filter, setFilter] = useState(""); // State for the filter input
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    // Filtered manufacturers based on the filter input
    const filteredManufacturers = manufacturers.filter((name) =>
        name.toLowerCase().includes(filter.toLowerCase())
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
                            className="me-2"
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
                            {filteredManufacturers.map((name, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>{name}</td>
                                    <td>
                                        <Button variant="outline-success" onClick={() => setShowEdit(true)}>Edit</Button>
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
            <EditManufacturerModal show={showEdit} handleClose={() => setShowEdit(false)} />
            <DeleteManufacturerModal show={showDelete} handleClose={() => setShowDelete(false)} />
        </>
    );
};

const AddManufacturerModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Add Manufacturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>Manufacturer Name</Form.Label>
                <Form.Control type="text" placeholder="Name..." />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>Save</Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
    </Modal>
);

const EditManufacturerModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Edit Manufacturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>Manufacturer Name</Form.Label>
                <Form.Control type="text" placeholder="Name..." />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>Save</Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
    </Modal>
);

const DeleteManufacturerModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to delete the selected manufacturers?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>Yes</Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
    </Modal>
);

export default ManufacturerModal;
