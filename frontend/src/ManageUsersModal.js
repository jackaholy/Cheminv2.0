import React, { use, useEffect, useState } from "react";
export const ManageUsersModal = () => {
  const [users, setUsers] = useState([
    // Delete these lines and fetch from the backend
    {
      id: 1,
      username: "sally student",
      access: "student",
    },
    {
      id: 2,
      username: "steven student",
      access: "student",
    },
    {
      id: 3,
      username: "paul professor",
      access: "admin",
    },
  ]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

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
                  <th scope="col">Student</th>
                  <th scope="col">Faculty</th>
                  <th scope="col">Admin</th>
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
                        value="student"
                        checked={user.access === "student"}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={user.id + "access"}
                        value="faculty"
                        checked={user.access === "faculty"}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={user.id + "access"}
                        value="admin"
                        checked={user.access === "admin"}
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
