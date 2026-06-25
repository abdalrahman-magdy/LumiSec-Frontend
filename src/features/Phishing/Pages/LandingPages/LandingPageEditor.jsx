import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canEditTemplates } from "../../utils/roles";
import useLandingPages from "../../hooks/useLandingPages";
import "../../Components/Shared/PhishingShared.css";

export default function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { page, loading, createLandingPage, updateLandingPage } = useLandingPages(isNew ? null : id);
  const [form, setForm] = useState({ name: "", title: "", redirectUrl: "", htmlContent: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setForm({
        name: page.name ?? "",
        title: page.title ?? page.name ?? "",
        redirectUrl: page.raw?.redirectUrl ?? page.url ?? "",
        htmlContent: page.raw?.htmlContent ?? page.html ?? "",
      });
    }
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isNew) {
        const res = await createLandingPage(form);
        const nextId = res.data?._id ?? res.data?.id ?? res.data?.page?._id ?? res.data?.page?.id;
        if (!nextId) throw new Error("Landing page created but no id was returned.");
        navigate(`/Phishing/LandingPages/${nextId}/edit`);
      } else {
        await updateLandingPage(id, form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isNew) return <PhishingLoading message="Loading landing page..." />;

  return (
    <RoleGate allow={canEditTemplates} fallback={<p className="text-danger p-3">Access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="text-white">{isNew ? "Create Landing Page" : "Edit Landing Page"}</h5>
          <Link to="/Phishing/LandingPages" className="btn integration-btn">Back</Link>
        </div>
        <PhishingAlert type="danger" message={error} />
        <form onSubmit={handleSave} className="dashboard-card p-3">
          <div className="mb-3"><label className="text-secondary">Name</label><input className="form-control header-search-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="mb-3"><label className="text-secondary">Title</label><input className="form-control header-search-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="mb-3"><label className="text-secondary">Redirect URL</label><input className="form-control header-search-input" value={form.redirectUrl} onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })} placeholder="https://example.com/after-training" /></div>
          <div className="mb-3"><label className="text-secondary">HTML Content</label><textarea className="form-control header-search-input" rows={14} value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} required /></div>
          <button type="submit" className="btn add-btn text-white border-0" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </RoleGate>
  );
}
