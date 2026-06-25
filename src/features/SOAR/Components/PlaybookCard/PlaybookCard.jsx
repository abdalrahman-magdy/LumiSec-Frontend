import React from "react";

import "./playbook.css"

export default function PlaybookCard({ onOpen }) {
  return (
    <div className="dashboard-card playbook side-card">

      <h6 className="card-title-small">
        LIVE PLAYBOOK STREAM
      </h6>
      <button className="side-card-action" type="button" onClick={onOpen}>Open Stream</button>

      <div className="mb-3">

        <div className="mb-3">
          <div className="vertical-line-purple position-relative"></div>

          <div className="ps-3">
            <p className="fw-bold text-white mb-0">Containment: SRV-01</p>
            <p>Step: Isolate Host | Progress: 75%</p>

            <div className="progress mt-1">
              <div
                className="progress-bar"
                style={{ width: "75%" }}>
              </div>
            </div>

          </div>
        </div>

        <div>
          <div className="vertical-line-green position-relative"></div>
          <div className="ps-3">
            <p className="fw-bold text-white mb-0">Email Triage Flow</p>
            <p className="desc small mb-0">Status: 42 Malicious Links Purged</p>
          </div>
        </div>
        </div>

    </div>
  );
}
