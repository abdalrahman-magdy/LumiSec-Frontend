import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./UserManagementModal.css";

export const GRC_TEAM_ROLES = [
  "admin",
  "grc_manager",
  "auditor",
  "compliance_manager",
  "it_manager",
  "assignee",
  "soc_manager",
  "soc_analyst",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "grc_manager",
  department: "",
};

export default function AddUserModal({
  show = false,
  onClose,
  onCreate,
  savingLabel = "Creating...",
  submitLabel = "Add User",
}) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return undefined;

    setForm(initialForm);
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
  }, [show, onClose]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onCreate) return;

    setSaving(true);
    setError(null);
    try {
      await onCreate({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim() || undefined,
      });
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show grc-user-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal fade show d-block grc-user-modal" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title text-white">Add User</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body border-0">
                {error && <p className="text-danger mb-3">{error}</p>}

                <label htmlFor="UserName" className="d-block mb-2">Full Name</label>
                <input
                  id="UserName"
                  className="form-control border-0 mb-4"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Jane Analyst"
                  required
                />

                <label htmlFor="UserEmail" className="d-block mb-2">Email</label>
                <input
                  id="UserEmail"
                  type="email"
                  className="form-control border-0 mb-4"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="jane@company.com"
                  required
                />

                <label htmlFor="UserPassword" className="d-block mb-2">Temporary Password</label>
                <input
                  id="UserPassword"
                  type="password"
                  className="form-control border-0 mb-4"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />

                <label htmlFor="UserRole" className="d-block mb-2">Role</label>
                <select
                  id="UserRole"
                  className="form-select bg-dark text-white border-0 mb-4"
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                >
                  {GRC_TEAM_ROLES.map((role) => (
                    <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                  ))}
                </select>

                <label htmlFor="UserDepartment" className="d-block mb-2">Department (optional)</label>
                <input
                  id="UserDepartment"
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
