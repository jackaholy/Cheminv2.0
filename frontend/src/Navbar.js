import { useState, useEffect } from "react";
export const Navbar = ({
  handleShowAddChemicalModal,
  handleShowInventoryModal,
}) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch("/api/user", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error(error));
  }, []);
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Chemical Inventory
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user.access === "Full Access" || user.access === "Editor" ? (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={handleShowAddChemicalModal}
                  >
                    Add Chemical
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={handleShowInventoryModal}
                  >
                    Inventory
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    MSDS Log
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Manage Database
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        Manufacturer List
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Location List
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Sub Location List
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Delete Elements
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <></>
            )}
          </ul>
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Hi {user.name}
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li className="dropdown-item">You have {user.access} access</li>
                {user.access === "Full Access" ? (
                  <li>
                    <a
                      className="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#manageUsersModal"
                    >
                      Manage access
                    </a>
                  </li>
                ) : null}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
