import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { useAuth, hasAuthParams } from "react-oidc-context";

function App() {
  const auth = useAuth();
  const [message, setMessage] = React.useState("");
  const [hasTriedSignin, setHasTriedSignin] = React.useState(false);

  // automatically sign-in
  React.useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const token = auth.user?.access_token;
        const response = await fetch("/api/example", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 403) {
          auth.signinRedirect();
        }
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

  if (!auth.isAuthenticated) {
    return <div>Unable to log in</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    if (
      auth.error.message ===
      "The Authorization Server requires End-User authentication"
    ) {
      auth.removeUser();
      auth.signinRedirect();
    }
    return <div>Oops... {auth.error.message}</div>;
  }

  if (window.location.href.includes("oidc/callback")) {
    window.location.href = "/";
  }

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
