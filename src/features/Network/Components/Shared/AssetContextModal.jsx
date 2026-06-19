import React from "react";
import NetworkLoading from "./NetworkLoading";
import "./NetworkShared.css";

export default function AssetContextModal({ ip, context, loading, error, onClose, onRetry }) {
  if (!ip) return null;

  return (
  <>
    <div className="modal fade show asset-modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
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
            {!loading && context && (
              <>
                <div className="asset-detail-row">
                  <span className="asset-detail-label">Network Role</span>
                  <span>{context.networkRole ?? "—"}</span>
                </div>
                {context.threatIntel?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-white">Threat Intelligence</h6>
                    <ul className="text-secondary">
                      {context.threatIntel.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {context.relatedIncidents?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-white">Related Incidents</h6>
                    <ul className="text-secondary">
                      {context.relatedIncidents.map((inc) => (
                        <li key={inc}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {context.grcFindings?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-white">GRC Findings</h6>
                    <ul className="text-secondary">
                      {context.grcFindings.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {context.connections?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-white">Active Connections</h6>
                    <p className="text-secondary mb-0">{context.connections.join(", ")}</p>
                  </div>
                )}
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
