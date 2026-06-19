import React from "react";
import "./NetworkShared.css";

function resolveAlertType(error, type) {
  if (error?.isRateLimit) return "warning";
  if (error?.isBackendIncident) return "incident";
  return type;
}

function resolveTitle(error, title) {
  if (title) return title;
  if (error?.isBackendIncident) return "Backend Incident";
  if (error?.isRateLimit) return "Rate Limit Exceeded";
  return null;
}

export default function NetworkAlert({
  type = "danger",
  message,
  error = null,
  title,
  onRetry,
  onDismiss,
}) {
  const err = error ?? (typeof message === "object" ? message : null);
  const text = err?.message ?? (typeof message === "string" ? message : null);
  if (!text) return null;

  const alertType = resolveAlertType(err, type);
  const alertTitle = resolveTitle(err, title);

  return (
    <div
      className={`network-alert network-alert-${alertType} d-flex justify-content-between align-items-center mb-3`}
      role="alert"
    >
      <div>
        {alertTitle && <strong className="d-block mb-1">{alertTitle}</strong>}
        {text}
      </div>
      <div className="d-flex gap-2">
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm network-retry-btn"
            onClick={onRetry}
          >
            <i className="fa-solid fa-arrow-rotate-right me-1" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn btn-sm btn-link text-white"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
    </div>
  );
}
