import React, {useCallback, useEffect, useState} from "react";
import {Modal, Button, Form, Table} from 'react-bootstrap';
import {StatusMessage} from "./StatusMessage";

const LocationModal = (props) => {
    const {show, handleClose} = props;
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

    const [showFinalConfirm, setShowFinalConfirm] = useState(false);

    const [filterQuery, setFilterQuery] = useState("");
    const [editLocationData, setEditLocationData] = useState(null);

    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("success");

    const loadLocations = useCallback(() => {
        // Fetch locations when the modal is shown
        if (show) {
            fetch("/api/locations")
                .then((response) => response.json())
                .then((data) => {
                    // Initialize each location with a 'selected' property
                    const locationsWithSelection = data.map(location => ({...location, selected: false}));
                    setLocations(locationsWithSelection);
                })
                .catch((error) => {
                    console.error("Error fetching locations:", error);
                });
        }
    }, [show]);


    useEffect(() => {
        loadLocations();
    }, [show, loadLocations]);

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
                setStatusMessage(`Failed to delete: ${location.room}`);
                setStatusColor("danger");
                return;
            }
        }
        setStatusMessage(`Deleted: ${selectedLocations.map(location => location.room).join(", ")} successfully`);
        setStatusColor("success");
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
                <Modal.Body className="overflow-auto" style={{maxHeight: '60vh'}}>
                    <StatusMessage statusMessage={statusMessage} color={statusColor}/>
                    <Form className="d-flex">
                        <Form.Control
                            type="Filter"
                            placeholder="Filter"
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
                onLocationChange={loadLocations}
                setStatusMessage={setStatusMessage}
                setStatusColor={setStatusColor}
            />

            <EditLocationModal
                show={showEdit}
                handleClose={handleCloseEdit}
                locationData={editLocationData}
                onLocationChange={loadLocations}
                setStatusMessage={setStatusMessage}
                setStatusColor={setStatusColor}
            />

            <DeleteLocationConfirmationModal
                show={showDelete}
                handleClose={handleCloseDelete}
                locations={locations}
                handleFinalConfirm={() => {
                    setShowDelete(false); // Hide the first confirmation
                    setShowFinalConfirm(true); // Show the second "super sure?" confirmation
                }}
            />

            <FinalDeleteConfirmationModal
                show={showFinalConfirm}
                handleClose={() => setShowFinalConfirm(false)}
                handleDelete={async () => {
                    await handleDelete();
                    setShowFinalConfirm(false);
                }}
            />
        </>
    );
};

const LocationTable = ({locations, handleCheckboxChange, handleShowEdit}) => (
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

const AddLocationModal = ({show, handleClose, onLocationChange, setStatusMessage, setStatusColor}) => {
    const [room, setRoom] = useState("");
    const [building, setBuilding] = useState("");

    const handleSave = async () => {
        try {
            const response = await fetch("/api/locations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({room, building}),
            });

            if (!response.ok) {
                throw new Error("Failed to add location");
            }

            handleClose();
            onLocationChange();
            setStatusMessage("Location added successfully");
            setStatusColor("success");
        } catch (error) {
            console.error("Error adding location:", error);
            setStatusMessage("Failed to add location");
            setStatusColor("danger");
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

const EditLocationModal = ({show, handleClose, locationData, onLocationChange, setStatusMessage, setStatusColor}) => {
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
                body: JSON.stringify({room, building}),
            });

            if (!response.ok) {
                throw new Error("Failed to update location");
            }

            handleClose();
            onLocationChange();
            setStatusMessage("Location updated successfully");
            setStatusColor("success");
        } catch (error) {
            console.error("Error updating location:", error);
            setStatusMessage("Failed to update location");
            setStatusColor("danger");
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

const DeleteLocationConfirmationModal = ({show, handleClose, locations, handleFinalConfirm}) => (
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
            <b>This will delete every bottle in every sub location in these rooms, permanently and irreversibly.</b>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleFinalConfirm}>
                Yes
            </Button>
            <Button variant="secondary" onClick={handleClose}>
                Cancel
            </Button>
        </Modal.Footer>
    </Modal>
);

const FinalDeleteConfirmationModal = ({show, handleClose, handleDelete}) => (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Final Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <b>Are you absolutely sure you want to permanently delete these locations?</b><br/>
            This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
            <Button variant="danger" onClick={handleDelete}>
                Permanently Delete
            </Button>
            <Button variant="secondary" onClick={handleClose}>
                Cancel
            </Button>
        </Modal.Footer>
    </Modal>
);

export default LocationModal;
