import React, { useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap"; // React-Bootstrap components

const ManufacturerModal = ({ showManufacturerModal, setShowManufacturerModal }) => {
  const [showAddManModal, setShowAddManModal] = useState(false);
  const [showEditManModal, setShowEditManModal] = useState(false);
  const [showDeleteManModal, setShowDeleteManModal] = useState(false);

  // Toggle Modals
  const handleCloseManufacturerModal = () => setShowManufacturerModal(false);
  const handleCloseAddManModal = () => setShowAddManModal(false);
  const handleCloseEditManModal = () => setShowEditManModal(false);
  const handleCloseDeleteManModal = () => setShowDeleteManModal(false);

  return (
    <div>
      {/* Manufacturer Modal */}
      <Modal
        show={showManufacturerModal}
        onHide={handleCloseManufacturerModal}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manufacturers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="d-flex">
            <Form.Control type="search" placeholder="Search" className="me-2" />
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
              <tr>
                <td><input className="form-check-input" type="checkbox" /></td>
                <td>Big Pharma</td>
                <td>
                  <Button variant="outline-success" onClick={() => setShowEditManModal(true)}>
                    Edit
                  </Button>
                </td>
              </tr>
              {/* More rows can go here */}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowAddManModal(true)}>
            Add Manufacturer
          </Button>
          <Button variant="secondary" onClick={handleCloseManufacturerModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Manufacturer Modal */}
      <Modal show={showAddManModal} onHide={handleCloseAddManModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Manufacturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Manufacturer Name</Form.Label>
            <Form.Control type="text" placeholder="Name..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseAddManModal}>
            Save
          </Button>
          <Button variant="secondary" onClick={handleCloseAddManModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Manufacturer Modal */}
      <Modal show={showEditManModal} onHide={handleCloseEditManModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Manufacturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Manufacturer Name</Form.Label>
            <Form.Control type="text" placeholder="Name..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseEditManModal}>
            Save
          </Button>
          <Button variant="secondary" onClick={handleCloseEditManModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Manufacturer Modal */}
      <Modal show={showDeleteManModal} onHide={handleCloseDeleteManModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the following:
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseDeleteManModal}>
            Yes
          </Button>
          <Button variant="secondary" onClick={handleCloseDeleteManModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManufacturerModal;
