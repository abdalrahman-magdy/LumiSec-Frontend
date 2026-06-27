import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canEditTemplates } from "../../utils/roles";
import useTemplates from "../../hooks/useTemplates";
import "../../Components/Shared/PhishingShared.css";

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { template, loading, error: loadError, isMock, createTemplate, updateTemplate } = useTemplates(isNew ? null : id);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    htmlBody: "",
    textBody: "",
    category: "credential",
    language: "en",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name ?? "",
        subject: template.subject ?? "",
        htmlBody: template.raw?.htmlBody ?? template.body ?? "",
        textBody: template.raw?.textBody ?? "",
        category: template.category ?? "general",
        language: template.raw?.language ?? "en",
      });
    }
  }, [template]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createTemplate(form);
      } else {
        await updateTemplate(id, form);
      }
      navigate("/Phishing/Templates");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isNew) return <PhishingLoading message="Loading template..." />;

  return (
    <RoleGate allow={canEditTemplates} fallback={<p className="text-danger p-3">Template edit access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="text-white">{isNew ? "Create Template" : "Edit Template"}</h5>
          <Link to="/Phishing/Templates" className="btn phishing-outline-btn">Back</Link>
        </div>
        <PhishingAlert type="danger" message={error || loadError} isMock={isMock} />

        <form onSubmit={handleSave} className="dashboard-card p-3">
          <div className="mb-3">
            <label className="text-secondary">Name</label>
            <input className="form-control header-search-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
          </div>
          <div className="mb-3">
            <label className="text-secondary">Subject</label>
            <input className="form-control header-search-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="text-secondary">Category</label>
            <select className="form-select scanType-select border-0" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="credential">Credential</option>
              <option value="finance">Finance</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="text-secondary">Language</label>
            <input className="form-control header-search-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="en" />
          </div>
          <div className="mb-3">
            <label className="text-secondary">HTML Body</label>
            <p className="text-secondary small mb-1">
              Optional placeholders: {"{{firstName}}"}, {"{{email}}"}, {"{{landing_url}}"} (auto-added if omitted)
            </p>
            <textarea className="form-control header-search-input" rows={12} value={form.htmlBody} onChange={(e) => setForm({ ...form, htmlBody: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="text-secondary">Plain-text Body (optional)</label>
            <textarea className="form-control header-search-input" rows={5} value={form.textBody} onChange={(e) => setForm({ ...form, textBody: e.target.value })} />
          </div>
          <button type="submit" className="btn add-btn text-white border-0" disabled={saving}>
            {saving ? "Saving..." : "Save Template"}
          </button>
        </form>
      </div>
    </RoleGate>
  );
}
