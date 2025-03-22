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

  useEffect(() => {
    if (query === "") {
      getChemicals();
    }
  }, [query]);

  return (
    <div className="tw-bg-gray-100 pb-3">
      <Navbar handleShowAddChemicalModal={handleShowAddChemicalModal} />
      <div className="tw-flex tw-mt-4">
        <Sidebar
          query={query}
          setQuery={setQuery}
          getChemicals={getChemicals}
          setSearching={setSearching}
          setResults={setResults}
        />
        <MainContent
          chemicalsData={results}
          loading={searching}
          query={query}
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
