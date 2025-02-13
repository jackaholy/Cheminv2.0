import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    async function fetchData() {
      try {
        const token = auth.user?.access_token;
        console.log(auth);
        const response = await fetch("/api/example", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage((await response.json())["message"]);
      } catch (error) {
        setMessage(
          "Something went wrong connecting to the backend server:" +
            error.message
        );
      }
    }
    if (auth.isAuthenticated) {
      fetchData();
    }
  }, [auth]);
  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
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
  auth.signinRedirect();
  return <div>Redirecting to login...</div>;
}

export default App;
