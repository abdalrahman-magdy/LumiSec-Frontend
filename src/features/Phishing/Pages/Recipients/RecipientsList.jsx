import React from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canManageRecipients } from "../../utils/roles";
import useRecipients from "../../hooks/useRecipients";
import "../../Components/Shared/PhishingShared.css";

export default function RecipientsList() {
  const { recipients, loading, error, isMock, search, setSearch, reload, deleteRecipient } = useRecipients();

  const handleDelete = async (id) => {
    await deleteRecipient(id);
    reload();
  };

  if (loading) return <PhishingLoading message="Loading recipients..." skeleton rows={5} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h5 className="text-white">Recipients</h5>
          <p className="dashboard-desc">{recipients.length} recipients</p>
        </div>
        <RoleGate allow={canManageRecipients}>
          <Link to="/Phishing/Recipients/import" className="btn integration-btn me-2">Import CSV</Link>
        </RoleGate>
      </div>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="search-container mb-3">
        <i className="fa-brands fa-sistrix discover-search-icon" />
        <input className="form-control header-search-input rounded-3" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="dashboard-card p-0">
        <table className="w-100 discover-tabel">
          <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Valid</th><th>Actions</th></tr></thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id}>
                <td className="text-white">{r.name}</td>
                <td>{r.email}</td>
                <td>{r.department}</td>
                <td>{r.valid ? <span className="phishing-risk-low px-2 rounded">Valid</span> : <span className="phishing-risk-high px-2 rounded">Invalid</span>}</td>
                <td>
                  <RoleGate allow={canManageRecipients}>
                    <button type="button" className="btn btn-sm integration-btn" onClick={() => handleDelete(r.id)}>Delete</button>
                  </RoleGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
