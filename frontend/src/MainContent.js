import { useEffect, useState } from "react";

export const MainContent = ({
  chemicalsData,
  loading,
  query,
  handleSearch,
  handleShowModal,
}) => {
  const [user, setUser] = useState({});

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

  return (
    <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
      <div className="tw-flex tw-justify-between">
        {renderDownloadButton(user)}
      </div>
      <div className="tw-grid tw-grid-cols-3 tw-border-b tw-p-2 tw-font-semibold">
        <div>Quantity</div>
        <div>Chemical</div>
        <div>Chemical Formula</div>
      </div>
      <div className="tw-divide-y">
        {loading && chemicalsData.length === 0 ? (
          <p>Loading...</p>
        ) : (
          chemicalsData.map((chem, index) => (
            <div key={index} className="tw-grid tw-grid-cols-3 tw-p-2">
              {/*Columns on the main page*/}
              <div>{chem.quantity}</div>
              <div>
                <a
                  href="#"
                  className="text-primary text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShowModal(chem);
                  }}
                >
                  {chem.chemical_name}
                </a>
              </div>
              <div>{chem.formula}</div>
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
    </div>
  );
};
