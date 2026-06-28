import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canCreateCampaigns, canDeleteRecipients, canManageCampaigns } from "../../utils/roles";
import { canEditCampaignMetadata, canRemoveRecipient } from "../../utils/campaignStatus";
import ManualRecipientForm from "../../Components/Shared/ManualRecipientForm";
import { attachCampaignRecipients, updateCampaign } from "../../services/phishingApi";
import useCampaignRecipients from "../../hooks/useCampaignRecipients";
import useRecipients from "../../hooks/useRecipients";
import useTemplates from "../../hooks/useTemplates";
import useLandingPages from "../../hooks/useLandingPages";
import "../../Components/Shared/PhishingShared.css";

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
  const [addMode, setAddMode] = useState("manual");
  const [form, setForm] = useState({
    name: campaign?.name ?? "",
    templateId: campaign?.templateId ?? "",
    landingPageId: campaign?.landingPageId ?? "",
  });
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
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

  const removableRecipients = useMemo(
    () => campaignRecipients.filter((r) => canRemoveRecipient(r, status)),
    [campaignRecipients, status]
  );

  const toggleRemoveSelection = (id) => {
    setSelectedToRemove((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleRemoveAll = () => {
    if (selectedToRemove.length === removableRecipients.length) {
      setSelectedToRemove([]);
    } else {
      setSelectedToRemove(removableRecipients.map((r) => r.id));
    }
  };

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

  const handleAddManualRecipient = async (recipient) => {
    if (campaignEmails.has(recipient.email.toLowerCase())) {
      setError(`${recipient.email} is already on this campaign.`);
      return;
    }
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await attachCampaignRecipients(campaignId, [recipient]);
      const added = res.data?.added ?? 1;
      const queued = res.data?.queued ?? 0;
      if (!added) {
        setError(`${recipient.email} is already on this campaign.`);
        return;
      }
      setSuccess(
        queued
          ? `Added ${recipient.email} — email queued for delivery.`
          : `Added ${recipient.email} to the campaign.`
      );
      await reloadRecipients();
      await onUpdated?.();
      clearFeedback();
    } catch (err) {
      setError(err.message ?? "Could not add recipient.");
    } finally {
      setAdding(false);
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
      const res = await attachCampaignRecipients(campaignId, toAttach);
      const queued = res.data?.queued ?? 0;
      setSuccess(
        queued
          ? `Added ${toAttach.length} recipient${toAttach.length === 1 ? "" : "s"} — ${queued} email${queued === 1 ? "" : "s"} queued for delivery.`
          : `Added ${toAttach.length} recipient${toAttach.length === 1 ? "" : "s"} to the campaign.`
      );
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
    const targets = Array.isArray(pendingRemove) ? pendingRemove : [pendingRemove];
    setRemoving(true);
    setError(null);
    try {
      for (const recipient of targets) {
        await removeRecipient(recipient.id);
      }
      const label = targets.length === 1
        ? targets[0].email
        : `${targets.length} recipients`;
      setSuccess(`Removed ${label} from the campaign.`);
      setPendingRemove(null);
      setSelectedToRemove([]);
      await onUpdated?.();
      clearFeedback();
    } catch (err) {
      setError(err.message ?? "Could not remove recipient.");
    } finally {
      setRemoving(false);
    }
  };

  const startBulkRemove = () => {
    const targets = campaignRecipients.filter((r) => selectedToRemove.includes(r.id));
    if (!targets.length) return;
    setPendingRemove(targets);
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
          <div className="phishing-segment-group mb-3">
            <button
              type="button"
              className={`btn btn-sm phishing-segment-btn ${addMode === "manual" ? "active" : ""}`}
              onClick={() => setAddMode("manual")}
            >
              Add manually
            </button>
            <button
              type="button"
              className={`btn btn-sm phishing-segment-btn ${addMode === "pool" ? "active" : ""}`}
              onClick={() => setAddMode("pool")}
            >
              From existing list
            </button>
            <Link
              to={`/Phishing/Recipients/import?campaignId=${campaignId}`}
              className="btn btn-sm phishing-outline-btn"
            >
              Import CSV
            </Link>
          </div>

          {addMode === "manual" ? (
            <>
              <p className="text-secondary small mb-3">
                Enter recipient details below. You can add one at a time before launch.
              </p>
              <ManualRecipientForm
                onSubmit={handleAddManualRecipient}
                loading={adding}
                submitLabel="Add to campaign"
              />
            </>
          ) : (
            <>
              <p className="text-secondary small mb-2">
                Select recipients from the global pool to attach to this campaign.
              </p>
              {availableToAdd.length === 0 ? (
                <p className="text-secondary mb-0">
                  No available recipients in the global list.{" "}
                  <button type="button" className="btn btn-link text-white p-0 align-baseline" onClick={() => setAddMode("manual")}>
                    Add manually
                  </button>{" "}
                  or{" "}
                  <Link to={`/Phishing/Recipients/import?campaignId=${campaignId}`} className="text-white">
                    import CSV
                  </Link>.
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
            </>
          )}
        </div>
      )}

      <div className="border-top border-secondary pt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <h6 className="text-white mb-0">
            Campaign recipients ({recipientTotal || campaignRecipients.length})
          </h6>
          <RoleGate allow={canDeleteRecipients}>
            {removableRecipients.length > 0 && (
              <button
                type="button"
                className="btn btn-sm phishing-delete-btn"
                disabled={!selectedToRemove.length || removing}
                onClick={startBulkRemove}
              >
                Remove selected ({selectedToRemove.length})
              </button>
            )}
          </RoleGate>
        </div>
        {removableRecipients.length === 0 && campaignRecipients.length > 0 && (
          <p className="text-secondary small mb-2">
            Recipients who already received an email cannot be removed from this campaign.
          </p>
        )}
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
                    {removableRecipients.length > 0 && (
                      <th style={{ width: 36 }}>
                        <RoleGate allow={canDeleteRecipients}>
                          <input
                            type="checkbox"
                            aria-label="Select all removable recipients"
                            checked={
                              removableRecipients.length > 0
                              && selectedToRemove.length === removableRecipients.length
                            }
                            onChange={toggleRemoveAll}
                          />
                        </RoleGate>
                      </th>
                    )}
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignRecipients.map((r) => {
                    const removable = canRemoveRecipient(r, status);
                    return (
                    <tr key={r.id}>
                      {removableRecipients.length > 0 && (
                        <td>
                          {removable ? (
                            <RoleGate allow={canDeleteRecipients}>
                              <input
                                type="checkbox"
                                aria-label={`Select ${r.email}`}
                                checked={selectedToRemove.includes(r.id)}
                                onChange={() => toggleRemoveSelection(r.id)}
                              />
                            </RoleGate>
                          ) : null}
                        </td>
                      )}
                      <td className="text-white">{r.name || "—"}</td>
                      <td>{r.email}</td>
                      <td>{r.department}</td>
                      <td><span className="text-capitalize">{r.status ?? "pending"}</span></td>
                      <td>
                        <RoleGate allow={canDeleteRecipients}>
                          {removable ? (
                            <button
                              type="button"
                              className="btn btn-sm phishing-delete-btn"
                              onClick={() => setPendingRemove(r)}
                            >
                              Remove
                            </button>
                          ) : (
                            <span
                              className="text-secondary small"
                              title="Email already sent — cannot remove"
                            >
                              —
                            </span>
                          )}
                        </RoleGate>
                      </td>
                    </tr>
                    );
                  })}
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
        title={
          Array.isArray(pendingRemove) && pendingRemove.length > 1
            ? `Remove ${pendingRemove.length} recipients?`
            : "Remove recipient?"
        }
        message={
          pendingRemove
            ? Array.isArray(pendingRemove)
              ? `Remove ${pendingRemove.length} recipients from this campaign? They will not receive emails from this campaign.`
              : `Remove ${pendingRemove.email} from this campaign? They will not receive emails from this campaign.`
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
