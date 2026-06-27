import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canCreateCampaigns, canDeleteRecipients, canManageCampaigns } from "../../utils/roles";
import { canEditCampaignMetadata } from "../../utils/campaignStatus";
import { updateCampaign, attachCampaignRecipients } from "../../services/phishingApi";
import useCampaignRecipients from "../../hooks/useCampaignRecipients";
import useRecipients from "../../hooks/useRecipients";
import useTemplates from "../../hooks/useTemplates";
import useLandingPages from "../../hooks/useLandingPages";
import "../../Components/Shared/PhishingShared.css";

function canRemoveRecipient(recipient, campaignStatus) {
  const rStatus = (recipient.status ?? "pending").toLowerCase();
  const cStatus = (campaignStatus ?? "draft").toLowerCase();
  if (rStatus !== "pending") return false;
  return ["draft", "scheduled", "paused", "cancelled"].includes(cStatus);
}

export default function CampaignManagePanel({ campaign, onUpdated }) {
  const campaignId = campaign?.id;
  const status = campaign?.status;
  const canEditMeta = canEditCampaignMetadata(status) && canManageCampaigns();
  const canManageRecipients = canCreateCampaigns();

  const { templates } = useTemplates();
  const { pages } = useLandingPages();
  const { allRecipients } = useRecipients();
  const {
    recipients: campaignRecipients,
    total: recipientTotal,
    page,
    totalPages,
    loading: recipientsLoading,
    reload: reloadRecipients,
    goToPage,
    removeRecipient,
  } = useCampaignRecipients(campaignId);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: campaign?.name ?? "",
    templateId: campaign?.templateId ?? "",
    landingPageId: campaign?.landingPageId ?? "",
  });
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setForm({
      name: campaign?.name ?? "",
      templateId: campaign?.templateId ?? "",
      landingPageId: campaign?.landingPageId ?? "",
    });
  }, [campaign]);

  const campaignEmails = useMemo(
    () => new Set(campaignRecipients.map((r) => r.email.toLowerCase())),
    [campaignRecipients]
  );

  const availableToAdd = useMemo(
    () => allRecipients.filter((r) => !campaignEmails.has(r.email.toLowerCase())),
    [allRecipients, campaignEmails]
  );

  const toggleAdd = (id) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFeedback = () => {
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 4000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!canEditMeta) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCampaign(campaignId, form);
      setSuccess("Campaign settings saved.");
      setEditOpen(false);
      await onUpdated?.();
      clearFeedback();
    } catch (err) {
      setError(err.message ?? "Could not save campaign.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecipients = async () => {
    if (!selectedToAdd.length) {
      setError("Select at least one recipient to add.");
      return;
    }
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const toAttach = allRecipients
        .filter((r) => selectedToAdd.includes(r.id))
        .filter((r) => !campaignEmails.has(r.email.toLowerCase()))
        .map((r) => ({
          email: r.email,
          fullName: r.name,
          department: r.department,
        }));
      if (!toAttach.length) {
        setError("Selected recipients are already on this campaign.");
        return;
      }
      await attachCampaignRecipients(campaignId, toAttach);
      setSuccess(`Added ${toAttach.length} recipient${toAttach.length === 1 ? "" : "s"} to the campaign.`);
      setSelectedToAdd([]);
      setAddOpen(false);
      await reloadRecipients();
      await onUpdated?.();
      clearFeedback();
    } catch (err) {
      setError(err.message ?? "Could not add recipients.");
    } finally {
      setAdding(false);
    }
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    setRemoving(true);
    setError(null);
    try {
      await removeRecipient(pendingRemove.id);
      setSuccess(`Removed ${pendingRemove.email} from the campaign.`);
      setPendingRemove(null);
      await onUpdated?.();
      clearFeedback();
    } catch (err) {
      setError(err.message ?? "Could not remove recipient.");
    } finally {
      setRemoving(false);
    }
  };

  if (!canEditMeta && !canManageRecipients) return null;

  return (
    <div className="dashboard-card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="text-white mb-0">Campaign settings & recipients</h6>
        <div className="d-flex gap-2 flex-wrap">
          <RoleGate allow={canManageCampaigns}>
            {canEditMeta && (
              <button
                type="button"
                className="btn btn-sm phishing-campaign-action phishing-action-details"
                onClick={() => setEditOpen((o) => !o)}
              >
                <i className="fa-solid fa-pen me-1" />
                {editOpen ? "Close edit" : "Edit settings"}
              </button>
            )}
          </RoleGate>
          <RoleGate allow={canCreateCampaigns}>
            <button
              type="button"
              className="btn btn-sm phishing-campaign-action phishing-action-launch"
              onClick={() => setAddOpen((o) => !o)}
            >
              <i className="fa-solid fa-user-plus me-1" />
              {addOpen ? "Close add" : "Add recipients"}
            </button>
          </RoleGate>
        </div>
      </div>

      <PhishingAlert type="danger" message={error} />
      <PhishingAlert type="success" message={success} />

      {!canEditMeta && canManageRecipients && (
        <p className="text-secondary small mb-3">
          This campaign is {status} — settings cannot be changed, but you can still add recipients before launch.
        </p>
      )}

      {editOpen && canEditMeta && (
        <form onSubmit={handleSaveSettings} className="border-top border-secondary pt-3 mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="text-secondary">Campaign name</label>
              <input
                className="form-control header-search-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="text-secondary">Email template</label>
              <select
                className="form-select scanType-select border-0"
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                required
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="text-secondary">Landing page</label>
              <select
                className="form-select scanType-select border-0"
                value={form.landingPageId}
                onChange={(e) => setForm({ ...form, landingPageId: e.target.value })}
              >
                <option value="">None</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn add-btn text-white border-0" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </button>
            <button type="button" className="btn phishing-outline-btn" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {addOpen && canManageRecipients && (
        <div className="border-top border-secondary pt-3 mb-3">
          <p className="text-secondary small mb-2">
            Select recipients from the global pool to attach to this campaign.
            {" "}
            <Link to={`/Phishing/Recipients/import?campaignId=${campaignId}`} className="text-white">
              Import CSV to this campaign
            </Link>
          </p>
          {availableToAdd.length === 0 ? (
            <p className="text-secondary mb-0">
              No available recipients.{" "}
              <Link to="/Phishing/Recipients/import" className="text-white">Import more</Link> first.
            </p>
          ) : (
            <>
              <p className="text-secondary small mb-2">{selectedToAdd.length} selected</p>
              <div style={{ maxHeight: 220, overflowY: "auto" }} className="mb-3">
                {availableToAdd.map((r) => (
                  <label key={r.id} className="d-flex align-items-center gap-2 mb-2 text-white">
                    <input
                      type="checkbox"
                      checked={selectedToAdd.includes(r.id)}
                      onChange={() => toggleAdd(r.id)}
                    />
                    {r.name ? `${r.name} — ${r.email}` : r.email} ({r.department})
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="btn add-btn text-white border-0"
                disabled={adding || !selectedToAdd.length}
                onClick={handleAddRecipients}
              >
                {adding ? "Adding..." : `Add ${selectedToAdd.length || ""} recipient${selectedToAdd.length === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      )}

      <div className="border-top border-secondary pt-3">
        <h6 className="text-white mb-2">
          Campaign recipients ({recipientTotal || campaignRecipients.length})
        </h6>
        {recipientsLoading ? (
          <PhishingLoading message="Loading recipients..." skeleton rows={3} />
        ) : campaignRecipients.length === 0 ? (
          <p className="text-secondary mb-0">No recipients on this campaign yet.</p>
        ) : (
          <>
            <div className="table-responsive">
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
                  {campaignRecipients.map((r) => (
                    <tr key={r.id}>
                      <td className="text-white">{r.name || "—"}</td>
                      <td>{r.email}</td>
                      <td>{r.department}</td>
                      <td><span className="text-capitalize">{r.status ?? "pending"}</span></td>
                      <td>
                        <RoleGate allow={canDeleteRecipients}>
                          {canRemoveRecipient(r, status) && (
                            <button
                              type="button"
                              className="btn btn-sm phishing-delete-btn"
                              onClick={() => setPendingRemove(r)}
                            >
                              Remove
                            </button>
                          )}
                        </RoleGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-secondary small">Page {page} of {totalPages}</span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm phishing-outline-btn"
                    disabled={page <= 1 || recipientsLoading}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm phishing-outline-btn"
                    disabled={page >= totalPages || recipientsLoading}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PhishingConfirmModal
        show={Boolean(pendingRemove)}
        title="Remove recipient?"
        message={
          pendingRemove
            ? `Remove ${pendingRemove.email} from this campaign? They will not receive emails from this campaign.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onClose={() => !removing && setPendingRemove(null)}
        loading={removing}
      />
    </div>
  );
}
