import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/api/example");
        setMessage((await response.json())["message"]);
      } catch (error) {
        setMessage("Something went wrong connecting to the backend server:" + error.message);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>React</h1>
      <p>Example of fetching data from the backend: </p>
      <p>{message}</p>
    </>
  )
}

export default App
