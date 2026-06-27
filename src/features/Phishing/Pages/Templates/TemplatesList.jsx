import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canDeleteTemplates, canEditTemplates } from "../../utils/roles";
import useTemplates from "../../hooks/useTemplates";
import "../../Components/Shared/PhishingShared.css";

export default function TemplatesList() {
  const { templates, loading, error, isMock, reload, deleteTemplate } = useTemplates();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const closeDeleteModal = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTemplate(pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch (err) {
      setDeleteError(err.message ?? "Could not delete template.");
    } finally {
      setDeleting(false);
    }
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

      {templates.length === 0 ? (
        <div className="dashboard-card p-4 text-center text-secondary">
          No templates yet. Create one to use in a campaign.
        </div>
      ) : (
        <div className="row g-3">
          {templates.map((t) => (
            <div key={t.id} className="col-md-6 col-lg-4">
              <div className="dashboard-card p-3 h-100 d-flex flex-column">
                <h6 className="text-white">{t.name}</h6>
                <p className="text-secondary small">{t.subject}</p>
                {t.category && <span className="badge mb-3">{t.category}</span>}
                {!t.category && <div className="mb-3" />}
                <div className="phishing-card-actions">
                  <Link to={`/Phishing/Templates/${t.id}/edit`} className="btn btn-sm grc-edit-btn phishing-card-action-btn">
                    Edit
                  </Link>
                  <RoleGate allow={canDeleteTemplates}>
                    <button
                      type="button"
                      className="btn btn-sm phishing-delete-btn phishing-card-action-btn"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(t);
                      }}
                    >
                      Delete
                    </button>
                  </RoleGate>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PhishingConfirmModal
        show={Boolean(pendingDelete)}
        title="Delete template?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. Campaigns that reference it may fail until you assign a different template.`
            : ""
        }
        confirmLabel="Delete template"
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
