import React from "react";

import "./ThreatFeedCard.css"

export default function ThreatFeedCard({ onRefresh }) {
  return (
    <div className="ThreatFeedCard dashboard-card side-card">

      <h6 className="card-title-small">
        GLOBAL THREAT INTEL FEED
      </h6>
      <button className="side-card-action" type="button" onClick={onRefresh}>Refresh Feed</button>

      <p className="small">
        <span className="text-danger">URGENT: </span>
        New Zero-day targeting
        Civic VPN gateways.
      </p>

      <p className="small mb-0">
        UPDATE: BlackByte group shifting
        to new C2 infrastructure.
      </p>

    </div>
  );
}
