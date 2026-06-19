import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import RoleGate from "../../Components/Shared/RoleGate";
import { canManageRecipients } from "../../utils/roles";
import useRecipients from "../../hooks/useRecipients";
import "../../Components/Shared/PhishingShared.css";

export default function ImportRecipients() {
  const { importCsv } = useRecipients();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await importCsv(file);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGate allow={canManageRecipients} fallback={<p className="text-danger p-3">Import access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="text-white">Import Recipients (CSV)</h5>
          <Link to="/Phishing/Recipients" className="btn integration-btn">Back</Link>
        </div>
        <PhishingAlert type="danger" message={error} />
        {success && <PhishingAlert type="success" message="Recipients imported successfully." />}

        <form onSubmit={handleImport} className="dashboard-card p-4">
          <p className="text-secondary">CSV columns: email, name, department</p>
          <input type="file" accept=".csv" className="form-control mb-3" onChange={(e) => setFile(e.target.files?.[0])} />
          <button type="submit" className="btn add-btn text-white border-0" disabled={!file || loading}>
            {loading ? "Importing..." : "Upload & Import"}
          </button>
        </form>
      </div>
    </RoleGate>
  );
}
