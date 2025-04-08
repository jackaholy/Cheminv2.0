import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ChemicalEditModal = ({ show, handleClose, chemical }) => {
    console.log(chemical);
    const [chemicalName, setChemicalName] = useState(chemical?.chemical_name || "");
    const [chemicalFormula, setChemicalFormula] = useState(chemical?.formula || "");
    const [storageClasses, setStorageClasses] = useState([]);
    const [storageClassId, setStorageClassId] = useState(chemical?.storage_class_id || "");

    useEffect(() => {
        fetch("/api/storage_classes")
            .then((response) => response.json())
            .then((data) => setStorageClasses(data))
            .catch((error) => console.error(error));
    }, []);
    useEffect(() => {
        setChemicalName(chemical?.chemical_name || "");
        setChemicalFormula(chemical?.formula || "");
        setStorageClassId(chemical?.storage_class_id || "");
    }, [chemical]);

    const handleSave = () => {
        const updatedChemical = {
            chemical_name: chemicalName,
            chemical_formula: chemicalFormula,
            storage_class_id: storageClassId,
        };

        fetch(`/api/update_chemical/${chemical.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedChemical),
        })
            .then((response) => {
                if (response.ok) {
                    alert("Chemical updated successfully!");
                    handleClose();
                } else {
                    alert("Failed to update chemical.");
                }
            })
            .catch((error) => console.error("Error updating chemical:", error));
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this chemical? This action cannot be undone.")) {
            fetch(`/api/delete_chemical/${chemical.id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Chemical deleted successfully!");
                        handleClose();
                    } else {
                        alert("Failed to delete chemical.");
                    }
                })
                .catch((error) => console.error("Error deleting chemical:", error));
        }
    };

    console.log(storageClassId, chemicalName, chemicalFormula);
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Chemical</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Chemical Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter chemical name"
                            value={chemicalName}
                            onChange={(e) => setChemicalName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Chemical Formula</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter chemical formula"
                            value={chemicalFormula}
                            onChange={(e) => setChemicalFormula(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Storage Class</Form.Label>
                        <Form.Select
                            value={storageClassId}
                            onChange={(e) => setStorageClassId(e.target.value)}
                        >
                            <option value="">Select a storage class</option>
                            {storageClasses.map((sc) => (
                                <option key={sc.id} value={sc.id}>
                                    {sc.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChemicalEditModal;
