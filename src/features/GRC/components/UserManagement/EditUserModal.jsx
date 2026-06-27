import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./UserManagementModal.css";
import { GRC_TEAM_ROLES } from "./AddUserModal";

const USER_STATUSES = ["active", "inactive", "suspended"];

function getUserId(user) {
  return user?._id ?? user?.id;
}

export default function EditUserModal({
  show = false,
  onClose,
  user = null,
  onUpdate,
  savingLabel = "Saving...",
  submitLabel = "Save User",
}) {
  const [form, setForm] = useState({ name: "", role: "grc_manager", status: "active", department: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show || !user) return undefined;

    setForm({
      name: user.name ?? "",
      role: user.role ?? "grc_manager",
      status: user.status ?? "active",
      department: user.department ?? "",
    });
    setError(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [show, user, onClose]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onUpdate || !user) return;

    setSaving(true);
    setError(null);
    try {
      await onUpdate(getUserId(user), {
        name: form.name.trim(),
        role: form.role,
        status: form.status,
        department: form.department.trim(),
      });
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (!show || !user) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show grc-user-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal fade show d-block grc-user-modal" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title text-white">Edit User</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body border-0">
                {error && <p className="text-danger mb-3">{error}</p>}

                <p className="text-white-50 small mb-3">{user.email}</p>

                <label htmlFor="EditUserName" className="d-block mb-2">Full Name</label>
                <input
                  id="EditUserName"
                  className="form-control border-0 mb-4"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />

                <label htmlFor="EditUserRole" className="d-block mb-2">Role</label>
                <select
                  id="EditUserRole"
                  className="form-select bg-dark text-white border-0 mb-4"
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                >
                  {GRC_TEAM_ROLES.map((role) => (
                    <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                  ))}
                </select>

                <label htmlFor="EditUserStatus" className="d-block mb-2">Status</label>
                <select
                  id="EditUserStatus"
                  className="form-select bg-dark text-white border-0 mb-4"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {USER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <label htmlFor="EditUserDepartment" className="d-block mb-2">Department</label>
                <input
                  id="EditUserDepartment"
                  className="form-control border-0"
                  value={form.department}
                  onChange={(event) => updateField("department", event.target.value)}
                  placeholder="GRC / IT / SOC"
                />
              </div>

              <div className="modal-footer border-0">
                <button type="button" className="btn import-btn border-0 btn-primary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn add-btn text-white border-0" type="submit" disabled={saving}>
                  {saving ? savingLabel : submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
