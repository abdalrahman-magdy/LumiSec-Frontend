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
  const { template, loading, createTemplate, updateTemplate } = useTemplates(isNew ? null : id);
  const [form, setForm] = useState({ name: "", subject: "", body: "", category: "credential" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) setForm({ name: template.name, subject: template.subject, body: template.body ?? "", category: template.category });
  }, [template]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const res = await createTemplate(form);
        navigate(`/Phishing/Templates/${res.data?.id ?? res.data?.template?.id}/edit`);
      } else {
        await updateTemplate(id, form);
      }
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
          <Link to="/Phishing/Templates" className="btn integration-btn">Back</Link>
        </div>
        <PhishingAlert type="danger" message={error} />

        <form onSubmit={handleSave} className="dashboard-card p-3">
          <div className="mb-3">
            <label className="text-secondary">Name</label>
            <input className="form-control header-search-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="text-secondary">Subject</label>
            <input className="form-control header-search-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="text-secondary">Category</label>
            <select className="form-select scanType-select border-0" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="credential">Credential</option>
              <option value="finance">Finance</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="text-secondary">HTML Body</label>
            <textarea className="form-control header-search-input" rows={12} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <button type="submit" className="btn add-btn text-white border-0" disabled={saving}>
            {saving ? "Saving..." : "Save Template"}
          </button>
        </form>
      </div>
    </RoleGate>
  );
}
