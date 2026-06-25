import React from "react";

export default function RiskCard({ onOpen }) {
  return (
    <div className="dashboard-card side-card">

      <h6 className="card-title-small">
        ASSET RISK CONTEXT
      </h6>
      <button className="side-card-action" type="button" onClick={onOpen}>View Context</button>

      <h1 className="text-danger text-center">
        88%
      </h1>

      <p className="small text-center text-white mb-3">
        SRV-01 Security Score
      </p>

      <p>High exposure due to Domain Admin privileges and Active Malware
      connection.</p>

    </div>
  );
}
