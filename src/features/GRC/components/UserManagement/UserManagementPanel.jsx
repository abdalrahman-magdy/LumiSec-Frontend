import React, { useState } from "react";
import "../RemedationTabel/RemedationTabel.css";
import "./UserManagementPanel.css";
import useGrcUserManagement from "../../hooks/useGrcUserManagement";
import { useAuth } from "../../../auth/context/AuthContext";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";

function statusClass(status) {
  if (status === "active") return "green";
  if (status === "suspended") return "high";
  return "meduim";
}

export default function UserManagementPanel() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const { users, loading, error, createUser, updateUser } = useGrcUserManagement({
    limit: 50,
    sort: "-createdAt",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  if (error?.status === 403) {
    return (
      <p className="text-white-50">
        You do not have permission to manage users. Sign in as an admin or GRC manager.
      </p>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-white h4 mb-1">Team Users</h2>
          <p className="text-white-50 mb-0 small">
            Manage GRC team accounts, roles, and access status.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn add-btn text-white border-0"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fa-solid fa-user-plus me-2" aria-hidden="true"></i>
            Add User
          </button>
        )}
      </div>

      {loading && <p className="text-white">Loading users...</p>}
      {!loading && error && (
        <p className="text-danger">{error.message || "Failed to load users"}</p>
      )}

      {!loading && !error && (
        <div className="rounded-3 overflow-hidden user-management-table">
          <table className="w-100 RemedationTabel">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user._id ?? user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="text-capitalize">{String(user.role || "").replaceAll("_", " ")}</td>
                  <td>{user.department || "—"}</td>
                  <td className={`risk-td ${statusClass(user.status)} p-0`}>
                    <p className="text-capitalize mb-0">{user.status || "active"}</p>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm grc-edit-btn"
                      onClick={() => setEditUser(user)}
                    >
                      <i className="fa-solid fa-pen-to-square me-1" aria-hidden="true"></i>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <AddUserModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreate={createUser}
        />
      )}

      <EditUserModal
        show={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        user={editUser}
        onUpdate={updateUser}
      />
    </>
  );
}
