import React, { useEffect, useState } from "react";
export const ManageUsersModal = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    fetch("/api/get_users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, users]);

  function onAccessChange(e, user_id) {
    const access = e.target.value;
    const userIndex = users.findIndex((user) => user.id === user_id);
    const updatedUsers = users;
    updatedUsers[userIndex].access = access;
    setUsers(updatedUsers);
    fetch("/api/users/update_access", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        access: access,
      }),
    }).then((response) => {
      if (response.ok) {
        setMessage(`User ${users[userIndex].username} updated to ${access}`);
      }
    });
  }

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [query]);

  return (
    <div
      className="modal fade"
      id="manageUsersModal"
      aria-labelledby="manageUsersModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="manageUsersModalLabel">
              Manage Users
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {message !== "" ? (
              <div className="alert alert-success">{message}</div>
            ) : null}
            <input
              className="form-control"
              type="text"
              placeholder="Filter users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Visitor</th>
                  <th scope="col">Editor</th>
                  <th scope="col">Full Access</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onChange={(e) => onAccessChange(e, user.id)}
                  >
                    <td>{user.username}</td>

                    <td>
                      <input
                        type="radio"
                        name={user.id + "access"}
                        value="Visitor"
                        checked={user.access === "Visitor"}
                        onChange={(e) => onAccessChange(e, user.id)}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={user.id + "access"}
                        value="Editor"
                        checked={user.access === "Editor"}
                        onChange={(e) => onAccessChange(e, user.id)}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={user.id + "access"}
                        value="Full Access"
                        checked={user.access === "Full Access"}
                        onChange={(e) => onAccessChange(e, user.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
