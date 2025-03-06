export const AddChemicalModal = ({ show, handleClose }) => {
  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addChemicalLabel">
              Acetic Acid
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Identification Section */}
            <div className="grouped-section">
              <label className="form-label">Sticker Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="3008"
                readOnly
              />
              <label className="form-label">Chemical Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Acetic Acid"
                readOnly
              />
              <label className="form-label">Chemical Formula/Common Name</label>
              <input
                type="text"
                className="form-control"
                placeholder=""
                readOnly
              />
              <label className="form-label">Storage Class</label>
              <input
                type="text"
                className="form-control"
                placeholder="Corr White"
                readOnly
              />
              <button type="button" className="btn btn-secondary">
                Select Chemical
              </button>
              <button type="button" className="btn btn-secondary">
                Fix Chemical Typo
              </button>
            </div>

            {/* Quantity Section */}
            <div className="grouped-section">
              <label className="form-label">Quantity</label>
              <input type="text" className="form-control" placeholder="1" />
              <label className="form-label">Unit</label>
              <select className="form-select">
                <option selected>Bottle</option>
                <option value="Liters">Liters</option>
                <option value="Milliliters">Milliliters</option>
                <option value="Kilograms">Kilograms</option>
              </select>
            </div>

            {/* Update Info Section */}
            <div className="grouped-section">
              <label className="form-label">Last Updated</label>
              <input
                type="text"
                className="form-control"
                placeholder="2024-09-19"
                readOnly
              />
              <label className="form-label">Updated By</label>
              <input
                type="text"
                className="form-control"
                placeholder="emowat"
                readOnly
              />
            </div>

            {/* Location Section */}
            <div className="grouped-section">
              <label className="form-label">Location</label>
              <select className="form-select">
                <option selected>FC 212</option>
                <option value="FC 101">FC 101</option>
                <option value="Lab 3">Lab 3</option>
              </select>
              <label className="form-label">Sub-Location</label>
              <select className="form-select">
                <option selected>Hood G</option>
                <option value="Shelf A">Shelf A</option>
                <option value="Cabinet B">Cabinet B</option>
              </select>
            </div>

            {/* Manufacturer Section */}
            <div className="grouped-section">
              <label className="form-label">Manufacturer Name</label>
              <select className="form-select">
                <option selected>TCI</option>
                <option value="Sigma-Aldrich">Sigma-Aldrich</option>
                <option value="Fisher Scientific">Fisher Scientific</option>
              </select>
              <label className="form-label">Product Number</label>
              <input type="text" className="form-control" placeholder="N0155" />
              <label className="form-label">Material Safety Data Sheet</label>
              <input
                type="text"
                className="form-control"
                placeholder="MSDS Link"
                readOnly
              />
              <button type="button" className="btn btn-secondary">
                Add Manufacturer
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary">
              Save Chemical
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
