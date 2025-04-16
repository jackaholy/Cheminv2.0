import React, { useEffect, useState } from "react";

export const ManageUsersModal = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [showVisitors, setShowVisitors] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetch("/api/get_users", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error(error));
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    const accessOrder = { Visitor: 0, Editor: 1, "Full Access": 2 };
    if (accessOrder[a.access] !== accessOrder[b.access]) {
      return accessOrder[b.access] - accessOrder[a.access];
    }
    return a.username.localeCompare(b.username);
  });

  const filteredUsers = sortedUsers.filter(
    (user) => showVisitors || user.access !== "Visitor"
  );

  function onAccessChange(e, user_id) {
    const access = e.target.value;
    const userIndex = users.findIndex((user) => user.id === user_id);
    const updatedUsers = [...users];
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
        setMessage(`User ${updatedUsers[userIndex].username} updated to ${access}`);
      }
    });
  }

  function confirmDeleteUser(user) {
    setUserToDelete(user);
  }

  function deleteUser() {
    if (!userToDelete) return;

    fetch(`/api/users/delete`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userToDelete.id }),
    })
      .then((response) => {
        if (response.ok) {
          setUsers(users.filter((user) => user.id !== userToDelete.id));
          setMessage(`User ${userToDelete.username} has been deleted.`);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setUserToDelete(null));
  }

  return (
    <div>
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
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showVisitorsCheckbox"
                  checked={showVisitors}
                  onChange={(e) => setShowVisitors(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showVisitorsCheckbox">
                  Show Visitors
                </label>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Username</th>
                    <th scope="col">Visitor</th>
                    <th scope="col">Editor</th>
                    <th scope="col">Full Access</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
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
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmDeleteUser(user)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {userToDelete && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUserToDelete(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete user <strong>{userToDelete.username}</strong>? 
                  If they sign back in, they will be re-added with visitor access.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUserToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
