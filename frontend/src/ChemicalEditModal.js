import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ChemicalEditModal = ({ show, handleClose, chemical, storageClasses, onSave }) => {
    const [chemicalName, setChemicalName] = useState(chemical?.Chemical_Name || "");
    const [chemicalFormula, setChemicalFormula] = useState(chemical?.Chemical_Formula || "");
    const [storageClassId, setStorageClassId] = useState(chemical?.Storage_Class_ID || "");

    useEffect(() => {
        if (chemical) {
            setChemicalName(chemical.Chemical_Name);
            setChemicalFormula(chemical.Chemical_Formula);
            setStorageClassId(chemical.Storage_Class_ID);
        }
    }, [chemical]);

    const handleSave = () => {
        if (!chemicalName || !storageClassId) {
            alert("Please provide all required fields.");
            return;
        }

        const updatedChemical = {
            ...chemical,
            Chemical_Name: chemicalName,
            Chemical_Formula: chemicalFormula,
            Storage_Class_ID: storageClassId,
        };

        onSave(updatedChemical);
        handleClose();
    };

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
                                <option key={sc.Storage_Class_ID} value={sc.Storage_Class_ID}>
                                    {sc.Storage_Class_Name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChemicalEditModal;
