import { useState } from "react";
export const Sidebar = ({
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
