import React from "react";
import "./Summary.css";

import breif from "../../../../assets/Brief.png";
import TouchId from "../../../../assets/Touch ID.png";

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

function formatStatus(value = "new") {
  return value.replaceAll("_", " ");
}

function getArtifactAction(type) {
  if (type === "ip") return { action: "block_ip", label: "Block" };
  if (["hash", "file", "url", "domain"].includes(type)) return { action: "scan_artifact", label: "Scan" };
  return null;
}

export default function Summary({ incident, artifacts = [], loading = false, actionLoading, onArtifactAction }) {
  const groupedArtifacts = artifacts.reduce((groups, artifact) => {
    const key = artifact.type || "other";
    groups[key] = groups[key] || [];
    groups[key].push(artifact);
    return groups;
  }, {});

  return (
    <div className="summary-container">

      {/* ================= SUMMARY ================= */}
      <div className="summary-section mb-5">

        <div className="section-header d-flex align-items-center">
          <figure>
            <img src={breif} className="icon" alt="breif" />
          </figure>
          <h5 className="text-white mb-0">Summary</h5>
        </div>

        <div className="summary-grid">

          <div className="summary-row">
            <p className="title">Severity:</p>
            <p className="text-danger text-capitalize">{incident?.severity || "—"}</p>
          </div>

          <div className="summary-row">
            <p className="title">Status:</p>
            <p className="in-progress text-capitalize">{incident ? formatStatus(incident.status) : "—"}</p>
          </div>

          <div className="summary-row">
            <p className="title">Created:</p>
            <p className="text-white">{formatDate(incident?.createdAt)}</p>
          </div>

          <div className="summary-row">
            <p className="title">Time:</p>
            <p className="text-white">{formatTime(incident?.createdAt)}</p>
          </div>

          <div className="summary-row">
            <p className="title">Source:</p>
            <p className="text-white">{incident?.sourceIP || incident?.incidentType || "—"}</p>
          </div>

        </div>
      </div>

      {/* ================= ARTIFACTS ================= */}
      <div className="artifacts-section">

        <div className="section-header d-flex align-items-center">
          <figure>
            <img src={TouchId} className="icon" alt="TouchId" />
          </figure>
          <h5 className="text-white mb-0">Artifacts</h5>
        </div>

        {loading && <p className="summary-card-title">Loading artifacts...</p>}

        {!loading && artifacts.length === 0 && (
          <div className="summary-card p-3 rounded-3 mb-3">
            <p className="summary-card-title mb-0">No artifacts yet</p>
          </div>
        )}

        {!loading && Object.entries(groupedArtifacts).map(([type, items]) => (
          <div className="summary-card p-3 rounded-3 mb-3" key={type}>
            <p className="summary-card-title text-capitalize">{type}</p>

            {items.map((artifact) => (
              <div className="artifact-row mb-2" key={artifact._id || artifact.value}>
                <p className="text-white mb-0">{artifact.value}</p>
                {getArtifactAction(type) ? (
                  <button
                    type="button"
                    className={`${getArtifactAction(type).action === "block_ip" ? "block" : "scan"} rounded-3 fw-bold px-3 py-1 border-0`}
                    disabled={Boolean(actionLoading)}
                    onClick={() => onArtifactAction?.(getArtifactAction(type).action, artifact)}
                  >
                    {actionLoading === getArtifactAction(type).action ? "..." : getArtifactAction(type).label}
                  </button>
                ) : (
                  artifact.label && <p className="scan rounded-3 fw-bold px-3 py-1">{artifact.label}</p>
                )}
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
