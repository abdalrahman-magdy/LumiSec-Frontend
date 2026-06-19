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
  const [form, setForm] = useState({ name: "", url: "", html: "", category: "credential" });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (page) setForm({ name: page.name, url: page.url, html: page.html ?? "", category: page.category });
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isNew) {
        const res = await createLandingPage(form);
        navigate(`/Phishing/LandingPages/${res.data?.id}/edit`);
      } else {
        await updateLandingPage(id, form);
      }
    } catch (err) {
      setError(err.message);
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
          <div className="mb-3"><label className="text-secondary">URL Path</label><input className="form-control header-search-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/lp/example" /></div>
          <div className="mb-3"><label className="text-secondary">HTML Content</label><textarea className="form-control header-search-input" rows={14} value={form.html} onChange={(e) => setForm({ ...form, html: e.target.value })} /></div>
          <button type="submit" className="btn add-btn text-white border-0">Save</button>
        </form>
      </div>
    </RoleGate>
  );
}
