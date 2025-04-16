import {useState, useEffect} from "react";
import Accordion from "react-bootstrap/Accordion";

export const Sidebar = ({
                            query,
                            setQuery,
                            handleSearch,
                            selectedManufacturers,
                            setSelectedManufacturers,
                            selectedRoom,
                            setSelectedRoom,
                            selectedSubLocation,
                            setSelectedSubLocation,
                        }) => {
    const [roomFilterText, setRoomFilterText] = useState("");
    const [locations, setRooms] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);

    const [manufacturerFilterText, setManufacturerFilterText] = useState("");
    const [manufacturers, setManufacturers] = useState([]);
    const [filteredManufacturers, setFilteredManufacturers] = useState([]);

    const [subLocationFilterText, setSubLocationFilterText] = useState("");
    const [subLocations, setSubLocations] = useState([]);
    const [filteredSubLocations, setFilteredSubLocations] = useState([]);

    useEffect(() => {
        if (manufacturerFilterText !== "") {
            setFilteredManufacturers(
                manufacturers.filter((man) =>
                    man.name.toLowerCase().includes(manufacturerFilterText.toLowerCase())
                )
            );
        } else {
            setFilteredManufacturers(manufacturers);
        }
    }, [manufacturerFilterText, manufacturers]);

    useEffect(() => {
        if (roomFilterText !== "") {
            setFilteredLocations(
                locations.filter((loc) =>
                    `${loc.building} ${loc.room}`
                        .toLowerCase()
                        .includes(roomFilterText.toLowerCase())
                )
            );
        } else {
            setFilteredLocations(locations);
        }
    }, [roomFilterText, locations]);

    useEffect(() => {
        fetch("/api/locations", {credentials: "include"})
            .then((response) => response.json())
            .then((data) => {
                setRooms(data);
                // When location changes, update sublocation list
                if (selectedRoom) {
                    const location = data.find(loc => loc.location_id === selectedRoom);
                    setSubLocations(location?.sub_locations || []);
                } else {
                    setSubLocations([]);
                }
            })
            .catch((error) => console.error(error));
    }, [selectedRoom]);

    useEffect(() => {
        fetch("/api/manufacturers", {credentials: "include"})
            .then((response) => response.json())
            .then((data) => setManufacturers(data))
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        handleSearch(query);
    }, [selectedManufacturers, selectedRoom, selectedSubLocation]);

    useEffect(() => {
        if (subLocationFilterText !== "") {
            setFilteredSubLocations(
                subLocations.filter((loc) =>
                    loc.sub_location_name.toLowerCase().includes(subLocationFilterText.toLowerCase())
                )
            );
        } else {
            setFilteredSubLocations(subLocations);
        }
    }, [subLocationFilterText, subLocations]);

    const toggleManufacturer = (man) => {
        setSelectedManufacturers((prev) =>
            prev.includes(man) ? prev.filter((m) => m !== man) : [...prev, man]
        );
    };

    const debounceDelay = 75;
    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch(query);
        }, debounceDelay);

        return () => clearTimeout(handler);
    }, [query]);

    return (
        <div className="tw-w-1/4 tw-bg-white tw-p-4 tw-rounded-md tw-shadow-md">
            {/* Search Bar */}
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

            {/* Room Accordion */}
            <Accordion defaultActiveKey="0" className="tw-mt-4">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Room Location</Accordion.Header>
                    <Accordion.Body>
                        <input
                            className="form-control tw-mt-2"
                            placeholder="Filter rooms"
                            value={roomFilterText}
                            onChange={(e) => setRoomFilterText(e.target.value)}
                        />
                        <div className="tw-mt-2 tw-space-y-1" data-testid="room-filter">
                            <label key={0} className="tw-flex tw-items-center">
                                <input
                                    type="radio"
                                    name="room"
                                    className="tw-mr-2"
                                    onChange={() => setSelectedRoom(0)}
                                />
                                Any
                            </label>
                            {filteredLocations.map((location, index) => (
                                <label key={index} className="tw-flex tw-items-center">
                                    <input
                                        type="radio"
                                        name="room"
                                        className="tw-mr-2"
                                        checked={selectedRoom === location.location_id}
                                        onChange={() => setSelectedRoom(location.location_id)}
                                    />
                                    {location.building} {location.room}
                                </label>
                            ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Sub-Location Accordion */}
            <Accordion defaultActiveKey="1" className="tw-mt-4">
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Sub-Location</Accordion.Header>
                    <Accordion.Body>
                        <input
                            className="form-control tw-mt-2"
                            placeholder="Filter sub-locations"
                            value={subLocationFilterText}
                            onChange={(e) => setSubLocationFilterText(e.target.value)}
                            disabled={!selectedRoom}
                        />
                        <div className="tw-mt-2 tw-space-y-1" data-testid="sub-location-filter">
                        {filteredSubLocations.length === 0 ? <i>Please select a room first</i> : 
                            <label key={0} className="tw-flex tw-items-center">
                                <input
                                    type="radio"
                                    name="sublocation"
                                    className="tw-mr-2"
                                    checked={selectedSubLocation === 0}
                                    onChange={() => setSelectedSubLocation(0)}
                                />
                                Any
                            </label>}
                          
                            {filteredSubLocations.map((subLoc, index) => (
                                <label key={index} className="tw-flex tw-items-center">
                                    <input
                                        type="radio"
                                        name="sublocation"
                                        className="tw-mr-2"
                                        checked={selectedSubLocation === subLoc.sub_location_id}
                                        onChange={() => setSelectedSubLocation(subLoc.sub_location_id)}
                                    />
                                    {subLoc.sub_location_name}
                                </label>
                            ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Manufacturer Accordion */}
            <Accordion defaultActiveKey="2" className="tw-mt-4">
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Manufacturers</Accordion.Header>
                    <Accordion.Body>
                        <input
                            className="form-control tw-mt-2"
                            placeholder="Filter manufacturers"
                            value={manufacturerFilterText}
                            onChange={(e) => setManufacturerFilterText(e.target.value)}
                        />
                        <div className="tw-mt-2 tw-space-y-1" data-testid="manufacturer-filter">
                            {filteredManufacturers.map((man, index) => (
                                <label key={index} className="tw-flex tw-items-center">
                                    <input
                                        type="checkbox"
                                        className="tw-mr-2"
                                        checked={selectedManufacturers.includes(man.id)}
                                        value={man.id}
                                        onChange={() => toggleManufacturer(man.id)}
                                    />
                                    {man.name}
                                </label>
                            ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};
