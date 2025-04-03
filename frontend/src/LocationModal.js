import React, { useState } from "react";

const LocationModal = () => {
    const [show, setShow] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            {/* Location Modal */}
            <div className={`modal fade ${show ? "show d-block" : ""}`} id="locationModal" tabIndex="-1" aria-labelledby="locationModalLabel" aria-hidden={!show}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="locationModalLabel">Locations</h1>
                            <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="d-flex">
                                <input className="form-control me-2" type="search" placeholder="Search" />
                                <button className="btn btn-outline-success" type="submit">Search</button>
                            </form>

                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th scope="col">Room</th>
                                        <th scope="col">Building</th>
                                        <th scope="col">Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input className="form-check-input" type="checkbox" value="" id="4" /></td>
                                        <td>111</td>
                                        <td>FC</td>
                                        <td>
                                            <button className="btn btn-outline-success" onClick={() => setShowEdit(true)}>Edit</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input className="form-check-input" type="checkbox" value="" id="5" /></td>
                                        <td>114</td>
                                        <td>FC</td>
                                        <td>
                                            <button className="btn btn-outline-success" onClick={() => setShowEdit(true)}>Edit</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input className="form-check-input" type="checkbox" value="" id="6" /></td>
                                        <td>115</td>
                                        <td>FC</td>
                                        <td>
                                            <button className="btn btn-outline-success" onClick={() => setShowEdit(true)}>Edit</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Location</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(true)}>Remove Location</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Location Modal */}
            <div className={`modal fade ${showAdd ? "show d-block" : ""}`} id="addLoc" aria-hidden={!showAdd}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addLocLabel">Add Location</h1>
                            <button type="button" className="btn-close" onClick={() => setShowAdd(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Location Name</span>
                                <input type="text" className="form-control" placeholder="Name..." aria-label="locName" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowAdd(false)}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Location Modal */}
            <div className={`modal fade ${showEdit ? "show d-block" : ""}`} id="editLoc" aria-hidden={!showEdit}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="editLocLabel">Edit Location</h1>
                            <button type="button" className="btn-close" onClick={() => setShowEdit(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Location Name</span>
                                <input type="text" className="form-control" placeholder="Name..." aria-label="locName" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowEdit(false)}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Location Modal */}
            <div className={`modal fade ${showDelete ? "show d-block" : ""}`} id="deleteLoc" aria-hidden={!showDelete}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="deleteLocLabel">Confirm Deletion</h1>
                            <button type="button" className="btn-close" onClick={() => setShowDelete(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the following:
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowDelete(false)}>Yes</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Button to open the main modal */}
            <button className="btn btn-primary mt-3" onClick={() => setShow(true)}>Open Location Modal</button>
        </>
    );
};

export default LocationModal;
