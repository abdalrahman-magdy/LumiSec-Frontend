import React, { useState } from "react";
import {
  buildIntegrationPayload,
  pushToGrc,
  pushToOpenCti,
  pushToSiem,
  pushToSoar,
} from "../../services/phishingApi";
import { canUseIntegrations } from "../../utils/roles";
import "./PhishingShared.css";

const ACTIONS = [
  { key: "grc", label: "Push to GRC", icon: "fa-clipboard-check", fn: (p) => pushToGrc(p.grc) },
  { key: "soar", label: "Create Incident", icon: "fa-triangle-exclamation", fn: (p) => pushToSoar(p.soar) },
  { key: "siem", label: "Send to SIEM", icon: "fa-server", fn: (p) => pushToSiem(p.siem) },
  { key: "opencti", label: "Push IOC", icon: "fa-magnifying-glass", fn: (p) => pushToOpenCti(p.opencti) },
];

export default function PhishingIntegrationActions({ campaign, compact = false }) {
  const [loadingKey, setLoadingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (!canUseIntegrations()) return null;

  const handleAction = async (action) => {
    setLoadingKey(action.key);
    try {
      const payloads = buildIntegrationPayload(campaign);
      if (!payloads[action.key]) throw new Error("This integration needs more backend context first.");
      await action.fn(payloads);
      setFeedback({ type: "success", text: `${action.label} queued` });
    } catch (err) {
      setFeedback({ type: "danger", text: err.message });
    } finally {
      setLoadingKey(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div>
      {feedback && (
        <small className={`d-block mb-1 text-${feedback.type === "success" ? "success" : "danger"}`}>
          {feedback.text}
        </small>
      )}
      <div className="integration-actions">
        {ACTIONS.filter((action) => buildIntegrationPayload(campaign)[action.key]).map((action) => (
          <button
            key={action.key}
            type="button"
            className="btn integration-btn"
            disabled={loadingKey !== null}
            onClick={() => handleAction(action)}
          >
            {loadingKey === action.key ? (
              <i className="fa-solid fa-spinner fa-spin me-1" />
            ) : (
              <i className={`fa-solid ${action.icon} me-1`} />
            )}
            {!compact && action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
