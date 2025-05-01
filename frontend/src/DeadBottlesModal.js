import React, {useState, useEffect} from "react";
import {Modal, Button, Table, OverlayTrigger, Tooltip} from "react-bootstrap";

const DeadBottlesModal = ({show, handleClose, refreshChemicals}) => {
    const [deadChemicals, setDeadChemicals] = useState([]);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (show) {
            fetch("/api/get_chemicals?dead=true", {
                credentials: 'include'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setDeadChemicals(data);
                    setError(null);
                })
                .catch(err => {
                    console.error("Error fetching dead chemicals:", err);
                    setError("Failed to load dead chemicals");
                });
        }
    }, [show]);

    const isOldBottle = (dateStr) => {
        const bottleDate = new Date(dateStr);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return bottleDate < twoYearsAgo;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString();
    };

    const deleteDeadBottles = async () => {
        try {
            const response = await fetch("/api/chemicals/delete_dead", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({dead_bottles: deadChemicals.map(chemical => chemical.inventory.map(bottle => bottle.id)).flat()}),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setDeadChemicals([]);
            setShowConfirmation(false);
            if (refreshChemicals) refreshChemicals();
        } catch (error) {
            console.error("Error deleting dead bottles:", error);
            setError("Failed to delete dead bottles");
        }
    };

    const markAlive = async (bottle) => {
        try {
            const response = await fetch("/api/chemicals/mark_alive", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({inventory_id: bottle.id}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Remove the marked bottle from the list
            setDeadChemicals(prevChemicals =>
                prevChemicals.map(chemical => ({
                    ...chemical,
                    inventory: chemical.inventory.filter(b => b.id !== bottle.id)
                }))
            );

            if (refreshChemicals) refreshChemicals();
        } catch (error) {
            console.error("Error marking chemical as alive:", error);
            setError("Error marking chemical as alive");
        }
    };

    const sortedChemicals = deadChemicals.flatMap(chemical =>
        chemical.inventory.map(bottle => ({
            ...bottle,
            chemical_name: chemical.chemical_name
        }))
    )
        .filter(bottle => isOldBottle(bottle.last_updated))
        .sort((a, b) => new Date(a.last_updated) - new Date(b.last_updated));

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Dead Bottles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error ? (
                        <p className="text-danger">{error}</p>
                    ) : sortedChemicals.length === 0 ? (
                        <p>No bottles found that haven't been updated in 2 years.</p>
                    ) : (
                        <>
                            <p className="my-1">The following bottles haven't been updated in 2+ years and are slated
                                for deletion. Do you want to permanently and irreversably delete all of them?</p>
                            <div className="text-center">
                                <button className="btn btn-danger pad-danger my-1"
                                        onClick={() => setShowConfirmation(true)}>Delete All Dead Bottles
                                </button>
                            </div>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Chemical Name</th>
                                    <th>Sticker Number</th>
                                    <th>Location</th>
                                    <th>Last Updated</th>
                                    <th>Updated By</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedChemicals.map(bottle => (
                                    <tr key={bottle.sticker}>
                                        <td>{bottle.chemical_name}</td>
                                        <td>{bottle.sticker}</td>
                                        <td>{`${bottle.location} - ${bottle.sub_location}`}</td>
                                        <td>{formatDate(bottle.last_updated)}</td>
                                        <td>{bottle.who_updated}</td>
                                        <td>
                                            <OverlayTrigger
                                                placement="bottom"
                                                overlay={<Tooltip id="mark-alive">Mark as alive</Tooltip>}
                                            >
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => markAlive(bottle)}
                                                >
                                                    <i className="bi bi-clipboard-check"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to permanently delete all dead bottles (that haven't been updated in 2+
                    years)? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteDeadBottles}>
                        Yes, Delete All
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DeadBottlesModal;
