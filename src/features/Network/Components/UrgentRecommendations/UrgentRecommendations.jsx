import React from "react";
import "./UrgentRecommendations.css";
import IntegrationActions from "../Shared/IntegrationActions";
import { resolveDisplayText } from "../../utils/normalizers";

export default function UrgentRecommendations({ recommendations = [] }) {
  if (!recommendations.length) {
    return <p className="text-secondary">No urgent recommendations.</p>;
  }

  return (
    <div>
      {recommendations.map((rec) => (
        <div key={rec.id} className="row justify-content-between mb-3">
          <div className="col-1">
            <i
              className={`fa-solid fa-triangle-exclamation rounded-3 p-3 ${
                rec.severity === "critical" ? "critical-danger-triangle" : "high-danger-triangle"
              }`}
            />
          </div>
          <div className="col">
            <div className="ms-3">
              <p className="urgent-title mb-1">
                {resolveDisplayText(rec.asset, "Unknown")}:{" "}
                <span className="text-white fw-medium">{resolveDisplayText(rec.title)}</span>
              </p>
              <p className="urgant-text">Priority remediation required — escalate via integrations if needed.</p>
            </div>
            <div className="ms-3 mt-2">
              <IntegrationActions item={rec} source="misconfigurations" compact />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
