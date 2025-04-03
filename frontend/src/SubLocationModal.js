import React from "react";

const SubLocationModal = () => {
  const subLocations = [
    { id: 7, room: "acid cabinet", building: "FC 114" },
    { id: 8, room: "amino acids", building: "FC 114" },
    { id: 9, room: "corrosive white shelf", building: "FC 211" },
  ];

  return (
    <div>
      {/* Sub Location Modal */}
      <div
        className="modal fade"
        id="subModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="subModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="subModalLabel">
                Sub Locations
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <form className="d-flex">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                />
                <button className="btn btn-outline-success" type="submit">
                  Search
                </button>
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
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={location.id}
                        />
                      </td>
                      <td>{location.room}</td>
                      <td>{location.building}</td>
                      <td>
                        <button
                          className="btn btn-outline-success"
                          data-bs-target="#editSub"
                          data-bs-toggle="modal"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-target="#addSub"
                data-bs-toggle="modal"
              >
                Add Sub Location
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-target="#deleteSub"
                data-bs-toggle="modal"
              >
                Remove Sub Location
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Sub Location Modal */}
      <div
        className="modal fade"
        id="addSub"
        aria-hidden="true"
        aria-labelledby="addSubLabel"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="addSubLabel">
                Add Sub Location
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="input-group mb-3">
                <span className="input-group-text">Sub Location Name</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name..."
                  aria-label="locName"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Sub Location Modal */}
      <div
        className="modal fade"
        id="editSub"
        aria-hidden="true"
        aria-labelledby="editSubLabel"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="editSubLabel">
                Edit Sub Location
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="input-group mb-3">
                <span className="input-group-text">Sub Location Name</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name..."
                  aria-label="locName"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Sub Location Modal */}
      <div
        className="modal fade"
        id="deleteSub"
        aria-hidden="true"
        aria-labelledby="deleteSubLabel"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="deleteSubLabel">
                Confirm Deletion
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              Are you sure you want to delete the following:
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Yes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-target="#subModal"
                data-bs-toggle="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubLocationModal;
