import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const StorageClassModal = ({ show, handleClose }) => {
    const [storageClasses, setStorageClasses] = useState([]);
    const [filter, setFilter] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedStorageClass, setSelectedStorageClass] = useState(null);

    const loadStorageClasses = () => {
        fetch("/api/storage_classes/", {credentials: "include"})
            .then((res) => res.json())
            .then((data) =>
                setStorageClasses(data)
            )
            .catch((error) =>
                console.error("Error fetching storage classes:", error)
            );
    };

    useEffect(() => {
        if (show) {
            loadStorageClasses();
        }
    }, [show]);

    const handleCheckboxChange = (index) => {
        setStorageClasses((prevStorageClasses) =>
            prevStorageClasses.map((storageClass, i) =>
                i === index ? { ...storageClass, selected: !storageClass.selected } : storageClass
            )
        );
    };

    const filteredStorageClasses = storageClasses.filter((storageClass) =>
        storageClass.name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleDeleteSuccess = (deletedClasses) => {
        setStorageClasses(prevClasses => 
            prevClasses.filter(sc => !deletedClasses.includes(sc.name))
        );
        setShowDelete(false);
    };

    return (
        <>
            {/* Storage Class Modal */}
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Storage Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                    <Button variant="primary" onClick={() => setShowAdd(true)}>Add Storage Class</Button>
                    <Button variant="secondary" onClick={() => setShowDelete(true)}>Remove Storage Class</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <AddStorageClassModal 
                show={showAdd} 
                handleClose={() => setShowAdd(false)} 
                onUpdate={loadStorageClasses}
            />
            <EditStorageClassModal
                show={showEdit}
                handleClose={() => setShowEdit(false)}
                storageClass={selectedStorageClass}
                onUpdate={loadStorageClasses}
            />
            <DeleteStorageClassModal
                show={showDelete}
                handleClose={() => setShowDelete(false)}
                selectedStorageClasses={filteredStorageClasses.filter((storageClass) => storageClass.selected)}
                onDeleteSuccess={() => {
                    loadStorageClasses();
                    setShowDelete(false);
                }}
            />
        </>
    );
};

const AddStorageClassModal = ({ show, handleClose, onUpdate }) => {
    const [storageClassName, setStorageClassName] = useState("");

    const handleSave = async () => {
        if (!storageClassName) {
            alert("Please provide a storage class name.");
            return;
        }

        try {
            const response = await fetch('/api/storage_classes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: storageClassName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add storage class');
            }

            alert("Storage Class added successfully");
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error adding storage class:', error);
            alert(error.message || 'Failed to add storage class. Please try again.');
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
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditStorageClassModal = ({ show, handleClose, storageClass, onUpdate }) => {
    const [storageClassName, setStorageClassName] = useState(storageClass ? storageClass.name : "");

    React.useEffect(() => {
        if (storageClass) {
            setStorageClassName(storageClass.name);
        }
    }, [storageClass]);

    const handleSave = async () => {
        if (!storageClassName) {
            alert("Please provide a storage class name.");
            return;
        }

        try {
            const response = await fetch(`/api/storage_classes/${storageClass.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: storageClassName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update storage class');
            }

            alert("Storage Class updated successfully");
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error updating storage class:', error);
            alert(error.message || 'Failed to update storage class. Please try again.');
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
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

const DeleteStorageClassModal = ({ show, handleClose, selectedStorageClasses, onDeleteSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            // Prevent "Unknown" from being deleted
            const filteredClasses = selectedStorageClasses.filter(sc => sc.name !== "Unknown");
            if (filteredClasses.length !== selectedStorageClasses.length) {
                alert('Cannot delete the "Unknown" storage class.');
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

            onDeleteSuccess(selectedStorageClasses.map(sc => sc.name));
            handleClose();
        } catch (error) {
            console.error('Error deleting storage classes:', error);
            alert(error.message || 'Failed to delete storage classes. Please try again.');
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
