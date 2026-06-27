import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canDeleteTemplates, canEditTemplates } from "../../utils/roles";
import useLandingPages from "../../hooks/useLandingPages";
import "../../Components/Shared/PhishingShared.css";

export default function LandingPagesList() {
  const { pages, loading, error, isMock, reload, deleteLandingPage } = useLandingPages();
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
      await deleteLandingPage(pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch (err) {
      setDeleteError(err.message ?? "Could not delete landing page.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PhishingLoading message="Loading landing pages..." skeleton rows={4} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h5 className="text-white">Landing Pages</h5>
          <p className="dashboard-desc">{pages.length} pages available</p>
        </div>
        <RoleGate allow={canEditTemplates}>
          <Link to="/Phishing/LandingPages/new/edit" className="btn add-btn text-white border-0">
            <i className="fa-solid fa-plus me-2" />Create Page
          </Link>
        </RoleGate>
      </div>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      {pages.length === 0 ? (
        <div className="dashboard-card p-4 text-center text-secondary">
          No landing pages yet. Create one to use in a campaign.
        </div>
      ) : (
        <div className="row g-3">
          {pages.map((p) => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="dashboard-card p-3 h-100 d-flex flex-column">
                <h6 className="text-white">{p.name}</h6>
                <p className="text-secondary small mb-1">{p.title}</p>
                {p.url ? (
                  <p className="text-secondary small text-truncate mb-3" title={p.url}>
                    Redirect: {p.url}
                  </p>
                ) : (
                  <p className="text-secondary small mb-3">No redirect URL</p>
                )}
                <div className="phishing-card-actions">
                  <Link to={`/Phishing/LandingPages/${p.id}/edit`} className="btn btn-sm grc-edit-btn phishing-card-action-btn">
                    Edit
                  </Link>
                  <RoleGate allow={canDeleteTemplates}>
                    <button
                      type="button"
                      className="btn btn-sm phishing-delete-btn phishing-card-action-btn"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(p);
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
        title="Delete landing page?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. Campaigns using this page may need a different landing page assigned.`
            : ""
        }
        confirmLabel="Delete page"
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
