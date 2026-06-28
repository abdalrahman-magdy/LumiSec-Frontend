import React from "react";
import NetworkLoading from "./NetworkLoading";
import { resolveDisplayText } from "../../utils/normalizers";
import "./NetworkShared.css";

function formatObservedAt(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function AssetContextModal({ ip, context, loading, error, onClose, onRetry }) {
  if (!ip) return null;

  const asset = context?.asset;
  const misconfigurations = context?.misconfigurations ?? [];
  const recentFlows = context?.recentFlows ?? [];

  return (
    <>
      <div className="modal fade show asset-modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-white">Context Lookup — {ip}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>
            <div className="modal-body">
              {loading && <NetworkLoading message="Resolving asset context..." />}
              {error && (
                <div className="text-danger mb-2">
                  {error?.message ?? error}
                  <button type="button" className="btn btn-sm network-retry-btn ms-2" onClick={onRetry}>
                    Retry
                  </button>
                </div>
              )}
              {!loading && context && asset && (
                <>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Hostname</span>
                    <span>{resolveDisplayText(asset.hostname)}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">MAC Address</span>
                    <span>{resolveDisplayText(asset.mac)}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">OS</span>
                    <span>{resolveDisplayText(asset.osGuess)}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Status</span>
                    <span className="text-capitalize">{resolveDisplayText(asset.status)}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Open Services</span>
                    <span>{asset.services?.length ? asset.services.join(", ") : "—"}</span>
                  </div>

                  <div className="mt-4">
                    <h6 className="text-white mb-2">
                      Misconfigurations ({misconfigurations.length})
                    </h6>
                    {misconfigurations.length === 0 ? (
                      <p className="text-secondary mb-0">No misconfigurations recorded for this asset.</p>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {misconfigurations.map((item) => (
                          <li key={item.id} className="text-secondary mb-2">
                            <span className="text-white">{resolveDisplayText(item.type)}</span>
                            {" — "}
                            {resolveDisplayText(item.severity)} ({resolveDisplayText(item.status)})
                            {item.description ? `: ${item.description}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4">
                    <h6 className="text-white mb-2">Recent Flow Metrics ({recentFlows.length})</h6>
                    {recentFlows.length === 0 ? (
                      <p className="text-secondary mb-0">No recent traffic metrics for this asset.</p>
                    ) : (
                      <div className="table-responsive-wrapper">
                        <table className="w-100 discover-tabel">
                          <thead>
                            <tr>
                              <th>Observed</th>
                              <th>PPS</th>
                              <th>Bandwidth (Kbps)</th>
                              <th>Anomaly</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentFlows.map((flow) => (
                              <tr key={flow.id}>
                                <td className="text-secondary">{formatObservedAt(flow.observedAt)}</td>
                                <td className="text-white">{flow.packetsPerSecond}</td>
                                <td className="text-white">{flow.bandwidthKbps}</td>
                                <td className={flow.isAnomaly ? "text-danger" : "text-secondary"}>
                                  {flow.isAnomaly ? "Yes" : "No"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
