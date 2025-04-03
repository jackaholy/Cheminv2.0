import React from 'react';
import { Modal, Button } from "react-bootstrap";

const ManufacturerModal = ( {show, handleClose} ) => {
    console.log("ManufacturerModal rendered, show:", show);  /////////////// Remove eventually

    if (!show) return null;

    return (
        <div className="modal fade show d-block" id="manufacturerModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="manufacturerModalLabel">Manufacturers</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                                <tr>
                                    <td><input className="form-check-input" type="checkbox" value="" id="1" /></td>
                                    <td>Big Pharma</td>
                                    <td>
                                        <button className="btn btn-outline-success" data-bs-target="#editMan" data-bs-toggle="modal">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td><input className="form-check-input" type="checkbox" value="" id="2" /></td>
                                    <td>Big Pharma</td>
                                    <td>
                                        <button className="btn btn-outline-success" data-bs-target="#editMan" data-bs-toggle="modal">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td><input className="form-check-input" type="checkbox" value="" id="3" /></td>
                                    <td>Big Pharma</td>
                                    <td>
                                        <button className="btn btn-outline-success" data-bs-target="#editMan" data-bs-toggle="modal">Edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-target="#addMan" data-bs-toggle="modal">Add Manufacturer</button>
                        <button type="button" className="btn btn-secondary" data-bs-target="#deleteMan" data-bs-toggle="modal">Remove Manufacturer</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManufacturerModal;
