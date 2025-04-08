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
    const handleShowEdit = (location) => {
        setShowEdit(true);
        setEditLocationData(location);
    };
    const handleCloseDelete = () => setShowDelete(false);
    const handleShowDelete = () => setShowDelete(true);

    const [filterQuery, setFilterQuery] = useState("");
    const [editLocationData, setEditLocationData] = useState(null);

    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    useEffect(() => {
        loadLocations();
    }, [show]);
    const loadLocations = () => {
        // Fetch locations when the modal is shown
        if (show) {
            fetch("/api/locations")
                .then((response) => response.json())
                .then((data) => {
                    // Initialize each location with a 'selected' property
                    const locationsWithSelection = data.map(location => ({ ...location, selected: false }));
                    setLocations(locationsWithSelection);
                })
                .catch((error) => {
                    console.error("Error fetching locations:", error);
                });
        }
    }
    useEffect(() => {
        setFilteredLocations(
            locations.filter((location) =>
                `${location.building} ${location.room}`.toLowerCase().includes(filterQuery.toLowerCase()
                )
            ));
    }, [filterQuery, locations]);

    const handleCheckboxChange = (index) => {
        const newLocations = [...locations];
        newLocations[index].selected = !newLocations[index].selected;
        setLocations(newLocations);
    };
    const handleDelete = async () => {
        const selectedLocations = locations.filter(location => location.selected);
        // Perform delete operation here
        console.log("Deleting locations:", selectedLocations);
        for (const location of selectedLocations) {
            try {
                const response = await fetch(`/api/locations/${location.location_id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                await response.json();
            } catch (error) {
                console.error("Error deleting location:", error);
                alert("Failed to delete: " + location.room + ". Check console for details.");
                return; // Bail out if any deletion fails
            }
        }
        alert("Deleted: " + selectedLocations.map(location => location.room).join(", ") + " successfully");
        setShowDelete(false);
        loadLocations();

    }
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
                    <LocationTable
                        locations={filteredLocations}
                        handleCheckboxChange={handleCheckboxChange}
                        handleShowEdit={handleShowEdit}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleShowAdd}>
                        Add Location
                    </Button>
                    <Button variant="secondary" onClick={handleShowDelete}>
                        Remove Selected Location(s)
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <AddLocationModal
                show={showAdd}
                handleClose={handleCloseAdd}
            />

            <EditLocationModal
                show={showEdit}
                handleClose={handleCloseEdit}
                locationData={editLocationData}
            />

            <DeleteLocationConfirmationModal
                show={showDelete}
                handleClose={handleCloseDelete}
                locations={locations}
                handleDelete={handleDelete}
            />
        </>
    );
};

const LocationTable = ({ locations, handleCheckboxChange, handleShowEdit }) => (
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
            {locations.map((location, index) => (
                <tr key={index}>
                    <td>
                        <Form.Check
                            type="checkbox"
                            id={`location-${index}`}
                            checked={location.selected}
                            onChange={() => handleCheckboxChange(index)}
                        />
                    </td>
                    <td>{location.room}</td>
                    <td>{location.building}</td>
                    <td>
                        <Button variant="outline-success" onClick={() => handleShowEdit(location)}>Edit</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
);

const AddLocationModal = ({ show, handleClose }) => {
    const [room, setRoom] = useState("");
    const [building, setBuilding] = useState("");

    const handleSave = async () => {
        try {
            const response = await fetch("/api/locations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ room, building }),
            });

            if (!response.ok) {
                throw new Error("Failed to add location");
            }

            alert("Location added successfully");
            handleClose();
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Failed to add location. Check console for details.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Room</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter room..."
                            aria-label="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Building</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter building..."
                            aria-label="building"
                            value={building}
                            onChange={(e) => setBuilding(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditLocationModal = ({ show, handleClose, locationData }) => {
    const [room, setRoom] = useState(locationData?.room || "");
    const [building, setBuilding] = useState(locationData?.building || "");

    useEffect(() => {
        setRoom(locationData?.room || "");
        setBuilding(locationData?.building || "");
    }, [locationData]);

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/locations/${locationData.location_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ room, building }),
            });

            if (!response.ok) {
                throw new Error("Failed to update location");
            }

            alert("Location updated successfully");
            handleClose();
        } catch (error) {
            console.error("Error updating location:", error);
            alert("Failed to update location. Check console for details.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Room</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter room..."
                            aria-label="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Building</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter building..."
                            aria-label="building"
                            value={building}
                            onChange={(e) => setBuilding(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const DeleteLocationConfirmationModal = ({ show, handleClose, locations, handleDelete }) => (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to delete the following locations?:
            <ul>
                {locations.filter(location => location.selected).map((location, index) => (
                    <li key={index}>{location.room} - {location.building}</li>
                ))}
            </ul>
            <b>This will delete every bottle in every sub location in these rooms, permanently and irreversably.</b>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleDelete}>
                Yes
            </Button>
            <Button variant="secondary" onClick={handleClose}>
                Cancel
            </Button>
        </Modal.Footer>
    </Modal>
);

export default LocationModal;
