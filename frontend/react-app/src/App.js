import logo from "./logo.svg";
import "./App.css";
import React from "react";

function App() {
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5001/api/example");
        setMessage((await response.json())["message"]);
      } catch (error) {
        setMessage(
          "Something went wrong connecting to the backend server:" +
            error.message
        );
      }
      setLoading(false);
    }
    fetchData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
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
      </header>
    </div>
  );
}

export default App;
