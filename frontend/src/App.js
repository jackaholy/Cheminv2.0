import React, { useState, useEffect, use } from "react";
import "./style.css";
import { ManageUsersModal } from "./ManageUsersModal";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { Navbar } from "./Navbar";
import { AddChemicalModal } from "./AddChemicalModal";
import { ChemicalModal } from "./ChemicalModal";

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);

  const [selectedChemical, setSelectedChemical] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAddChemicalModal, setShowAddChemicalModal] = useState(false);

  const handleShowChemicalModal = (chem) => {
    setSelectedChemical(chem);
    setShowModal(true);
  };

  const handleCloseChemicalModal = () => {
    setShowModal(false);
    setSelectedChemical(null);
  };

  const handleShowAddChemicalModal = () => {
    setShowAddChemicalModal(true);
  };

  const handleCloseAddChemicalModal = () => {
    setShowAddChemicalModal(false);
  };
  function handleSearch(query, synonyms = false) {
    if (
      query === "" &&
      selectedManufacturers.length === 0 &&
      selectedRoom === 0
    ) {
      getChemicals();
      return;
    }
    setSearching(true);
    let url = `/api/search?query=${query}&synonyms=${synonyms}&manufacturers=${selectedManufacturers}`;

    if (selectedRoom && selectedRoom !== "none") {
      url += `&room=${selectedRoom}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
        setSearching(false);
      })
      .catch((error) => console.error(error));
  }
  /**
   * Get the quantity of a specific chemical.
   */
  function getChemicals() {
    fetch("/api/get_chemicals")
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
      })
      .catch((error) => console.error(error));
  }
  useEffect(() => {
    getChemicals();
    document.title = "Cheminv2.0";
  }, []);

  return (
    <div className="tw-bg-gray-100 pb-3">
      <Navbar handleShowAddChemicalModal={handleShowAddChemicalModal} />
      <div className="tw-flex tw-mt-4">
        <Sidebar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          selectedManufacturers={selectedManufacturers}
          setSelectedManufacturers={setSelectedManufacturers}
        />
        <MainContent
          chemicalsData={results}
          loading={searching}
          query={query}
          handleSearch={handleSearch}
          handleShowModal={handleShowChemicalModal}
        />
        <ManageUsersModal />
      </div>
      <ChemicalModal
        chemical={selectedChemical}
        show={showModal}
        handleClose={handleCloseChemicalModal}
      />
      <AddChemicalModal
        show={showAddChemicalModal}
        handleClose={handleCloseAddChemicalModal}
      />
    </div>
  );
};

export default App;
