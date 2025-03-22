import { useState, useEffect, use } from "react";

export const Sidebar = ({
  query,
  setQuery,
  getChemicals,
  setSearching,
  setResults,
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [locations, setRooms] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    fetch("/api/locations", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch("/api/manufacturers", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setManufacturers(data))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    handleSearch(query);
  }, [selectedManufacturers, selectedRoom]);
  const toggleManufacturer = (man) => {
    setSelectedManufacturers((prev) =>
      prev.includes(man) ? prev.filter((m) => m !== man) : [...prev, man]
    );
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
        console.log("Search setting results:", data);
        setResults(data);
        setSearching(false);
      })
      .catch((error) => console.error(error));
  }

  const debounceDelay = 75;
  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(query);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query]);

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
        <div className="tw-font-semibold">Room Location</div>
        <div className="tw-mt-2 tw-space-y-1">
          <label key={0} className="tw-flex tw-items-center">
            <input
              type="radio"
              name="room"
              className="tw-mr-2"
              onChange={() => setSelectedRoom(null)}
            />
            Any
          </label>
          {locations.map((location, index) => (
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
      </div>
      <div className="tw-mt-4">
        <div className="tw-font-semibold">Manufacturers</div>
        <div className="tw-mt-2 tw-space-y-1">
          {manufacturers.map((man, index) => (
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
      </div>
    </div>
  );
};
