import React from "react";

function AssetField({ label, value }) {
  return (
    <div className="col-6 col-md-4 col-lg mb-3">
      <p className="text-secondary mb-1 small">{label}</p>
      <p className="text-white mb-0 fw-medium">{value}</p>
    </div>
  );
}

export default function PortScanAssetSummary({ asset, taskId, status }) {
  if (!asset) return null;

  return (
    <div className="dashboard-card mb-3 p-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h6 className="text-white mb-0">Scanned Asset</h6>
        <div className="d-flex gap-2 flex-wrap">
          {status && (
            <span className="badge rounded-pill text-bg-secondary text-capitalize">{status}</span>
          )}
          {taskId && (
            <span className="badge rounded-pill text-bg-dark border border-secondary">
              Task: {taskId}
            </span>
          )}
        </div>
      </div>
      <div className="row">
        <AssetField label="IP Address" value={asset.ip} />
        <AssetField label="Hostname" value={asset.hostname} />
        <AssetField label="OS Type" value={asset.osType} />
        <AssetField label="MAC Address" value={asset.mac} />
        <AssetField label="Vendor" value={asset.vendor} />
      </div>
    </div>
  );
}
