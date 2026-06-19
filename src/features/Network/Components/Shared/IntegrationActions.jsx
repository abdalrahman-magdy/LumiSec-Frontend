import React, { useState } from "react";
import {
  buildIntegrationPayload,
  sendToGrc,
  sendToOpenCti,
  sendToSiem,
  sendToSoar,
  sendToUctc,
} from "../../services/networkApi";
import "./NetworkShared.css";

const ACTIONS = [
  { key: "grc", label: "Send to GRC", icon: "fa-clipboard-check", className: "integration-btn-grc", fn: sendToGrc },
  { key: "soar", label: "Create Incident", icon: "fa-triangle-exclamation", className: "integration-btn-soar", fn: sendToSoar },
  { key: "siem", label: "Send to SIEM", icon: "fa-server", className: "integration-btn-siem", fn: sendToSiem },
  { key: "opencti", label: "Enrich IOC", icon: "fa-magnifying-glass", className: "integration-btn-cti", fn: sendToOpenCti },
  { key: "uctc", label: "UCTC Gap", icon: "fa-shield-halved", className: "integration-btn-cti", fn: sendToUctc },
];

export default function IntegrationActions({ item, source = "network", compact = false, onSuccess }) {
  const [loadingKey, setLoadingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleAction = async (action) => {
    setLoadingKey(action.key);
    setFeedback(null);
    try {
      const payloads = buildIntegrationPayload(source, item);
      await action.fn(payloads[action.key]);
      const msg = `${action.label} succeeded`;
      setFeedback({ type: "success", text: msg });
      onSuccess?.(action.key, item);
    } catch (err) {
      setFeedback({ type: "danger", text: err.message });
    } finally {
      setLoadingKey(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const visibleActions = compact
    ? ACTIONS.filter((a) => ["grc", "soar", "siem", "opencti"].includes(a.key))
    : ACTIONS;

  return (
    <div>
      {feedback && (
        <small className={`d-block mb-1 text-${feedback.type === "success" ? "success" : "danger"}`}>
          {feedback.text}
        </small>
      )}
      <div className="integration-actions">
        {visibleActions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`btn integration-btn ${action.className}`}
            disabled={loadingKey !== null}
            onClick={() => handleAction(action)}
          >
            {loadingKey === action.key ? (
              <i className="fa-solid fa-spinner fa-spin me-1" />
            ) : (
              <i className={`fa-solid ${action.icon} me-1`} />
            )}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
