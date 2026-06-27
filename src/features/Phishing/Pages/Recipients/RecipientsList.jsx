import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canDeleteRecipients, canManageRecipients } from "../../utils/roles";
import useRecipients from "../../hooks/useRecipients";
import "../../Components/Shared/PhishingShared.css";

function statusBadge(status) {
  const label = (status ?? "pending").replace(/_/g, " ");
  const classMap = {
    pending: "phishing-risk-low",
    sent: "phishing-risk-low",
    opened: "phishing-risk-medium",
    clicked: "phishing-risk-high",
    submitted: "phishing-risk-high",
    bounced: "phishing-risk-high",
  };
  const cls = classMap[status] ?? "phishing-risk-low";
  return <span className={`${cls} px-2 rounded text-capitalize`}>{label}</span>;
}

export default function RecipientsList() {
  const {
    recipients,
    allRecipients,
    loading,
    error,
    isMock,
    search,
    setSearch,
    reload,
    deleteRecipient,
  } = useRecipients();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const totalCount = allRecipients.length;
  const showingFiltered = Boolean(search.trim());

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
      await deleteRecipient(pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch (err) {
      setDeleteError(err.message ?? "Could not delete recipient.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PhishingLoading message="Loading recipients..." skeleton rows={5} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h5 className="text-white">Recipients</h5>
          <p className="dashboard-desc">
            {showingFiltered
              ? `${recipients.length} of ${totalCount} recipients`
              : `${totalCount} recipient${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <RoleGate allow={canManageRecipients}>
          <Link to="/Phishing/Recipients/import" className="btn add-btn text-white border-0">
            <i className="fa-solid fa-file-csv me-2" />
            Import CSV
          </Link>
        </RoleGate>
      </div>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="search-container mb-3">
        <i className="fa-brands fa-sistrix discover-search-icon" />
        <input
          className="form-control header-search-input rounded-3"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {totalCount === 0 ? (
        <div className="dashboard-card p-4 text-center text-secondary">
          No recipients yet.{" "}
          <RoleGate allow={canManageRecipients}>
            <Link to="/Phishing/Recipients/import" className="text-white">
              Import a CSV
            </Link>
          </RoleGate>{" "}
          to get started.
        </div>
      ) : recipients.length === 0 ? (
        <div className="dashboard-card p-4 text-center text-secondary">
          No recipients match your search.
        </div>
      ) : (
        <div className="dashboard-card p-0">
          <table className="w-100 discover-tabel">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id}>
                  <td className="text-white">{r.name || "—"}</td>
                  <td>{r.email}</td>
                  <td>{r.department}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    <RoleGate allow={canDeleteRecipients}>
                      <button
                        type="button"
                        className="btn btn-sm phishing-delete-btn"
                        onClick={() => setPendingDelete(r)}
                      >
                        Delete
                      </button>
                    </RoleGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PhishingConfirmModal
        show={Boolean(pendingDelete)}
        title="Delete recipient?"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.email} from the recipient list? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
