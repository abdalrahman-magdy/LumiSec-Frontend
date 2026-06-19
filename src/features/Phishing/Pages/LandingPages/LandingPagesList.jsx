import React from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canEditTemplates } from "../../utils/roles";
import useLandingPages from "../../hooks/useLandingPages";
import "../../Components/Shared/PhishingShared.css";

export default function LandingPagesList() {
  const { pages, loading, error, isMock, reload, deleteLandingPage } = useLandingPages();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete landing page?")) return;
    await deleteLandingPage(id);
    reload();
  };

  if (loading) return <PhishingLoading message="Loading landing pages..." />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="text-white">Landing Pages</h5>
        <RoleGate allow={canEditTemplates}>
          <Link to="/Phishing/LandingPages/new/edit" className="btn add-btn text-white border-0">Create Page</Link>
        </RoleGate>
      </div>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="dashboard-card p-0">
        <table className="w-100 discover-tabel">
          <thead><tr><th>Name</th><th>URL</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="text-white">{p.name}</td>
                <td className="text-secondary">{p.url}</td>
                <td>{p.category}</td>
                <td>
                  <Link to={`/Phishing/LandingPages/${p.id}/edit`} className="btn btn-sm integration-btn me-1">Edit</Link>
                  <RoleGate allow={canEditTemplates}>
                    <button type="button" className="btn btn-sm integration-btn" onClick={() => handleDelete(p.id)}>Delete</button>
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
