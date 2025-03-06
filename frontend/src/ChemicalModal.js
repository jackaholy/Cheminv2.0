export const ChemicalModal = ({ chemical, show, handleClose }) => {
  if (!chemical) return null; // Don't render if no chemical is selected

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">{chemical.chemical_name}</h1>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <label className="form-label">Chemical Abbreviation</label>
            <input
              type="text"
              className="form-control"
              value={chemical.symbol}
              readOnly
            />
            <label className="form-label">Storage Class</label>
            <input
              type="text"
              className="form-control"
              placeholder="Corr White"
              readOnly
            />
            <label className="form-label">MSDS</label>
            <input
              type="text"
              className="form-control"
              placeholder="MSDS"
              readOnly
            />
            <label className="form-label">Minimum Needed</label>
            <input
              type="text"
              className="form-control"
              placeholder="3"
              readOnly
            />
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Sticker #</th>
                  <th scope="col">Product #</th>
                  <th scope="col">Location</th>
                  <th scope="col">Sub-Location</th>
                  <th scope="col">Manufacturer</th>
                  <th scope="col">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {chemical.inventory?.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{item.sticker}</th>
                    <td>{item.product}</td>
                    <td>{item.location}</td>
                    <td>{item.subLocation}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
