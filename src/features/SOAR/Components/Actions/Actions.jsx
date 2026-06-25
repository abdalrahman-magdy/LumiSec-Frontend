import React from "react";
import "./Actions.css";

import flashOn from "../../../../assets/Flash On.png";
import module from "../../../../assets/Module.png";
import warningSheild from "../../../../assets/Warning Shield.png";
import wiFi from "../../../../assets/Wi-Fi Disconnected.png";
import IrisScan from "../../../../assets/Iris Scan.png";
import KeySecurity from "../../../../assets/Key Security.png";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Actions({ related, alerts = [], actionLoading, onAction }) {
  const relatedIncidents = [
    ...(related?.explicit || []),
    ...(related?.inferred || []),
  ];

  return (
    <div className="actions-container mb-5">

      {/* ================= RECOMMENDED ACTIONS ================= */}
      <div className="section-block mb-3">

        <div className="section-header d-flex align-items-center">
          <figure>
            <img src={flashOn} className="icon" alt="flash on" />
          </figure>
          <h5 className="text-white mb-0">Recommended Actions</h5>
        </div>

        <div className="actions-buttons">

          <button
            className="action-btn isolate-btn w-100 d-flex align-items-center"
            disabled={Boolean(actionLoading)}
            onClick={() => onAction?.("isolate_host")}
          >
            <img src={wiFi} alt="wiFi" />
            {actionLoading === "isolate_host" ? "Isolating..." : "Isolate Host"}
          </button>

          <button
            className="action-btn scan-btn w-100 d-flex align-items-center"
            disabled={Boolean(actionLoading)}
            onClick={() => onAction?.("scan_endpoint")}
          >
            <img src={IrisScan} alt="scan" />
            Scan Endpoint
          </button>

          <button
            className="action-btn reset-btn w-100 d-flex align-items-center"
            disabled={Boolean(actionLoading)}
            onClick={() => onAction?.("reset_password")}
          >
            <img src={KeySecurity} alt="reset" />
            {actionLoading === "reset_password" ? "Requesting..." : "Reset User Password"}
          </button>

        </div>
      </div>

      {/* ================= RELATED INCIDENTS ================= */}
      <div className="section-block">

        <div className="section-header d-flex align-items-center">
          <figure>
            <img src={module} className="icon" alt="module" />
          </figure>
          <h5 className="text-white mb-0">Related Incidents</h5>
        </div>

        <div className="card-list">

          {relatedIncidents.length === 0 && (
            <div className="action-card p-3 rounded-3">
              <p className="text-white mb-0">No related incidents found.</p>
            </div>
          )}

          {relatedIncidents.map((incident) => (
            <div className="action-card p-3 rounded-3" key={incident._id}>
              <p className="text-white fw-medium mb-1">{incident.title}</p>
              <p className="text-white mb-0">{formatDate(incident.createdAt)}</p>
            </div>
          ))}

        </div>
      </div>

      {/* ================= LINKED ALERTS ================= */}
      <div className="section-block">

        <div className="section-header d-flex align-items-center">
          <figure>
            <img src={warningSheild} className="icon" alt="warning" />
          </figure>
          <h5 className="text-white mb-0">Linked Alerts</h5>
        </div>

        <div className="card-list">

          {alerts.length === 0 && (
            <div className="action-card p-3 rounded-3">
              <p className="text-white mb-0">No linked alerts found.</p>
            </div>
          )}

          {alerts.map((alert, index) => (
            <div className="action-card p-3 rounded-3" key={`${alert.title}-${alert.timestamp}-${index}`}>
              <div className="alert-row">
                <p className="text-white fw-medium mb-0">{alert.title}</p>
                <p className={`${alert.severity === "medium" ? "medium-action" : "high-action"} px-3 rounded-3 mb-0 text-capitalize`}>
                  {alert.severity || "medium"}
                </p>
              </div>

              <p className="text-white mb-0">{alert.source || "SOAR"} • {formatTime(alert.timestamp)}</p>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
