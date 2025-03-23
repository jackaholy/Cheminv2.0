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
  };=

  function handleSearch(query, synonyms = false) {
    if (query === "") {
      getChemicals();
      return;
    }
    setSearching(true);
    fetch(`/api/search?query=${query}&synonyms=${synonyms}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Search setting results:", data);
        setResults(data);
        setSearching(false);
      })
      .catch((error) => console.error(error));
  }

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

  /**
   * Get the quantity of a specific chemical.
   */
  function getQuantity() {
    fetch("/api/get_chemicals", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
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
        const response = await fetch(`/api/search?query=${query}&synonyms=false`, {
      credentials: "include",
    }));
        const data = await response.json();
        setResults(data);
        setSearching(false);
      };*/

  function getLocations() {
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
  }


  /**
   * Get the quantity of a specific chemical.
   */
  function getChemicals() {
    fetch("/api/get_chemicals", {
      credentials: "include",
    })
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
