import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import RoleGate from "../../Components/Shared/RoleGate";
import { canManageRecipients } from "../../utils/roles";
import useRecipients from "../../hooks/useRecipients";
import "../../Components/Shared/PhishingShared.css";

const SAMPLE_CSV = `name,email,department
Jane Doe,jane.doe@example.com,Engineering
John Smith,john.smith@example.com,Finance`;

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recipients-sample.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ImportRecipients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { importCsv } = useRecipients();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setImportResult(null);
    try {
      const res = await importCsv(file, campaignId || undefined);
      setImportResult(res.data);
      setFile(null);
      if (campaignId) {
        navigate(`/Phishing/Campaigns/${campaignId}`);
      }
    } catch (err) {
      setError(err.message ?? "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGate allow={canManageRecipients} fallback={<p className="text-danger p-3">Import access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white mb-0">
            {campaignId ? "Import recipients to campaign" : "Import Recipients (CSV)"}
          </h5>
          <Link
            to={campaignId ? `/Phishing/Campaigns/${campaignId}` : "/Phishing/Recipients"}
            className="btn phishing-outline-btn"
          >
            {campaignId ? "Back to campaign" : "Back to list"}
          </Link>
        </div>
        <PhishingAlert type="danger" message={error} />
        {importResult && (
          <PhishingAlert
            type="success"
            message={`Imported ${importResult.imported} recipient${importResult.imported === 1 ? "" : "s"} successfully.`}
          />
        )}

        <form onSubmit={handleImport} className="dashboard-card p-4">
          <p className="text-secondary mb-2">
            Upload a CSV with a header row. Required column: <strong className="text-white">email</strong>.
            Optional columns: <strong className="text-white">name</strong>, <strong className="text-white">department</strong>.
          </p>
          <p className="text-secondary small mb-3">
            Example header: <code className="text-white">name,email,department</code>
          </p>
          <button
            type="button"
            className="btn btn-sm phishing-outline-btn mb-3"
            onClick={downloadSampleCsv}
          >
            Download sample CSV
          </button>
          <input
            type="file"
            accept=".csv,text/csv"
            className="form-control mb-3"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn add-btn text-white border-0" disabled={!file || loading}>
              {loading ? "Importing..." : "Upload & Import"}
            </button>
            {importResult && (
              <button
                type="button"
                className="btn phishing-outline-btn"
                onClick={() => navigate("/Phishing/Recipients")}
              >
                View recipients
              </button>
            )}
          </div>
        </form>
      </div>
    </RoleGate>
  );
}
