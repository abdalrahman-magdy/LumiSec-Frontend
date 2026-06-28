import React from "react";
import "./TopAssets.css";

export default function TopAssets({ title, number, text, riskScore = 0 }) {
  const width = Math.max(8, Math.min(100, Number(riskScore) || 0));

  return (
    <div className="top-assets rounded-3 w-100 p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="text-white mb-0">{title}</h6>
        <p className="number mb-0 px-3 py-2 rounded-3 fw-bold fs-5">{number}</p>
      </div>
      <p>{text}</p>
      <div className="progress">
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${width}%` }}
          aria-valuenow={width}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
