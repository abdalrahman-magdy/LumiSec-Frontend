import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import DashboardCard3 from "../Components/DashboardCard3/DashboardCard3";
import SettingsIcon from "../../../assets/SVG (12).png";
import barCahrtIcons from "../../../assets/SVG (13).png";
import MisconfigurationsTabel from "../Components/MisconfigurationsTabel/MisconfigurationsTabel";
import SeverityDistributionChart from "../Components/SeverityDistributionChart/SeverityDistributionChart";
import UrgentRecommendations from "../Components/UrgentRecommendations/UrgentRecommendations";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import NetworkLoading from "../Components/Shared/NetworkLoading";
import useMisconfigurations from "../hooks/useMisconfigurations";

export default function Misconfigurations() {
  const { setTitle } = useOutletContext();
  const {
    items,
    severityCounts,
    recommendations,
    loading,
    error,
    severityFilter,
    setSeverityFilter,
    reload,
  } = useMisconfigurations();

  useEffect(() => {
    setTitle("Misconfigurations");
  }, [setTitle]);

  if (loading && !items.length) {
    return <NetworkLoading message="Loading misconfigurations..." skeleton rows={4} />;
  }

  return (
    <div className="dashboard-container p-3 mb-3">
      <NetworkAlert error={error} onRetry={reload} />

      <div className="row g-3 mb-4">
        <DashboardCard3
          title="Critical"
          icon={<i className="fa-solid fa-triangle-exclamation text-danger" />}
          Statistics={String(severityCounts.critical)}
          text2="Active issues"
        />
        <DashboardCard3
          title="High"
          icon={<i className="fa-solid fa-triangle-exclamation text-danger" />}
          Statistics={String(severityCounts.high)}
          text2="Active issues"
        />
        <DashboardCard3
          title="Medium"
          icon={<i className="fa-solid fa-circle-info text-warning" />}
          Statistics={String(severityCounts.medium)}
          text2="Active issues"
        />
        <DashboardCard3
          title="Fixed"
          icon={<i className="fa-solid fa-circle-check text-success" />}
          Statistics={String(severityCounts.fixed)}
          text2="Resolved"
        />
      </div>

      <div className="row m-0">
        <div className="col-9 mb-0 p-0">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center">
                <figure className="mb-0 me-2">
                  <img src={SettingsIcon} alt="misconfig" />
                </figure>
                <h6 className="text-white mb-0">Active Misconfigurations ({items.length})</h6>
              </div>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select scanType-select border-0"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button type="button" className="btn action-btns rounded-3" onClick={reload}>
                  <i className="fa-solid text-secondary fa-arrow-rotate-right" />
                </button>
              </div>
            </div>
            <MisconfigurationsTabel items={items} loading={loading} />
          </div>
        </div>

        <div className="col-3 mb-3">
          <div className="d-flex flex-column gap-3 mb-3">
            <div className="dashboard-card">
              <div className="d-flex align-items-center mb-0">
                <figure className="mb-0 me-2">
                  <img src={barCahrtIcons} className="w-100" alt="chart" />
                </figure>
                <h6 className="text-white mb-3">Severity Distribution</h6>
              </div>
              <SeverityDistributionChart severityCounts={severityCounts} />
            </div>
          </div>

          <div className="col">
            <div className="d-flex flex-column gap-3">
              <div className="dashboard-card">
                <div className="d-flex align-items-center mb-4">
                  <i className="fa-solid fa-circle-info me-1" style={{ color: "#F97316" }} />
                  <h6 className="text-white m-0">Urgent Recommendations</h6>
                </div>
                <UrgentRecommendations recommendations={recommendations} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
