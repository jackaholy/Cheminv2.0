import logo from "./logo.svg";
import "./App.css";
import React from "react";

function App() {
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/example", {
          credentials: "include",
        });
        setMessage((await response.json())["message"]);
      } catch (error) {
        window.location.href = "/login";
        setMessage(
          "Something went wrong connecting to the backend server:" +
            error.message
        );
      }
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
        <a href="/logout">Logout</a>
      </header>
    </div>
  );
}

export default App;
