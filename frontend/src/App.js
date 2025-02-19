import logo from "./logo.svg";
import "./App.css";
import React from "react";

function App() {
  const [message, setMessage] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState([]);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/example");
        setMessage((await response.json())["message"]);
      } catch (error) {
        setMessage(
          "Something went wrong connecting to the backend server:" +
            error.message
        );
      }
    }
    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearching(true);
    const formData = new FormData(e.target);
    const query = formData.get("query");
    const synonyms = formData.get("synonyms");
    const response = await fetch(
      `/api/search?query=${query}&synonyms=${synonyms}`
    );
    const data = await response.json();
    setResults(data);
    setSearching(false);
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>This is a new feature and it's awesome</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <p>Example of fetching data from the backend: </p>
        <p>{message}</p>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input type="checkbox" name="synonyms" value="true" />
          <label for="synonyms">Synonym Search</label>
          <input type="text" name="query" placeholder="Search for chemicals" />
          <button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>
        <ul>
          {results.map((result) => (
            <li>{result.name}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
