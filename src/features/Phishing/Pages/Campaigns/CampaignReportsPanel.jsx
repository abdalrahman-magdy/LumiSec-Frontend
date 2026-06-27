import React, { useState } from "react";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canGenerateReports, canViewReports } from "../../utils/roles";
import useReports from "../../hooks/useReports";
import { downloadReport, generateReport as apiGenerateReport } from "../../services/phishingApi";
import { formatNumber } from "../../utils/normalizers";
import "../../Components/Shared/PhishingShared.css";

export default function CampaignReportsPanel({ campaignId, campaignName }) {
  const { stats, loading, error, isMock, reload } = useReports(null, campaignId);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setActionError(null);
    setFeedback(null);
    try {
      await apiGenerateReport(campaignId);
      setFeedback("Report generation queued. PDF will be ready shortly — try Download in a minute.");
      setTimeout(reload, 3000);
    } catch (err) {
      setActionError(err.message ?? "Could not queue report generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setActionError(null);
    try {
      await downloadReport(campaignId);
      setFeedback("Report download started.");
    } catch (err) {
      setActionError(err.message?.includes("404")
        ? "PDF not ready yet. Generate the report and wait for the worker to finish."
        : err.message ?? "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <RoleGate allow={canViewReports}>
      <div className="dashboard-card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="text-white mb-0">Campaign report</h6>
          <RoleGate allow={canGenerateReports}>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm phishing-campaign-action phishing-action-details"
                disabled={generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                ) : (
                  <i className="fa-solid fa-file-pdf me-1" />
                )}
                Generate PDF
              </button>
              <button
                type="button"
                className="btn btn-sm phishing-campaign-action phishing-action-console"
                disabled={downloading}
                onClick={handleDownload}
              >
                {downloading ? (
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                ) : (
                  <i className="fa-solid fa-download me-1" />
                )}
                Download
              </button>
            </div>
          </RoleGate>
        </div>

        <PhishingAlert type="danger" message={error || actionError} isMock={isMock} onRetry={reload} />
        <PhishingAlert type="success" message={feedback} />

        {loading && !stats ? (
          <PhishingLoading message="Loading report stats..." skeleton rows={2} />
        ) : (
          <div className="row g-2">
            <div className="col-md-3 col-6">
              <p className="text-secondary small mb-0">Sent</p>
              <p className="text-white mb-0">{formatNumber(stats?.emailsSent ?? stats?.sent ?? 0)}</p>
            </div>
            <div className="col-md-3 col-6">
              <p className="text-secondary small mb-0">Open rate</p>
              <p className="text-white mb-0">{stats?.openRate ?? 0}%</p>
            </div>
            <div className="col-md-3 col-6">
              <p className="text-secondary small mb-0">Click rate</p>
              <p className="text-warning mb-0">{stats?.clickRate ?? 0}%</p>
            </div>
            <div className="col-md-3 col-6">
              <p className="text-secondary small mb-0">Submit rate</p>
              <p className="text-danger mb-0">{stats?.submissionRate ?? stats?.submitRate ?? 0}%</p>
            </div>
          </div>
        )}

        {campaignName && (
          <p className="text-secondary small mt-2 mb-0">
            Report for <span className="text-white">{campaignName}</span>. Requires Redis and report worker for PDF generation.
          </p>
        )}
      </div>
    </RoleGate>
  );
}
