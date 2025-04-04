import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from 'react-bootstrap';

const LocationModal = (props) => {
    const { show, handleClose } = props;
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const handleCloseAdd = () => setShowAdd(false);
    const handleShowAdd = () => setShowAdd(true);
    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);
    const handleCloseDelete = () => setShowDelete(false);
    const handleShowDelete = () => setShowDelete(true);

    const [filterQuery, setFilterQuery] = useState("");

    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    useEffect(() => {
        // Fetch locations when the modal is shown
        if (show) {
            fetch("/api/locations")
                .then((response) => response.json())
                .then((data) => {
                    setLocations(data);
                })
                .catch((error) => {
                    console.error("Error fetching locations:", error);
                });
        }
    }, [show]);

    useEffect(() => {
        setFilteredLocations(
            locations.filter((location) =>
                `${location.building} ${location.room}`.toLowerCase().includes(filterQuery.toLowerCase()
            )
        ));
    }, [filterQuery, locations]);

    return (
        <>
            {/* Location Modal */}
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Locations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="d-flex">
                        <Form.Control
                            type="Filter"
                            placeholder="Filter"
                            className="me-2"
                            aria-label="Filter"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Room</th>
                                <th>Building</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLocations.map((location, index) => (
                            <tr key={index}>
                                <td><Form.Check type="checkbox" id="4" /></td>
                                <td>{location.room}</td>
                                <td>{location.building}</td>
                                <td>
                                    <Button variant="outline-success" onClick={handleShowEdit}>Edit</Button>
                                </td>
                            </tr>))
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleShowAdd}>
                        Add Location
                    </Button>
                    <Button variant="secondary" onClick={handleShowDelete}>
                        Remove Location
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Location Modal */}
            <Modal show={showAdd} onHide={handleCloseAdd}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control type="text" placeholder="Name..." aria-label="locName" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseAdd}>
                        Save
                    </Button>
                    <Button variant="secondary" onClick={handleCloseAdd}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Location Modal */}
            <Modal show={showEdit} onHide={handleCloseEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control type="text" placeholder="Name..." aria-label="locName" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseEdit}>
                        Save
                    </Button>
                    <Button variant="secondary" onClick={handleCloseEdit}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Location Modal */}
            <Modal show={showDelete} onHide={handleCloseDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the following:
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseDelete}>
                        Yes
                    </Button>
                    <Button variant="secondary" onClick={handleCloseDelete}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LocationModal;
