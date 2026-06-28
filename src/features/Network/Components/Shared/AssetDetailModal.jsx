import React from "react";
import IntegrationActions from "./IntegrationActions";
import { resolveDisplayText } from "../../utils/normalizers";
import "./NetworkShared.css";

export default function AssetDetailModal({ asset, details, loading, onClose, onContextLookup }) {
  if (!asset) return null;

  const profile = details?.asset ?? details ?? asset;
  const misconfigurations = details?.misconfigurations ?? [];
  const loadError = details?.error ?? profile?.error;

  return (
    <>
      <div className="modal fade show asset-modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-white">
                Asset Details — {profile.hostname ?? asset.hostname}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>
            <div className="modal-body">
              {loading ? (
                <p className="text-secondary">Loading asset profile...</p>
              ) : (
                <>
                  {loadError && (
                    <p className="text-warning mb-3">{loadError}</p>
                  )}
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">IP Address</span>
                    <span>{profile.ip}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">MAC Address</span>
                    <span>{profile.mac}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">OS</span>
                    <span>{profile.osGuess}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Vendor</span>
                    <span>{resolveDisplayText(profile.vendor)}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Status</span>
                    <span className="text-capitalize">{profile.status}</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Risk Score</span>
                    <span>{profile.riskScore} ({profile.riskLevel})</span>
                  </div>
                  <div className="asset-detail-row">
                    <span className="asset-detail-label">Services</span>
                    <span>{profile.services?.length ? profile.services.join(", ") : "—"}</span>
                  </div>

                  <div className="mt-4">
                    <h6 className="text-white mb-2">
                      Open Misconfigurations ({misconfigurations.length})
                    </h6>
                    {misconfigurations.length === 0 ? (
                      <p className="text-secondary mb-0">No open misconfigurations for this asset.</p>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {misconfigurations.map((item) => (
                          <li key={item.id} className="text-secondary mb-2">
                            <span className="text-white">{resolveDisplayText(item.type)}</span>
                            {" — "}
                            {resolveDisplayText(item.severity)}
                            {item.description ? `: ${item.description}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {profile.raw?.vulnerabilities && (
                    <div className="mt-3">
                      <h6 className="text-white">Vulnerabilities</h6>
                      <ul className="text-secondary">
                        {profile.raw.vulnerabilities.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4">
                    <IntegrationActions item={profile} source="asset-inventory" compact />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn add-btn text-white border-0"
                onClick={() => onContextLookup?.(profile.ip)}
              >
                Context Lookup
              </button>
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
