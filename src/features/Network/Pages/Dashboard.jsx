import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import DashboardCard from "../Components/DashboardCard/DashboardCard";
import assetsIcon from "../../../assets/Background+Shadow.png";
import LocationIcon from "../../../assets/Background+Shadow (1).png";
import curveIcon from "../../../assets/Background+Shadow (2).png";
import riskIcon from "../../../assets/Background+Shadow (3).png";
import timeIcon from "../../../assets/Background+Shadow (4).png";
import curvesImages from "../../../assets/SVG (1).png";
import "./Dashboard.css";
import NetworkActivityChart from "../Components/NetworkActivityChart/NetworkActivityChart";
import TopAssets from "../Components/Top Assets/TopAssets";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import NetworkLoading from "../Components/Shared/NetworkLoading";
import MisconfigurationsTabel from "../Components/MisconfigurationsTabel/MisconfigurationsTabel";
import useNetworkDashboard from "../hooks/useNetworkDashboard";
import { formatNumber } from "../utils/normalizers";

export default function Dashboard() {
  const { setTitle } = useOutletContext();
  const navigate = useNavigate();
  const {
    summary,
    misconfigPreview,
    loading,
    error,
    actionLoading,
    reload,
    runDiscovery,
    runPortScan,
    runSniffing,
  } = useNetworkDashboard();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  const handleDiscovery = async () => {
    const ok = await runDiscovery();
    if (ok) navigate("/Network/NetworkDiscovery");
  };

  const handlePortScan = async () => {
    const ok = await runPortScan();
    if (ok) navigate("/Network/PortScanning");
  };

  const handleSniffing = async () => {
    const ok = await runSniffing();
    if (ok) navigate("/Network/PacketCapture");
  };

  if (loading && !summary) {
    return <NetworkLoading message="Loading LumiNet dashboard..." skeleton rows={3} />;
  }

  return (
    <>
      <NetworkAlert error={error} onRetry={reload} />

      <div className="row align-items-center justify-content-around">
        <DashboardCard
          text="Total Assets"
          Statistics={formatNumber(summary?.totalAssets ?? 0)}
          icon={assetsIcon}
        />
        <DashboardCard
          text="Active Hosts"
          Statistics={formatNumber(summary?.activeHosts ?? 0)}
          icon={LocationIcon}
        />
        <DashboardCard
          text="Open Ports"
          Statistics={formatNumber(summary?.openPorts ?? 0)}
          icon={curveIcon}
        />
        <DashboardCard
          text="Alerts"
          Statistics={formatNumber(summary?.alerts ?? 0)}
          icon={riskIcon}
        />
        <DashboardCard
          text="Threats"
          Statistics={formatNumber(summary?.threats ?? 0)}
          icon={timeIcon}
        />
      </div>

      <div className="d-flex align-items-center my-3 ps-3 flex-wrap gap-2">
        <button
          type="button"
          disabled={actionLoading === "discover"}
          className="btn start-btn border-0 rounded-3 text-black fw-medium ps-0 d-flex align-items-center"
          onClick={handleDiscovery}
        >
          <i className={`fa-solid ${actionLoading === "discover" ? "fa-spinner fa-spin" : "fa-play"} mx-2`} />
          Run Network Discovery
        </button>
        <button
          type="button"
          disabled={actionLoading === "portscan"}
          className="btn export-reports-btn rounded-3 fw-medium ps-0 d-flex align-items-center"
          onClick={handlePortScan}
        >
          <i className={`fa-solid ${actionLoading === "portscan" ? "fa-spinner fa-spin" : "fa-network-wired"} mx-2`} />
          Run Port Scan
        </button>
        <button
          type="button"
          disabled={actionLoading === "sniff"}
          className="btn view-btn rounded-3 fw-medium ps-0 d-flex align-items-center"
          onClick={handleSniffing}
        >
          <i className={`fa-solid ${actionLoading === "sniff" ? "fa-spinner fa-spin" : "fa-wifi"} mx-2`} />
          Start Packet Sniffing
        </button>
      </div>

      <div className="row g-3 justify-content-between align-items-stretch mb-4 mb-lg-5 px-3 mt-0">
        <div className="col-12 col-lg-6">
          <div className="dashboard-card h-100 p-3 rounded-4">
            <div className="d-flex align-items-center">
              <figure className="me-2 mb-0">
                <img src={curvesImages} className="w-100" alt="activity" />
              </figure>
              <h6 className="text-white">Network Activity — Live Flow Metrics</h6>
            </div>
            <NetworkActivityChart flowMetrics={summary?.flow} />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="dashboard-card h-100 p-3 rounded-4">
            <div className="d-flex align-items-center mb-4">
              <i className="fa-solid danger-icon fa-triangle-exclamation me-2 fs-5" />
              <h6 className="text-white mb-0">Top Vulnerable Assets</h6>
            </div>
            {(summary?.topVulnerable ?? []).map((asset) => (
              <TopAssets
                key={asset.id}
                title={asset.hostname}
                number={String(asset.riskScore)}
                text={asset.ip}
              />
            ))}
            {!summary?.topVulnerable?.length && (
              <p className="text-secondary">No asset data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card p-3 rounded-4 mx-3">
        <div className="d-flex align-items-center mb-3">
          <i className="fa-solid fa-triangle-exclamation text-danger me-2" />
          <h6 className="text-white mb-0">Misconfiguration Alerts</h6>
        </div>
        <MisconfigurationsTabel items={misconfigPreview} loading={loading} />
      </div>
    </>
  );
}
