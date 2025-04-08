import React, { useState } from "react";

const ManufacturerModal = () => {
    const [show, setShow] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            {/* Manufacturer Modal */}
            <div className={`modal fade ${show ? "show d-block" : ""}`} id="manufacturerModal" tabIndex="-1" aria-labelledby="manufacturerModalLabel" aria-hidden={!show}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="manufacturerModalLabel">Manufacturers</h1>
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
                                        <th scope="col">Manufacturer Name</th>
                                        <th scope="col">Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {["Big Pharma", "Big Pharma", "Big Pharma"].map((name, index) => (
                                        <tr key={index}>
                                            <td><input className="form-check-input" type="checkbox" /></td>
                                            <td>{name}</td>
                                            <td>
                                                <button className="btn btn-outline-success" onClick={() => setShowEdit(true)}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Manufacturer</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(true)}>Remove Manufacturer</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Manufacturer Modal */}
            <div className={`modal fade ${showAdd ? "show d-block" : ""}`} id="addMan" aria-hidden={!showAdd}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addManLabel">Add Manufacturer</h1>
                            <button type="button" className="btn-close" onClick={() => setShowAdd(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Manufacturer Name</span>
                                <input type="text" className="form-control" placeholder="Name..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowAdd(false)}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Manufacturer Modal */}
            <div className={`modal fade ${showEdit ? "show d-block" : ""}`} id="editMan" aria-hidden={!showEdit}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="editManLabel">Edit Manufacturer</h1>
                            <button type="button" className="btn-close" onClick={() => setShowEdit(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Manufacturer Name</span>
                                <input type="text" className="form-control" placeholder="Name..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowEdit(false)}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Manufacturer Modal */}
            <div className={`modal fade ${showDelete ? "show d-block" : ""}`} id="deleteMan" aria-hidden={!showDelete}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="deleteManLabel">Confirm Deletion</h1>
                            <button type="button" className="btn-close" onClick={() => setShowDelete(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the selected manufacturers?
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowDelete(false)}>Yes</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Button to open the main modal */}
            <button className="btn btn-primary mt-3" onClick={() => setShow(true)}>Open Manufacturer Modal</button>
        </>
    );
};

export default ManufacturerModal;
