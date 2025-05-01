import React, {useState, useEffect} from "react";
import {Modal, Button, Form, Table} from "react-bootstrap";
import { StatusMessage } from "./StatusMessage";

const StorageClassModal = ({show, handleClose}) => {
    const [storageClasses, setStorageClasses] = useState([]);
    const [filter, setFilter] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedStorageClass, setSelectedStorageClass] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("success");

    const loadStorageClasses = () => {
        fetch("/api/storage_classes/", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setStorageClasses(data))
            .catch((error) => console.error("Error fetching storage classes:", error));
    };

    const handleSuccess = (message) => {
        setStatusMessage(message || "Operation successful");
        setStatusColor("success");
        loadStorageClasses();
    };

    const handleError = (message) => {
        setStatusMessage(message || "An error occurred");
        setStatusColor("danger");
    };

    useEffect(() => {
        if (show) {
            loadStorageClasses();
        }
    }, [show]);

    const handleCheckboxChange = (index) => {
        setStorageClasses((prevStorageClasses) =>
            prevStorageClasses.map((storageClass, i) =>
                i === index ? {...storageClass, selected: !storageClass.selected} : storageClass
            )
        );
    };

    const filteredStorageClasses = storageClasses.filter((storageClass) =>
        storageClass.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <>
            {/* Storage Class Modal */}
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Storage Class</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '60vh', overflowY: 'auto'}}>
                    <StatusMessage statusMessage={statusMessage} color={statusColor} />
                    <Form className="d-flex mb-3">
                        <Form.Control
                            type="search"
                            placeholder="Filter by storage class name"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Storage Class Name</th>
                            <th>Edit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStorageClasses.map((storageClass, index) => (
                            <tr key={index}>
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        checked={storageClass.selected}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </td>
                                <td>{storageClass.name}</td>
                                <td>
                                    <Button
                                        variant="outline-success"
                                        onClick={() => {
                                            setSelectedStorageClass(storageClass);
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
                    <Button variant="success" onClick={() => setShowAdd(true)}>Add Storage Class</Button>
                    <Button variant="danger" onClick={() => setShowDelete(true)}>Remove Storage Class</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <AddStorageClassModal
                show={showAdd}
                handleClose={() => setShowAdd(false)}
                onUpdate={loadStorageClasses}
                onSuccess={handleSuccess}
                onError={handleError}
            />
            <EditStorageClassModal
                show={showEdit}
                handleClose={() => setShowEdit(false)}
                storageClass={selectedStorageClass}
                onUpdate={loadStorageClasses}
                onSuccess={handleSuccess}
                onError={handleError}
            />
            <DeleteStorageClassModal
                show={showDelete}
                handleClose={() => setShowDelete(false)}
                selectedStorageClasses={filteredStorageClasses.filter((storageClass) => storageClass.selected)}
                onUpdate={loadStorageClasses}
                onSuccess={handleSuccess}
                onError={handleError}
            />
        </>
    );
};

const AddStorageClassModal = ({ show, handleClose, onUpdate, onSuccess, onError }) => {
    const [storageClassName, setStorageClassName] = useState("");

    const handleSave = async () => {
        if (!storageClassName) {
            onError("Please provide a storage class name.");
            return;
        }

        try {
            const response = await fetch('/api/storage_classes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({name: storageClassName}),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add storage class');
            }

            onSuccess("Storage Class added successfully");
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error adding storage class:', error);
            onError(error.message || 'Failed to add storage class');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Storage Class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Storage Class Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name..."
                        value={storageClassName}
                        onChange={(e) => setStorageClassName(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditStorageClassModal = ({ show, handleClose, storageClass, onUpdate, onSuccess, onError }) => {
    const [storageClassName, setStorageClassName] = useState(storageClass ? storageClass.name : "");

    React.useEffect(() => {
        if (storageClass) {
            setStorageClassName(storageClass.name);
        }
    }, [storageClass]);

    const handleSave = async () => {
        if (!storageClassName) {
            onError("Please provide a storage class name.");
            return;
        }

        try {
            const response = await fetch(`/api/storage_classes/${storageClass.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({name: storageClassName}),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update storage class');
            }

            onSuccess("Storage Class updated successfully");
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error updating storage class:', error);
            onError(error.message || 'Failed to update storage class');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Storage Class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Storage Class Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name..."
                        value={storageClassName}
                        onChange={(e) => setStorageClassName(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const DeleteStorageClassModal = ({ show, handleClose, selectedStorageClasses, onUpdate, onSuccess, onError }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            const filteredClasses = selectedStorageClasses.filter(sc => sc.name !== "Unknown");
            if (filteredClasses.length !== selectedStorageClasses.length) {
                onError('Cannot delete the "Unknown" storage class.');
                setIsDeleting(false);
                return;
            }

            const response = await fetch('/api/storage_classes/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    storageClasses: filteredClasses.map(sc => sc.name)
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete storage classes');
            }

            onSuccess("Storage classes deleted successfully");
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error deleting storage classes:', error);
            onError(error.message || 'Failed to delete storage classes');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the following storage classes?
                <ul>
                    {selectedStorageClasses.map((storageClass) => (
                        <li key={storageClass.name}>{storageClass.name}</li>
                    ))}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StorageClassModal;
