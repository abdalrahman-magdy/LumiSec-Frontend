import React from "react";
import "./HostTabel.css";
import NetworkLoading from "../Shared/NetworkLoading";

export default function HostsTabel({ hosts = [], loading = false }) {
  if (loading) return <NetworkLoading skeleton rows={4} />;

  if (!hosts.length) {
    return <p className="text-secondary p-3 mb-0">No hosts discovered yet. Run a network scan.</p>;
  }

  return (
    <div className="table-responsive-wrapper">
      <table className="w-100 discover-tabel">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>MAC</th>
            <th>Hostname</th>
            <th>OS Guess</th>
            <th>Subnet</th>
            <th>Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((host) => (
            <tr key={`${host.ip}-${host.mac}`}>
              <td className="text-white fw-medium">{host.ip}</td>
              <td className="text-white">{host.mac}</td>
              <td className="text-white">{host.hostname}</td>
              <td className="text-secondary">{host.osGuess}</td>
              <td className="text-secondary">{host.subnet ?? "—"}</td>
              <td>
                <span className={`risk-score rounded-3 w-fit-content mb-0 ${host.riskLevel === "critical" || host.riskLevel === "high" ? "critical" : ""}`}>
                  {host.riskLevel}
                </span>
              </td>
              <td>
                <p className="status rounded-5 mb-0 ps-4 text-capitalize">{host.status}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
