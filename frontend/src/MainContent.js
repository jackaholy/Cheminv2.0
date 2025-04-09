import { useEffect, useState } from "react";
import ChemicalEditModal from "./ChemicalEditModal";
import { StatusMessage } from "./StatusMessage"; // Import StatusMessage

export const MainContent = ({
  chemicalsData,
  loading,
  query,
  handleSearch,
  handleShowModal,
  onDataUpdate, // Add this prop to MainContent
}) => {
  const [user, setUser] = useState({});
  const [showEditModal, setShowEditModal] = useState(false); // State to control modal visibility
  const [selectedChemical, setSelectedChemical] = useState(null); // State to store selected chemical
  const [statusMessage, setStatusMessage] = useState(""); // State for status message
  const [statusColor, setStatusColor] = useState(""); // State for status color

  useEffect(() => {
    fetch("/api/user", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error(error));
  }, []);

  const renderDownloadButton = (user) => {
    if (user.access === "Full Access" || user.access === "Editor") {
      return (
        <a
          href="/api/export_inventory_csv"
          className="btn btn-primary d-block ms-auto tw-mb-4"
        >
          Download CSV
        </a>
      );
    }
    return null;
  };

  const handleEditClick = (chemical) => {
    setSelectedChemical(chemical); // Set the selected chemical
    setShowEditModal(true); // Show the modal
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false); // Hide the modal
    setSelectedChemical(null); // Clear the selected chemical
  };

  return (
    <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
      <div className="tw-flex tw-justify-between">
        {renderDownloadButton(user)}
      </div>
      <StatusMessage statusMessage={statusMessage} color={statusColor} />
      <div className="tw-grid tw-grid-cols-[2fr_3fr_3fr_40px] tw-border-b tw-p-2 tw-font-semibold">
        <div>Quantity</div>
        <div>Chemical</div>
        <div>Chemical Formula</div>
        <div></div>
      </div>
      <div className="tw-divide-y">
        {loading && chemicalsData.length === 0 ? (
          <p>Loading...</p>
        ) : (
          chemicalsData.map((chem, index) => (
            <div key={index} className="tw-grid tw-grid-cols-[2fr_3fr_3fr_40px] tw-p-2">
              {/*Columns on the main page*/}
              <div>{chem.quantity}</div>
              <div>
                <button
                  type="button"
                  className="btn btn-link text-primary text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShowModal(chem);
                  }}
                >
                  {chem.chemical_name}
                </button>
              </div>
              <div>{chem.formula}</div>
              <div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditClick(chem)}
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="d-flex justify-content-center">
        {query !== "" && (
          <button
            className="btn btn-outline-success mt-3 mx-auto"
            type="submit"
            onClick={() => handleSearch(query, true)}
            disabled={loading}
          >
            {loading ? "Searching..." : "Expand Search"}
          </button>
        )}
      </div>
      <ChemicalEditModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        chemical={selectedChemical}
        onDataUpdate={onDataUpdate}
        setStatusMessage={setStatusMessage} // Pass setStatusMessage
        setStatusColor={setStatusColor} // Pass setStatusColor
      />
    </div>
  );
};
