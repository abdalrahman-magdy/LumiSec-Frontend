import React, { useState } from "react";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import PhishingIntegrationActions from "../../Components/Shared/PhishingIntegrationActions";
import RoleGate from "../../Components/Shared/RoleGate";
import { canViewReports } from "../../utils/roles";
import useReports from "../../hooks/useReports";
import useCampaigns from "../../hooks/useCampaigns";
import { formatNumber } from "../../utils/normalizers";
import "../../Components/Shared/PhishingShared.css";

export default function ReportViewer() {
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const { campaigns } = useCampaigns();
  const { stats, loading, error, isMock, reload, generateReport, download } = useReports(null, selectedCampaignId || null);
  const [generating, setGenerating] = useState(false);
  const [reportId, setReportId] = useState(null);

  const handleGenerate = async () => {
    if (!selectedCampaignId) return;
    setGenerating(true);
    try {
      const res = await generateReport(selectedCampaignId);
      setReportId(res.data?.report?._id ?? res.data?.report?.id ?? selectedCampaignId);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <PhishingLoading message="Loading report stats..." />;

  return (
    <RoleGate allow={canViewReports} fallback={<p className="text-danger p-3">Report access denied.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h5 className="text-white">Campaign Reports</h5>
            <p className="dashboard-desc">Summary analytics & risk breakdown</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select scanType-select border-0"
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                setReportId(null);
              }}
              style={{ minWidth: 220 }}
            >
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
            <button type="button" className="btn add-btn text-white border-0" disabled={generating || !selectedCampaignId} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate Report"}
            </button>
            {reportId && (
              <button type="button" className="btn integration-btn" onClick={() => download(selectedCampaignId)}>Download</button>
            )}
          </div>
        </div>
        <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

        <div className="row g-3 mb-4">
          <div className="col-md-3 dashboard-card p-3"><p className="text-secondary">Campaigns</p><h4 className="text-white">{formatNumber(stats?.campaigns)}</h4></div>
          <div className="col-md-3 dashboard-card p-3"><p className="text-secondary">Recipients</p><h4 className="text-white">{formatNumber(stats?.totalRecipients)}</h4></div>
          <div className="col-md-3 dashboard-card p-3"><p className="text-secondary">Avg Click Rate</p><h4 className="text-warning">{stats?.avgClickRate ?? stats?.clickRate}%</h4></div>
          <div className="col-md-3 dashboard-card p-3"><p className="text-secondary">High Risk Users</p><h4 className="text-danger">{formatNumber(stats?.highRiskUsers)}</h4></div>
        </div>

        <div className="dashboard-card p-3 mb-3">
          <h6 className="text-white mb-3">User Behavior Summary</h6>
          <table className="w-100 discover-tabel">
            <thead><tr><th>Metric</th><th>Value</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td className="text-white">Average Submit Rate</td><td>{stats?.avgSubmitRate}%</td><td className={stats?.avgSubmitRate > 15 ? "text-danger" : "text-success"}>{stats?.avgSubmitRate > 15 ? "Above threshold" : "Within threshold"}</td></tr>
              <tr><td className="text-white">High Risk Users</td><td>{stats?.highRiskUsers}</td><td className="text-danger">Requires training</td></tr>
            </tbody>
          </table>
        </div>

        <div className="dashboard-card p-3">
          <h6 className="text-white mb-2">Push Results to Integrations</h6>
          <PhishingIntegrationActions campaign={{ id: "report", name: "Phishing Report", submitted: stats?.highRiskUsers }} />
        </div>
      </div>
    </RoleGate>
  );
}
