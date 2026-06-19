import React from "react";
import "./NetworkShared.css";

export default function ScanProgress({ progress = 0, status = "Scanning...", active = false }) {
  if (!active && progress >= 100) return null;

  return (
    <div className="scan-progress">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-white">{status}</span>
        <span className="text-secondary">{Math.round(progress)}%</span>
      </div>
      <div className="scan-progress-bar">
        <div
          className="scan-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
