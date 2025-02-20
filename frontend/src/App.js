import React, { useState, useEffect } from "react";
import "./style.css";

const Navbar = () => (
  <nav className="navbar navbar-expand-lg bg-light">
    <div className="container-fluid">
      <a className="navbar-brand" href="#">
        Chemical Inventory
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <a className="nav-link active" href="#">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              Link
            </a>
          </li>
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              Dropdown
            </a>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  Action
                </a>
              </li>
            </ul>
          </li>
        </ul>
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
      </div>
    </div>
  </nav>
);

const Sidebar = ({ chemicals, rooms, manufacturers }) => (
  <div className="tw-w-1/4 tw-bg-white tw-p-4 tw-rounded-md tw-shadow-md">
    <div className="tw-flex tw-items-center tw-border tw-p-2 tw-rounded-md">
      <input
        type="text"
        placeholder="Search..."
        className="tw-ml-2 tw-w-full tw-outline-none"
      />
      <button className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-bg-transparent tw-border-none hover:tw-opacity-70">
        <span className="material-icons">search</span>
      </button>
    </div>
    <div className="tw-mt-4">
      <div className="tw-font-semibold">Popular Chemicals</div>
      <div className="tw-mt-2 tw-space-y-1">
        {chemicals.map((chem, index) => (
          <label key={index} className="tw-flex tw-items-center">
            <input type="checkbox" checked className="tw-mr-2" /> {chem}
          </label>
        ))}
      </div>
    </div>
    <div className="tw-mt-4">
      <div className="tw-font-semibold">Room Location</div>
      <div className="tw-mt-2 tw-space-y-1">
        {rooms.map((room, index) => (
          <label key={index} className="tw-flex tw-items-center">
            <input type="radio" name="room" className="tw-mr-2" /> {room}
          </label>
        ))}
      </div>
    </div>
    <div className="tw-mt-4">
      <div className="tw-font-semibold">Manufacturers</div>
      <div className="tw-mt-2 tw-space-y-1">
        {manufacturers.map((man, index) => (
          <label key={index} className="tw-flex tw-items-center">
            <input type="checkbox" className="tw-mr-2" /> {man}
          </label>
        ))}
      </div>
    </div>
  </div>
);

const MainContent = ({ chemicalsData }) => (
  <div className="tw-w-3/4 tw-bg-white tw-ml-4 tw-p-4 tw-rounded-md tw-shadow-md">
    <div className="tw-grid tw-grid-cols-2 tw-border-b tw-p-2 tw-font-semibold">
      <div>Chemical</div>
      <div>Chemical Symbol</div>
    </div>
    <div className="tw-divide-y">
      {chemicalsData.map((chem, index) => (
        <div key={index} className="tw-grid tw-grid-cols-2 tw-p-2">
          <div>{chem.name}</div>
          <div>{chem.symbol}</div>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
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
  /*
  const rooms = [
    "FC 111",
    "FC 114",
    "FC 115",
    "FC 212",
    "FC 213",
    "SH 218",
    "SH 316",
  ];
  */
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    fetch("/api/locations", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) =>
        setRooms(
          data.map((location) => location.building + " " + location.room)
        )
      )
      .catch((error) => console.error(error));
  }, []);
  const manufacturers = ["Acros", "Matrix", "TCI", "BDH"];
  const chemicalsData = [
    { name: "Acetone", symbol: "CH3-CO-CH3" },
    { name: "Distilled Water", symbol: "H2O" },
    { name: "Acetic Acid", symbol: "CH3COOH" },
  ];

  return (
    <div className="tw-bg-gray-100">
      <Navbar />
      <div className="tw-flex tw-mt-4">
        <Sidebar
          chemicals={chemicals}
          rooms={rooms}
          manufacturers={manufacturers}
        />
        <MainContent chemicalsData={chemicalsData} />
      </div>
    </div>
  );
};

export default App;
