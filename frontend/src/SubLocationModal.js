import React, {useState} from "react";

const SubLocationModal = () => {
    const [show, setShow] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const subLocations = [
        {id: 7, room: "acid cabinet", building: "FC 114"},
        {id: 8, room: "amino acids", building: "FC 114"},
        {id: 9, room: "corrosive white shelf", building: "FC 211"},
    ];

    return (
        <>
            {/* Sub Location Modal */}
            <div className={`modal fade ${show ? "show d-block" : ""}`} id="subModal" tabIndex="-1"
                 aria-labelledby="subModalLabel" aria-hidden={!show}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="subModalLabel">Sub Locations</h1>
                            <button type="button" className="btn-close" onClick={() => setShow(false)}
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
                                    <th scope="col">Room</th>
                                    <th scope="col">Building</th>
                                    <th scope="col">Edit</th>
                                </tr>
                                </thead>
                                <tbody>
                                {subLocations.map((location) => (
                                    <tr key={location.id}>
                                        <td>
                                            <input className="form-check-input" type="checkbox" id={location.id}/>
                                        </td>
                                        <td>{location.room}</td>
                                        <td>{location.building}</td>
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
                            <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Sub
                                Location
                            </button>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowDelete(true)}>Remove Sub Location
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Sub Location Modal */}
            <div className={`modal fade ${showAdd ? "show d-block" : ""}`} id="addSub" aria-hidden={!showAdd}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addSubLabel">Add Sub Location</h1>
                            <button type="button" className="btn-close" onClick={() => setShowAdd(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Sub Location Name</span>
                                <input type="text" className="form-control" placeholder="Name..." aria-label="locName"/>
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

            {/* Edit Sub Location Modal */}
            <div className={`modal fade ${showEdit ? "show d-block" : ""}`} id="editSub" aria-hidden={!showEdit}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="editSubLabel">Edit Sub Location</h1>
                            <button type="button" className="btn-close" onClick={() => setShowEdit(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-3">
                                <span className="input-group-text">Sub Location Name</span>
                                <input type="text" className="form-control" placeholder="Name..." aria-label="locName"/>
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

            {/* Delete Sub Location Modal */}
            <div className={`modal fade ${showDelete ? "show d-block" : ""}`} id="deleteSub" aria-hidden={!showDelete}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="deleteSubLabel">Confirm Deletion</h1>
                            <button type="button" className="btn-close" onClick={() => setShowDelete(false)}
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the following:
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

            {/* Button to open the main modal */}
            <button className="btn btn-primary mt-3" onClick={() => setShow(true)}>Open Sub Location Modal</button>
        </>
    );
};

export default SubLocationModal;
