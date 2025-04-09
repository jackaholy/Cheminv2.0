import React, {useState} from "react";

const StorageClassModal = (show, handleClose) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            {/* Storage Class Modal */}
            <div className={`modal fade ${show ? "show d-block" : ""}`} id="classModal" tabIndex="-1"
                 aria-labelledby="classModalLabel" aria-hidden={!show}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="classModalLabel">Storage Class</h1>
                            <button type="button" className="btn-close" onClick={handleClose}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="d-flex">
                                <input className="form-control me-2" type="search" placeholder="Search"/>
                                <button className="btn btn-outline-success" type="submit">Search</button>
                            </form>

                            <table className="table">
                                <thead>
                                <tr>
                                    <th></th>
                                    <th scope="col">Storage Class Name</th>
                                    <th scope="col">Edit</th>
                                </tr>
                                </thead>
                                <tbody>
                                {["corr white", "flam red", "gen gray"].map((name, index) => (
                                    <tr key={index}>
                                        <td><input className="form-check-input" type="checkbox"/></td>
                                        <td>{name}</td>
                                        <td>
                                            <button className="btn btn-outline-success"
                                                    onClick={() => setShowEdit(true)}>Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add
                                Storage Class
                            </button>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowDelete(true)}>Remove Storage Class
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Storage Class Modal */}
            <div className={`modal fade ${showAdd ? "show d-block" : ""}`} id="addClass" aria-hidden={!showAdd}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addClassLabel">Add New Storage Class</h1>
                            <button type="button" className="btn-close" onClick={() => setShowAdd(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Storage Class Name</span>
                                <input type="text" className="form-control" placeholder="Name..."/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowAdd(false)}>Save</button>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowAdd(false)}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Storage Class Modal */}
            <div className={`modal fade ${showEdit ? "show d-block" : ""}`} id="editClass" aria-hidden={!showEdit}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="editClassLabel">Edit Storage Class</h1>
                            <button type="button" className="btn-close" onClick={() => setShowEdit(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Storage Class Name</span>
                                <input type="text" className="form-control" placeholder="Name..."/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowEdit(false)}>Save</button>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowEdit(false)}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Storage Class Modal */}
            <div className={`modal fade ${showDelete ? "show d-block" : ""}`} id="deleteClass"
                 aria-hidden={!showDelete}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="deleteClassLabel">Confirm Deletion</h1>
                            <button type="button" className="btn-close" onClick={() => setShowDelete(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the selected storage classes?
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowDelete(false)}>Yes</button>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowDelete(false)}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StorageClassModal;
