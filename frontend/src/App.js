import React, {useState, useEffect, use} from "react";
import "./style.css";
import {ManageUsersModal} from "./ManageUsersModal";
import {Sidebar} from "./Sidebar";
import {MainContent} from "./MainContent";
import {Navbar} from "./Navbar";
import {AddChemicalModal} from "./AddChemicalModal";
import {ChemicalModal} from "./ChemicalModal";
import {MissingMSDSModal} from "./MissingMSDSModal";
import {InventoryModal} from "./InventoryModal";
import ManufacturerModal from "./ManufacturerModal";
import LocationModal from "./LocationModal";
import SubLocationModal from "./SubLocationModal";
import StorageClassModal from "./StorageClassModal";

const App = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState(0);
    const [selectedManufacturers, setSelectedManufacturers] = useState([]);

    const [selectedChemical, setSelectedChemical] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [showAddChemicalModal, setShowAddChemicalModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showMissingMSDS, setShowMissingMSDSModal] = useState(false);

    const [showManufacturerModal, setShowManufacturerModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showSubLocationModal, setShowSubLocationModal] = useState(false);
    const [showStorageClassModal, setShowStorageClassModal] = useState(false);

    const handleShowManufacturerModal = () => setShowManufacturerModal(true);
    const handleCloseManufacturerModal = () => setShowManufacturerModal(false);

    const handleShowLocationModal = () => setShowLocationModal(true);
    const handleCloseLocationModal = () => setShowLocationModal(false);

    const handleShowSubLocationModal = () => setShowSubLocationModal(true);
    const handleCloseSubLocationModal = () => setShowSubLocationModal(false);

    const handleShowStorageClassModal = () => setShowStorageClassModal(true);
    const handleCloseStorageClassModal = () => setShowStorageClassModal(false);

    const handleShowChemicalModal = (chem) => {
        setSelectedChemical(chem);
        setShowModal(true);
    };

    const handleShowMissingMSDSModal = () => {
        setShowMissingMSDSModal(true);
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

    async function handleSearch(query, synonyms = false) {
        console.log(query, selectedManufacturers, selectedRoom);
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
        try {
            const response = await fetch(url, {credentials: "include"});
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setResults(data);
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setSearching(false);
        }
    }

    async function getChemicals() {
        try {
            const response = await fetch("/api/get_chemicals", {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setResults(data);
            return data;
        } catch (error) {
            console.error("Error fetching chemicals:", error);
        }
    }

    const refreshChemicals = async () => {
        if (
            query === "" &&
            selectedManufacturers.length === 0 &&
            selectedRoom === 0
        ) {
            return await getChemicals();
        } else {
            // Refresh the current search results using the current query
            return await handleSearch(query);
        }
    };

    useEffect(() => {
        getChemicals();
        document.title = "Cheminv2.0";
    }, []);

    return (
        <div className="tw-bg-gray-100 pb-3">
            <Navbar
                handleShowAddChemicalModal={handleShowAddChemicalModal}
                handleShowInventoryModal={() => setShowInventoryModal(true)}
                handleShowMissingMSDSModal={handleShowMissingMSDSModal}
                handleShowManufacturerModal={handleShowManufacturerModal}
                handleShowLocationModal={handleShowLocationModal}
                handleShowSubLocationModal={handleShowSubLocationModal}
                handleShowStorageClassModal={handleShowStorageClassModal}
            />
            <div className="tw-flex tw-mt-4">
                <Sidebar
                    query={query}
                    setQuery={setQuery}
                    handleSearch={handleSearch}
                    setSelectedManufacturers={setSelectedManufacturers}
                    selectedManufacturers={selectedManufacturers}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
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
                    onDataUpdate={async () => {
                        const updatedData = await refreshChemicals();
                        setResults(updatedData);
                    }}
                />
                <ManageUsersModal/>
            </div>
            <MissingMSDSModal
                show={showMissingMSDS}
                handleClose={() => {
                    setShowMissingMSDSModal(false);
                }}
            />
            <ChemicalModal
                chemical={selectedChemical}
                show={showModal}
                refreshChemicals={async () => {
                    const updatedData = await refreshChemicals();
                    const updatedChemical = updatedData.find(
                        (x) => x.id === selectedChemical.id
                    );
                    setSelectedChemical(updatedChemical);
                    handleShowChemicalModal(updatedChemical);
                }}
                handleClose={handleCloseChemicalModal}
            />
            <InventoryModal
                show={showInventoryModal}
                handleClose={() => {
                    setShowInventoryModal(false);
                }}
            />
            <AddChemicalModal
                show={showAddChemicalModal}
                handleClose={handleCloseAddChemicalModal}
            />
            <ManufacturerModal
                show={showManufacturerModal}
                handleClose={handleCloseManufacturerModal}
            />
            <LocationModal
                show={showLocationModal}
                handleClose={handleCloseLocationModal}
            />
            <SubLocationModal
                show={showSubLocationModal}
                handleClose={handleCloseSubLocationModal}
            />
            <StorageClassModal
                show={showStorageClassModal}
                handleClose={handleCloseStorageClassModal}
            />
        </div>
    );
};

export default App;
