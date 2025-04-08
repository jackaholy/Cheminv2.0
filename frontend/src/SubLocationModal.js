import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { LocationSelector } from "./LocationSelector";

const SubLocationModal = ({ show, handleClose }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [filter, setFilter] = useState(""); // State for the filter input
  const [sublocations, setSubLocations] = useState([]); // State for fetched sublocations
  const [currentEditSubLocation, setCurrentEditSubLocation] = useState(null); // State for the sublocation being edited

  const loadSubLocations = () => {
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
  };

  useEffect(() => {
    if (show) {
      loadSubLocations();
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
  const filteredSubLocations = sublocations.filter(
    (sublocation) =>
      sublocation.name.toLowerCase().includes(filter.toLowerCase()) ||
      `${sublocation.room} ${sublocation.building}`
        .toLowerCase()
        .includes(filter.toLowerCase())
  );

  const handleEditClick = (sublocation) => {
    setCurrentEditSubLocation(sublocation); // Set the sublocation to be edited
    setShowEdit(true);
  };

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
                  <td>
                    {sublocation.room} {sublocation.building}
                  </td>
                  <td>
                    <Button
                      variant="outline-success"
                      onClick={() => handleEditClick(sublocation)}
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
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            Add Sub Location
          </Button>
          <Button variant="secondary" onClick={() => setShowDelete(true)}>
            Remove Sub Location
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <AddSubLocationModal
        show={showAdd}
        handleClose={() => setShowAdd(false)}
        onUpdate={loadSubLocations}
      />
      <EditSubLocationModal
        show={showEdit}
        handleClose={() => setShowEdit(false)}
        sublocation={currentEditSubLocation} // Pass the current sublocation to the modal
        onUpdate={loadSubLocations}
      />
      <DeleteSubLocationModal
        show={showDelete}
        handleClose={() => setShowDelete(false)}
        selectedSubLocations={filteredSubLocations.filter((sublocation) => sublocation.selected)} // Inline filter
        onUpdate={loadSubLocations}
      />
    </>
  );
};

const AddSubLocationModal = ({ show, handleClose, onUpdate }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [subLocationName, setSubLocationName] = useState(""); // Added state for sublocation name

  const handleSave = () => {
    if (!subLocationName || !selectedLocation) {
      alert("Please provide a name and select a location.");
      return;
    }
    fetch("/api/sublocations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: subLocationName,
        locationId: selectedLocation.location_id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save sublocation");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sublocation saved successfully:", data);
        onUpdate();
        handleClose();
      })
      .catch((error) => {
        console.error("Error saving sublocation:", error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Sub Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Sub Location Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name..."
            value={subLocationName} // Bind input to state
            onChange={(e) => setSubLocationName(e.target.value)} // Update state on change
          />
        </Form.Group>
        <LocationSelector
          sublocationSelection={false}
          onChange={(location) => setSelectedLocation(location)}
        />
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

const EditSubLocationModal = ({ show, handleClose, sublocation, onUpdate }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    sublocation ? { location_id: sublocation.locationId } : null
  );
  const [subLocationName, setSubLocationName] = useState(
    sublocation ? sublocation.name : ""
  );

  useEffect(() => {
    if (sublocation) {
      setSelectedLocation({ location_id: sublocation.locationId });
      setSubLocationName(sublocation.name);
    }
  }, [sublocation]);

  const handleSave = () => {
    if (!subLocationName || !selectedLocation) {
      alert("Please provide a name and select a location.");
      return;
    }

    fetch(`/api/sublocations/${sublocation.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: subLocationName,
        locationId: selectedLocation.location_id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update sublocation");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sublocation updated successfully:", data);
        onUpdate();
        handleClose();
      })
      .catch((error) => {
        console.error("Error updating sublocation:", error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Sub Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Sub Location Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name..."
            value={subLocationName} // Bind input to state
            onChange={(e) => setSubLocationName(e.target.value)} // Update state on change
          />
        </Form.Group>
        <LocationSelector
          sublocationSelection={false}
          onChange={(location) => setSelectedLocation(location)}
          selectedLocation={selectedLocation} // Pass the selected location
        />
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

const DeleteSubLocationModal = ({
  show,
  handleClose,
  selectedSubLocations,
  onUpdate
}) => {
  const handleDelete = async () => {
    for (const sublocation of selectedSubLocations) {
      try {
        const response = await fetch(`/api/sublocations/${sublocation.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete sublocation');
        }
      } catch (error) {
        console.error("Error deleting sublocation:", error);
        return;
      }
    }
    onUpdate();
    handleClose();
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
            <li key={sublocation.id}>
              {sublocation.name} ({sublocation.room} {sublocation.building})
            </li>
          ))}
        </ul>
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
};

export default SubLocationModal;
