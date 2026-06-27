import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import useCampaigns from "../../hooks/useCampaigns";
import useTemplates from "../../hooks/useTemplates";
import useLandingPages from "../../hooks/useLandingPages";
import useRecipients from "../../hooks/useRecipients";
import RoleGate from "../../Components/Shared/RoleGate";
import { canCreateCampaigns } from "../../utils/roles";
import { extractCampaignId } from "../../utils/campaignStatus";
import "../../Components/Shared/PhishingShared.css";

const STEPS = ["Create", "Recipients", "Review"];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const { createCampaign, attachCampaignRecipients } = useCampaigns();
  const { templates } = useTemplates();
  const { pages } = useLandingPages();
  const { allRecipients } = useRecipients();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", templateId: "", landingPageId: "" });
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === form.templateId),
    [templates, form.templateId]
  );
  const selectedPage = useMemo(
    () => pages.find((p) => p.id === form.landingPageId),
    [pages, form.landingPageId]
  );

  const toggleRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!selectedRecipients.length) {
      setError("Select at least one recipient before creating the campaign.");
      setStep(1);
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await createCampaign(form);
      const id = extractCampaignId(res.data);
      if (!id) {
        throw new Error("Campaign was created but no ID was returned. Check the API response.");
      }

      const recipients = allRecipients
        .filter((recipient) => selectedRecipients.includes(recipient.id))
        .map((recipient) => ({
          email: recipient.email,
          fullName: recipient.name,
          department: recipient.department,
        }));

      try {
        await attachCampaignRecipients(id, recipients);
      } catch (attachErr) {
        setError(
          `Campaign created, but attaching recipients failed: ${attachErr.message}. Open the campaign to retry.`
        );
        navigate(`/Phishing/Campaigns/${id}`);
        return;
      }

      navigate("/Phishing/Campaigns");
    } catch (err) {
      setError(err.message ?? "Could not create campaign.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <RoleGate allow={canCreateCampaigns} fallback={<p className="text-danger p-3">Access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white mb-0">Create Campaign</h5>
          <Link to="/Phishing/Campaigns" className="btn phishing-outline-btn">Back to list</Link>
        </div>
        <PhishingAlert type="danger" message={error} />

        <div className="wizard-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`wizard-step ${i === step ? "active" : i < step ? "done" : ""}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="dashboard-card p-3">
            <div className="mb-3">
              <label className="text-secondary">Campaign Name</label>
              <input
                className="form-control header-search-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="text-secondary">Email Template</label>
              <select
                className="form-select scanType-select border-0"
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="text-secondary">Landing Page <span className="text-secondary">(optional)</span></label>
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
            <button
              type="button"
              className="btn add-btn text-white border-0"
              onClick={() => setStep(1)}
              disabled={!form.name.trim() || !form.templateId}
            >
              Next
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="dashboard-card p-3">
            <h6 className="text-white mb-3">Attach Recipients</h6>
            {allRecipients.length === 0 ? (
              <div className="text-secondary mb-3">
                No recipients available.{" "}
                <Link to="/Phishing/Recipients/import" className="text-white">Import a CSV</Link> first.
              </div>
            ) : (
              <>
                <p className="text-secondary small mb-2">
                  {selectedRecipients.length} of {allRecipients.length} selected
                </p>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {allRecipients.map((r) => (
                    <label key={r.id} className="d-flex align-items-center gap-2 mb-2 text-white">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(r.id)}
                        onChange={() => toggleRecipient(r.id)}
                      />
                      {r.name ? `${r.name} — ${r.email}` : r.email} ({r.department})
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="mt-3 d-flex gap-2">
              <button type="button" className="btn phishing-outline-btn" onClick={() => setStep(0)}>Back</button>
              <button
                type="button"
                className="btn add-btn text-white border-0"
                onClick={() => setStep(2)}
                disabled={!selectedRecipients.length}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="dashboard-card p-3">
            <h6 className="text-white mb-3">Review & Create</h6>
            <p className="text-secondary mb-1"><span className="text-white">Name:</span> {form.name}</p>
            <p className="text-secondary mb-1">
              <span className="text-white">Template:</span> {selectedTemplate?.name ?? "—"}
            </p>
            <p className="text-secondary mb-1">
              <span className="text-white">Landing page:</span> {selectedPage?.name ?? "None"}
            </p>
            <p className="text-secondary mb-3">
              <span className="text-white">Recipients:</span> {selectedRecipients.length}
            </p>
            <div className="d-flex gap-2">
              <button type="button" className="btn phishing-outline-btn" onClick={() => setStep(1)} disabled={creating}>
                Back
              </button>
              <button
                type="button"
                className="btn add-btn text-white border-0"
                onClick={handleCreate}
                disabled={creating || !selectedRecipients.length}
              >
                {creating ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  );
}
