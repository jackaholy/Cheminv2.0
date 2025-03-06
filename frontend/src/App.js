import React, { useState, useEffect, use } from "react";
import "./style.css";
import { ManageUsersModal } from "./ManageUsersModal";

const ChemicalModal = ({ chemical, show, handleClose }) => {
  if (!chemical) return null; // Don't render if no chemical is selected

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">{chemical.name}</h1>
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
const Navbar = ({ handleShowAddChemicalModal }) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch("/api/user")
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error(error));
  }, []);
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <a className="navbar-brand me-auto" href="/">
          Chemical Inventory
        </a>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link active"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleShowAddChemicalModal();
                }}
              >
                Add Chemical
              </a>
            </li>
          </ul>
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Hi {user.name}
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li className="dropdown-item">You have {user.access} access</li>
                {user.access === "admin" ? (
                  <li>
                    <a
                      className="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#manageUsersModal"
                    >
                      Manage access
                    </a>
                  </li>
                ) : null}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

const AddChemicalModal = ({ show, handleClose }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [manufacturers, setManufacturers] = useState([]);
  useEffect(() => {
    fetch(`/api/locations`)
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    fetch(`/api/manufacturers`)
      .then((response) => response.json())
      .then((data) => setManufacturers(data))
      .catch((error) => console.error(error));
  }, []);
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
              <input type="number" className="form-control" />
              <label className="form-label">Chemical Name</label>
              <input type="text" className="form-control" />
              <label className="form-label">Chemical Formula/Common Name</label>
              <input type="text" className="form-control" placeholder="" />
              <label className="form-label">Storage Class</label>
              <input
                type="text"
                className="form-control"
                placeholder="Corr White"
              />
              <button type="button" className="btn btn-secondary">
                Select Chemical
              </button>
              <button type="button" className="btn btn-secondary">
                Fix Chemical Typo
              </button>
            </div>

            {/* Quantity Section */}
            {/* Unused Steve Harper feature? */}
            {/*
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
            */}

            {/* Update Info Section */}
            {/* Automatically filled in with current user */}
            {/*
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
            */}

            {/* Location Section */}
            <div className="grouped-section">
              <label className="form-label">Location</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setSelectedLocation(
                    locations.find(
                      (location) =>
                        location.location_id === parseInt(e.target.value)
                    )
                  )
                }
              >
                {locations.map((location) => (
                  <option value={location.location_id}>
                    {location.building} {location.room}
                  </option>
                ))}
              </select>
              <label className="form-label">Sub-Location</label>
              <select className="form-select">
                {selectedLocation &&
                  selectedLocation.sub_locations &&
                  selectedLocation.sub_locations.map((sub_location) => (
                    <option value={sub_location.sub_location_id}>
                      {sub_location.sub_location_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Manufacturer Section */}
            <div className="grouped-section">
              <label className="form-label">Manufacturer Name</label>
              <select className="form-select">
                {manufacturers.map((manufacturer) => (
                  <option value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
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

const Sidebar = ({
  chemicals,
  rooms,
  manufacturers,
  query,
  setQuery,
  handleSearch,
}) => {
  const [selectedChemicals, setSelectedChemicals] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);

  const toggleChemical = (chem) => {
    setSelectedChemicals((prev) =>
      prev.includes(chem) ? prev.filter((c) => c !== chem) : [...prev, chem]
    );
  };

  const toggleManufacturer = (man) => {
    setSelectedManufacturers((prev) =>
      prev.includes(man) ? prev.filter((m) => m !== man) : [...prev, man]
    );
  };

  return (
    <div className="tw-w-1/4 tw-bg-white tw-p-4 tw-rounded-md tw-shadow-md">
      <div className="tw-flex tw-items-center tw-border tw-p-2 tw-rounded-md">
        <form
          className="tw-w-full tw-flex"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
        >
          <input
            name="query"
            type="text"
            placeholder="Search..."
            className="tw-ml-2 tw-w-full tw-outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-bg-transparent tw-border-none hover:tw-opacity-70">
            <span className="material-icons">search</span>
          </button>
        </form>
      </div>
      <div className="tw-mt-4">
        <div className="tw-font-semibold">Popular Chemicals</div>
        <div className="tw-mt-2 tw-space-y-1">
          {chemicals.map((chem, index) => (
            <label key={index} className="tw-flex tw-items-center">
              <input
                type="checkbox"
                className="tw-mr-2"
                checked={selectedChemicals.includes(chem)}
                onChange={() => toggleChemical(chem)}
              />
              {chem}
            </label>
          ))}
        </div>
      </div>
      <div className="tw-mt-4">
        <div className="tw-font-semibold">Room Location</div>
        <div className="tw-mt-2 tw-space-y-1">
          {rooms.map((room, index) => (
            <label key={index} className="tw-flex tw-items-center">
              <input
                type="radio"
                name="room"
                className="tw-mr-2"
                checked={selectedRoom === room}
                onChange={() => setSelectedRoom(room)}
              />
              {room}
            </label>
          ))}
        </div>
      </div>
      <div className="tw-mt-4">
        <div className="tw-font-semibold">Manufacturers</div>
        <div className="tw-mt-2 tw-space-y-1">
          {manufacturers.map((man, index) => (
            <label key={index} className="tw-flex tw-items-center">
              <input
                type="checkbox"
                className="tw-mr-2"
                checked={selectedManufacturers.includes(man)}
                onChange={() => toggleManufacturer(man)}
              />
              {man}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainContent = ({
  chemicalsData,
  loading,
  query,
  handleSearch,
  handleShowModal,
}) => (
  <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
    <div className="tw-grid tw-grid-cols-3 tw-border-b tw-p-2 tw-font-semibold">
      <div>Quantity</div>
      <div>Chemical</div>
      <div>Chemical Symbol</div>
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

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [selectedChemical, setSelectedChemical] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAddChemicalModal, setShowAddChemicalModal] = useState(false);

  const handleShowModal = (chem) => {
    setSelectedChemical(chem);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowAddChemicalModal = () => {
    setShowAddChemicalModal(true);
  };

  const handleCloseAddChemicalModal = () => {
    setShowAddChemicalModal(false);
  };

  function handleSearch(query, synonyms = false) {
    if (query === "") {
      getChemicals();
      return;
    }
    setSearching(true);
    fetch(`/api/search?query=${query}&synonyms=${synonyms}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Search setting results:", data);
        setResults(data);
        setSearching(false);
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => response.json())
      .then((data) =>
        setRooms(
          data.map((location) => location.building + " " + location.room)
        )
      )
      .catch((error) => console.error(error));
  }, []);

  /**
   * Get the quantity of a specific chemical.
   */
  function getQuantity() {
    fetch("/api/get_chemicals")
      .then((response) => response.json())
      .then((data) => {
        // console.log("Fetched chemicals:", data);
        console.log("Get chemicals setting results:", data);
        setResults(data);
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    getQuantity(); // Fetch chemicals on component mount
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(query);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query]);
  /*const handleSearch = async (event) => {
        event.preventDefault();
        setSearching(true);
        const formData = new FormData(event.target);
        const query = formData.get("query");
        const response = await fetch(`/api/search?query=${query}&synonyms=false`);
        const data = await response.json();
        setResults(data);
        setSearching(false);
      };*/

  function getLocations() {
    fetch("/api/locations")
      .then((response) => response.json())
      .then((data) =>
        setRooms(
          data.map((location) => location.building + " " + location.room)
        )
      )
      .catch((error) => console.error(error));
  }

  /**
   * Get the quantity of a specific chemical.
   */
  function getChemicals() {
    fetch("/api/get_chemicals")
      .then((response) => response.json())
      .then((data) => {
        // console.log("Fetched chemicals:", data);
        console.log("Get chemicals setting results:", data);
        setResults(data);
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    getChemicals(); // Fetch chemicals on component mount
    getLocations();
  }, []);

  const manufacturers = ["Acros", "Matrix", "TCI", "BDH"];
  const chemicals = [
    "Acetic Acid",
    "Acetone",
    "Aluminum Nitrate",
    "Aluminum Oxide",
    "Ammonium Chloride",
    "Ammonium Hydroxide",
    "Ascorbic Acid",
    "Benzene",
  ];
  const debounceDelay = 75;
  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(query);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="tw-bg-gray-100 pb-3">
      <Navbar handleShowAddChemicalModal={handleShowAddChemicalModal} />
      <div className="tw-flex tw-mt-4">
        <Sidebar
          chemicals={chemicals}
          rooms={rooms}
          manufacturers={manufacturers}
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
        />
        <MainContent
          chemicalsData={results}
          loading={searching}
          query={query}
          handleSearch={handleSearch}
          handleShowModal={handleShowModal}
        />
        <ManageUsersModal />
      </div>
      <ChemicalModal
        chemical={selectedChemical}
        show={showModal}
        handleClose={handleCloseModal}
      />
      <AddChemicalModal
        show={showAddChemicalModal}
        handleClose={handleCloseAddChemicalModal}
      />
    </div>
  );
};

export default App;
