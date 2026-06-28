import React, { useState } from "react";

const EMPTY = { email: "", fullName: "", department: "" };

export default function ManualRecipientForm({ onSubmit, loading, submitLabel = "Add recipient" }) {
  const [form, setForm] = useState(EMPTY);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      department: form.department.trim(),
    };
    await onSubmit(payload);
    setForm(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-4">
        <label className="text-secondary small">Email *</label>
        <input
          type="email"
          className="form-control header-search-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="user@company.com"
          required
          disabled={loading}
        />
      </div>
      <div className="col-md-4">
        <label className="text-secondary small">Name</label>
        <input
          type="text"
          className="form-control header-search-input"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Jane Doe"
          disabled={loading}
        />
      </div>
      <div className="col-md-4">
        <label className="text-secondary small">Department</label>
        <input
          type="text"
          className="form-control header-search-input"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Engineering"
          disabled={loading}
        />
      </div>
      <div className="col-12">
        <button type="submit" className="btn add-btn text-white border-0" disabled={loading || !form.email.trim()}>
          {loading ? "Adding..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
