import React from "react";
import "../Shared/NetworkShared.css";

function severityBadgeClass(severity) {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high-sevarity";
  return "medium-sevarity";
}

export default function AnomalyAlerts({ anomalies = [] }) {
  return (
    <div className="dashboard-card">
      <div className="row justify-content-between align-items-center p-2">
        <div className="col-12 d-flex align-items-center mb-3 mx-0 p-0">
          <i className="fa-solid fa-triangle-exclamation triangle-icon me-2" />
          <h6 className="text-white mb-0">Flood & Anomaly Alerts</h6>
        </div>

        {!anomalies.length && (
          <p className="text-secondary px-2">No anomalies detected in current window.</p>
        )}

        {anomalies.map((alert) => (
          <div key={alert.id} className="row justify-content-between align-items-center mb-4 p-0 w-100">
            <div className="col-2">
              <p className={`rounded-3 w-fit-content mb-0 text-capitalize ${severityBadgeClass(alert.severity)}`}>
                {alert.severity}
              </p>
            </div>
            <div className="col-7 p-0">
              <p className={`text-white mb-0 ${alert.isSpike ? "spike-highlight" : ""}`}>{alert.type}</p>
              <div className="d-flex justify-content-between align-items-center p-0 flex-wrap">
                <p className="mb-0">
                  Src: <span className="text-white">{alert.source}</span>
                </p>
                <p className={`mb-0 pps ${alert.isSpike ? "spike-highlight" : ""}`}>
                  {alert.pps.toLocaleString()} pps
                </p>
              </div>
            </div>
            <div className="col-2 p-0">
              <p className="mb-0">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
