import React from "react";
import { Link } from "react-router-dom";
import analysisIcon from "../../../../assets/Overlay (6).png";
import sendIcon from "../../../../assets/Container.png";
import emailIcon from "../../../../assets/Container (1).png";
import clickIcon from "../../../../assets/Container (2).png";
import databaseIcon from "../../../../assets/Container (3).png";
import infoIcon from "../../../../assets/Container (4).png";
import DashboardCard4 from "../../Components/DashboardCard4/DashboardCard4";
import CampaignTrendChart from "../../Components/CampaignTrendChart/CampaignTrendChart";
import CampaignFunnel from "../../Components/CampaignFunnel/CampaignFunnel";
import RecentCampaignsTabel from "../../Components/RecentCampaignsTabel/RecentCampaignsTabel";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import { useDashboardOverview, useDashboardTrends } from "../../hooks/usePhishingDashboard";
import useCampaigns from "../../hooks/useCampaigns";
import { formatNumber, formatPercent } from "../../utils/normalizers";
import "../../Components/Shared/PhishingShared.css";
import "../../Pages/PhishingDashboard.css";

export default function Overview() {
  const { data, loading, error, isMock, reload } = useDashboardOverview();
  const { data: trends } = useDashboardTrends();
  const { campaigns } = useCampaigns();

  if (loading && !data) return <PhishingLoading message="Loading phishing overview..." skeleton rows={4} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="text-white mb-1">Phishing Simulation — Overview</h5>
          <p className="dashboard-desc mb-0">SOC dashboard — live campaign metrics</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/Phishing/Dashboard/Risks" className="btn btn-sm phishing-integration-btn phishing-integration-soar">Risks</Link>
          <Link to="/Phishing/Dashboard/Departments" className="btn btn-sm phishing-integration-btn phishing-integration-grc">Departments</Link>
          <Link to="/Phishing/Dashboard/Trends" className="btn btn-sm phishing-integration-btn phishing-integration-siem">Trends</Link>
        </div>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="row justify-content-between align-items-center mb-3">
        <DashboardCard4 title="Active Campaigns" icon={analysisIcon} Statistics={formatNumber(data?.activeCampaigns)} text2={`Success rate: ${formatPercent(data?.successRate)}`} />
        <DashboardCard4 title="Emails Sent" icon={sendIcon} Statistics={formatNumber(data?.emailsSent)} text2="across all campaigns" />
        <DashboardCard4 title="Open Rate" icon={emailIcon} Statistics={formatPercent(data?.openRate)} text2={`Industry avg: ${data?.industryOpenAvg}%`} />
        <DashboardCard4 title="Click Rate" icon={clickIcon} Statistics={formatPercent(data?.clickRate)} text2={`Industry avg: ${data?.industryClickAvg}%`} />
        <DashboardCard4 title="Submit Rate" icon={databaseIcon} Statistics={formatPercent(data?.submitRate)} text2={`Threshold: ${data?.criticalThreshold}%`} text3={data?.submitRate > data?.criticalThreshold ? "▲ Above" : "▼ Below"} text4="critical threshold" />
        <DashboardCard4 title="Risks Created" icon={infoIcon} Statistics={formatNumber(data?.risksCreated)} text2="In GRC pipeline" />
      </div>

      <div className="row justify-content-between m-0">
        <div className="col-7 dashboard-card mb-3"><CampaignTrendChart trends={trends} /></div>
        <div className="col dashboard-card mb-3 ms-2"><CampaignFunnel overview={data} /></div>
      </div>

      <div className="col dashboard-card mb-3"><RecentCampaignsTabel campaigns={campaigns} /></div>
    </div>
  );
}
