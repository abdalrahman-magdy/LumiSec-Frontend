import React from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canEditTemplates } from "../../utils/roles";
import useTemplates from "../../hooks/useTemplates";
import "../../Components/Shared/PhishingShared.css";

export default function TemplatesList() {
  const { templates, loading, error, isMock, reload, deleteTemplate } = useTemplates();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await deleteTemplate(id);
    reload();
  };

  if (loading) return <PhishingLoading message="Loading templates..." skeleton rows={4} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h5 className="text-white">Email Templates</h5>
          <p className="dashboard-desc">{templates.length} templates available</p>
        </div>
        <RoleGate allow={canEditTemplates}>
          <Link to="/Phishing/Templates/new/edit" className="btn add-btn text-white border-0">
            <i className="fa-solid fa-plus me-2" />Create Template
          </Link>
        </RoleGate>
      </div>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="row g-3">
        {templates.map((t) => (
          <div key={t.id} className="col-md-6 col-lg-4">
            <div className="dashboard-card p-3 h-100">
              <h6 className="text-white">{t.name}</h6>
              <p className="text-secondary small">{t.subject}</p>
              <span className="badge mb-2">{t.category}</span>
              <div className="d-flex gap-2">
                <Link to={`/Phishing/Templates/${t.id}/edit`} className="btn btn-sm integration-btn">Edit</Link>
                <RoleGate allow={canEditTemplates}>
                  <button type="button" className="btn btn-sm integration-btn text-danger" onClick={() => handleDelete(t.id)}>Delete</button>
                </RoleGate>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
