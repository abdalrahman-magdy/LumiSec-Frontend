import React from "react";
import IntegrationActions from "./IntegrationActions";
import "./NetworkShared.css";

export default function AssetDetailModal({ asset, details, loading, onClose, onContextLookup }) {
  if (!asset) return null;

  const data = details ?? asset;

  return (
  <>
    <div className="modal fade show asset-modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-white">
              Asset Details — {data.hostname ?? asset.hostname}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {loading ? (
              <p className="text-secondary">Loading asset profile...</p>
            ) : (
              <>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">IP Address</span>
                  <span>{data.ip}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">MAC Address</span>
                  <span>{data.mac}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">OS Guess</span>
                  <span>{data.osGuess}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">Status</span>
                  <span className="text-capitalize">{data.status}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">Risk Score</span>
                  <span>{data.riskScore} ({data.riskLevel})</span>
                </div>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">Services</span>
                  <span>{(data.services ?? []).join(", ") || "—"}</span>
                </div>
                {data.raw?.vulnerabilities && (
                  <div className="mt-3">
                    <h6 className="text-white">Vulnerabilities</h6>
                    <ul className="text-secondary">
                      {data.raw.vulnerabilities.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <IntegrationActions item={data} source="asset-inventory" compact />
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn add-btn text-white border-0"
              onClick={() => onContextLookup?.(data.ip)}
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
