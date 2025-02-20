import React, { useState, useEffect } from "react";
import "./style.css";

const Navbar = ({ handleSearch }) => {
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

const Sidebar = ({ chemicals, rooms, manufacturers, handleSearch }) => {
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
        <form onSubmit={handleSearch} className="tw-w-full tw-flex">
          <input
            name="query"
            type="text"
            placeholder="Search..."
            className="tw-ml-2 tw-w-full tw-outline-none"
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

const MainContent = ({ chemicalsData, loading }) => (
  <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
    <div className="tw-grid tw-grid-cols-2 tw-border-b tw-p-2 tw-font-semibold">
      <div>Chemical</div>
      <div>Chemical Symbol</div>
    </div>
    <div className="tw-divide-y">
      {loading ? (
        <p>Loading...</p>
      ) : (
        chemicalsData.map((chem, index) => (
          <div key={index} className="tw-grid tw-grid-cols-2 tw-p-2">
            <div>{chem.name}</div>
            <div>{chem.symbol}</div>
          </div>
        ))
      )}
    </div>
  </div>
);

const App = () => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => response.json())
      .then((data) =>
        setRooms(data.map((location) => location.building + " " + location.room))
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

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearching(true);
    const formData = new FormData(event.target);
    const query = formData.get("query");
    const response = await fetch(`/api/search?query=${query}&synonyms=true`);
    const data = await response.json();
    setResults(data);
    setSearching(false);
  };

  return (
    <div className="tw-bg-gray-100">
      <Navbar handleSearch={handleSearch} />
      <div className="tw-flex tw-mt-4">
        <Sidebar
          chemicals={chemicals}
          rooms={rooms}
          manufacturers={manufacturers}
          handleSearch={handleSearch}
        />
        <MainContent chemicalsData={results} loading={searching} />
      </div>
    </div>
  );
};

export default App;
