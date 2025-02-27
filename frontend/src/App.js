import React, {useState, useEffect, use} from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

const Navbar = ({}) => {
    return (
        <nav className="navbar navbar-expand-lg bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    Chemical Inventory
                </a>
                {/*<button*/}
                {/*  className="navbar-toggler"*/}
                {/*  type="button"*/}
                {/*  data-bs-toggle="collapse"*/}
                {/*  data-bs-target="#navbarSupportedContent"*/}
                {/*>*/}
                {/*  <span className="navbar-toggler-icon"></span>*/}
                {/*</button>*/}
                {/*<div className="collapse navbar-collapse" id="navbarSupportedContent">*/}
                {/*  <form className="d-flex" onSubmit={handleSearch}>*/}
                {/*    <input*/}
                {/*      name="query"*/}
                {/*      className="form-control me-2"*/}
                {/*      type="text"*/}
                {/*      placeholder="Search"*/}
                {/*    />*/}
                {/*    <button className="btn btn-outline-success" type="submit">*/}
                {/*      Search*/}
                {/*    </button>*/}
                {/*  </form>*/}
                {/*</div>*/}
            </div>
        </nav>
    );
};

const ChemicalModal = ({chemical, show, handleClose}) => {
    if (!chemical) return null; // Don't render if no chemical is selected

    return (
        <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">{chemical.name}</h1>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <label className="form-label">Chemical Abbreviation</label>
                        <input type="text" className="form-control" value={chemical.symbol} readOnly/>
                        <label className="form-label">Storage Class</label>
                        <input type="text" className="form-control" placeholder="Corr White" readOnly/>
                        <label className="form-label">MSDS</label>
                        <input type="text" className="form-control" placeholder="MSDS" readOnly/>
                        <label className="form-label">Minimum Needed</label>
                        <input type="text" className="form-control" placeholder="3" readOnly/>
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
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
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

const MainContent = ({ chemicalsData, loading, query, handleSearch, handleShowModal }) => (
    <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
        <div className="tw-grid tw-grid-cols-2 tw-border-b tw-p-2 tw-font-semibold">
            <div>Chemical</div>
            <div>Chemical Symbol</div>
        </div>
        <div className="tw-divide-y">
            {loading && chemicalsData.length === 0 ? (
                <p>Loading...</p>
            ) : (
                chemicalsData.map((chem, index) => (
                    <div key={index} className="tw-grid tw-grid-cols-2 tw-p-2">
                        <div>
                            <a href="#" className="text-primary text-decoration-none" onClick={(e) => {
                                e.preventDefault();
                                handleShowModal(chem);
                            }}>
                                {chem.name}
                            </a>
                        </div>
                        <div>{chem.symbol}</div>
                    </div>

                ))
            )}
        </div>
        <div class="d-flex justify-content-center">
            {query != "" && (
                <button
                    class="btn btn-outline-success mt-3 mx-auto"
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

    const handleShowModal = (chem) => {
        setSelectedChemical(chem);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

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
                    handleShowModal={handleShowModal}
                />
            </div>
            <ChemicalModal chemical={selectedChemical} show={showModal} handleClose={handleCloseModal}/>
        </div>
    );
};

export default App;
