import React from 'react';

const AddManufacturerModal = () => {
    return (
        <div className="modal fade" id="addMan" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="addManLabel">Add Manufacturer</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Manufacturer Name</span>
                            <input type="text" className="form-control" placeholder="Name..." aria-label="manName" aria-describedby="basic-addon1" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" data-bs-target="#manufacturerModal" data-bs-toggle="modal">Save</button>
                        <button type="button" className="btn btn-secondary" data-bs-target="#manufacturerModal" data-bs-toggle="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddManufacturerModal;
