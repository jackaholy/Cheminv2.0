import React, { useState, useEffect } from "react";
import "./style.css";
import { ManageUsersModal } from "./ManageUsersModal";


const Navbar = () => {
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
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
                    <button
                        className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-bg-transparent tw-border-none hover:tw-opacity-70">
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

const MainContent = ({chemicalsData, loading, query, handleSearch}) => (
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
                        <div>{chem.chemical_name}</div>
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

const App = () => {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [rooms, setRooms] = useState([]);

    function handleSearch(query, synonyms = false) {
        setSearching(true);
        fetch(`/api/search?query=${query}&synonyms=${synonyms}`)
            .then((response) => response.json())
            .then((data) => {
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
        fetch('/api/get_chemicals')
            .then((response) => response.json())
            .then((data) => {
                // console.log("Fetched chemicals:", data);
                setResults(data);
            })
            .catch((error) => console.error(error));
    }

    useEffect(() => {
        getQuantity(); // Fetch chemicals on component mount
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
    const debounceDelay = 400;
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

    return (
    <div className="tw-bg-gray-100 pb-3">
      <Navbar/>
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
        />
        <ManageUsersModal/>
      </div>
    </div>
  );
};

export default App;
