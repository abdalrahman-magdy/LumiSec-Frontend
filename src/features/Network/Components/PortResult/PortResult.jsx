import React from "react";
import "./PortResult.css";
import IntegrationActions from "../Shared/IntegrationActions";
import NetworkLoading from "../Shared/NetworkLoading";
import { resolveDisplayText } from "../../utils/normalizers";

function riskClass(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "medium";
  return "";
}

export default function PortResult({ results = [], loading = false, target = "—", scanned = false }) {
  if (loading) return <NetworkLoading skeleton rows={5} />;

  if (!results.length) {
    return (
      <p className="text-secondary p-3 mb-0">
        {scanned
          ? "Scan completed — no open ports were detected on the requested target."
          : "No port scan results. Run a scan to begin."}
      </p>
    );
  }

  const targetLabel = resolveDisplayText(target, "—");

  return (
    <div className="table-responsive-wrapper">
      <table className="w-100 discover-tabel port-result-table">
        <thead>
          <tr>
            <th>Port</th>
            <th>Protocol</th>
            <th>Service</th>
            <th>State</th>
            <th>Risk Score</th>
            <th>Integrations</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={`${row.id ?? row.port}-${row.protocol}`}>
              <td className="text-white fw-medium">{row.port}</td>
              <td className="text-secondary">{resolveDisplayText(row.protocol)}</td>
              <td className="text-white">{resolveDisplayText(row.service, "unknown")}</td>
              <td>
                <span className={`status rounded-5 mb-0 ps-3 text-capitalize ${row.state === "open" ? "" : "text-secondary"}`}>
                  {resolveDisplayText(row.state, "open")}
                </span>
              </td>
              <td>
                <p className={`risk-score rounded-3 w-fit-content mb-0 ${riskClass(row.riskScore)}`}>
                  {row.riskScore}
                </p>
              </td>
              <td>
                <IntegrationActions
                  item={{
                    type: `Open port ${row.port}/${resolveDisplayText(row.service, "unknown")}`,
                    severity: row.riskScore >= 80 ? "critical" : row.riskScore >= 60 ? "high" : "medium",
                    description: `Port ${row.port} (${resolveDisplayText(row.service, "unknown")}) is ${resolveDisplayText(row.state, "open")}`,
                    ip: targetLabel,
                  }}
                  source="port-scan"
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
