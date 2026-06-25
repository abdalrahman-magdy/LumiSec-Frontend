import React from "react";
import "./incidentTable.css";
import { Bot, TriangleAlert } from "lucide-react";

function formatIncidentId(id = "") {
  return id ? `#${id.slice(-4).toUpperCase()}` : "—";
}

function formatContext(incident) {
  const parts = [
    incident.incidentType,
    incident.affectedHost ? `Host: ${incident.affectedHost}` : null,
    incident.sourceIP ? `Source IP: ${incident.sourceIP}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : incident.description || "No extra context";
}

function formatStatus(status = "new") {
  return status.replaceAll("_", " ");
}

function normalizeIncident(incident) {
  return {
    raw: incident,
    id: incident._id,
    displayId: formatIncidentId(incident._id),
    severity: incident.severity || "medium",
    title: incident.title || "Untitled incident",
    context: formatContext(incident),
    status: formatStatus(incident.status),
    tags: Array.isArray(incident.tags) ? incident.tags : [],
    action: ["new", "open", "in_progress", "escalated"].includes(incident.status)
      ? "Investigate"
      : "Review",
  };
}

export default function IncidentTable({
  incidents = [],
  severityFilter = "all",
  loading = false,
  error = null,
  onFilterChange,
  onIncidentAction,
}) {
  const visibleIncidents = incidents.map(normalizeIncident);

  return (
    <div className="incidentTable dashboard-card p-0">

      <div className="d-flex justify-content-between align-items-center mb-3 p-3">
        <h6 className="card-title-small m-0">
          UNIFIED INCIDENT MANAGEMENT QUEUE
        </h6>

        <select
          className="incident-filter-select"
          value={severityFilter}
          onChange={(event) => onFilterChange?.(event.target.value)}
          aria-label="Filter incidents by severity"
        >
          <option value="all">Filter: All Severities</option>
          <option value="critical">Filter: Critical</option>
          <option value="high">Filter: High</option>
          <option value="medium">Filter: Medium</option>
          <option value="low">Filter: Low</option>
        </select>
      </div>

      {loading && (
        <div className="incident-table-state">Loading incidents...</div>
      )}

      {!loading && error && (
        <div className="incident-table-state incident-table-error">
          {error.message || "Failed to load incidents"}
        </div>
      )}

      {!loading && !error && visibleIncidents.length === 0 && (
        <div className="incident-table-state">No incidents found.</div>
      )}

      {/* Wrapper مهم للـ responsiveness */}
      {!loading && !error && visibleIncidents.length > 0 && (
        <div className="table-responsive-wrapper">

        <table className="w-100 incidentTable">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Incident & Entity Context</th>
              <th>Response Status / MITRE</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {visibleIncidents.map((incident) => (
              <tr key={incident.id}>
                <td data-label="Severity">
                  <div className={`status ${incident.severity} rounded-3 py-1 px-2 text-center`}>
                    {incident.severity.toUpperCase()}
                  </div>
                </td>

                <td data-label="Incident">
                  <p className="h-3 mb-0 text-white fw-bold">{incident.title}</p>
                  <p className="mb-0">ID: {incident.displayId} | {incident.context}</p>
                </td>

                <td data-label="Response">
                  <div className="d-flex align-items-center mb-1">
                    {incident.severity === "critical" ? (
                      <TriangleAlert size={22} style={{ color: "#EF4444" }} className="me-1" />
                    ) : (
                      <Bot size={22} style={{ color: "#DBAB09" }} className="me-1" />
                    )}
                    <p className="mitre mb-0 text-capitalize">
                      {incident.status}
                    </p>
                  </div>

                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {incident.tags.length > 0 ? incident.tags.map((tag) => (
                      <div className="tag rounded-3 px-2 text-center" key={tag}>{tag}</div>
                    )) : <span className="incident-muted">No tags</span>}
                  </div>
                </td>

                <td data-label="Action">
                  <button
                    className={`${incident.action === "Investigate" ? "investigate-btn btn add-btn" : "btn btn-secondary"} text-white border-0`}
                    onClick={() => onIncidentAction?.(incident.raw)}
                  >
                    {incident.action}
                  </button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>
      )}
    </div>
  );
}
