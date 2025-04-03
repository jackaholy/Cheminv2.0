import React from 'react';

const DeleteManufacturerModal = () => {
    return (
        <div className="modal fade" id="deleteMan" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="deleteManLabel">Confirm Deletion</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete the following:
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" data-bs-target="#manufacturerModal" data-bs-toggle="modal">Yes</button>
                        <button type="button" className="btn btn-secondary" data-bs-target="#manufacturerModal" data-bs-toggle="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteManufacturerModal;
