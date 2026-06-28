import React, { useCallback, useEffect, useState } from "react";
import "./PhishingSettings.css";
import PhishingAlert from "../Components/Shared/PhishingAlert";
import RoleGate from "../Components/Shared/RoleGate";
import { getPhishingSettings, updatePhishingSettings } from "../services/phishingApi";
import { canManageSettings } from "../utils/roles";

const FROM_SOURCE_LABELS = {
  database: "Saved in platform",
  environment: "From server environment (SMTP_FROM)",
  default: "Platform default",
};

const TRACKING_SOURCE_LABELS = {
  database: "Saved in platform",
  environment: "From server environment (API_PUBLIC_URL)",
  request: "Auto-detected from API host",
  campaign: "Set on campaign",
  launch: "Set at launch",
  default: "Local development default",
};

export default function PhishingSettings() {
  const [fromAddress, setFromAddress] = useState("");
  const [savedFromAddress, setSavedFromAddress] = useState("");
  const [trackingDomainOverride, setTrackingDomainOverride] = useState("");
  const [savedTrackingDomainOverride, setSavedTrackingDomainOverride] = useState("");
  const [resolvedTrackingDomain, setResolvedTrackingDomain] = useState("");
  const [source, setSource] = useState("");
  const [trackingDomainSource, setTrackingDomainSource] = useState("");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [trackingDomainIsLocal, setTrackingDomainIsLocal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMock, setIsMock] = useState(false);

  const applySettings = (data, storedOverride = "") => {
    setFromAddress(data.fromAddress ?? "");
    setSavedFromAddress(data.fromAddress ?? "");
    setTrackingDomainOverride(storedOverride);
    setSavedTrackingDomainOverride(storedOverride);
    setResolvedTrackingDomain(data.trackingDomain ?? "");
    setSource(data.source ?? "");
    setTrackingDomainSource(data.trackingDomainSource ?? "");
    setSmtpConfigured(Boolean(data.smtpConfigured));
    setTrackingDomainIsLocal(Boolean(data.trackingDomainIsLocal));
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, isMock: mock } = await getPhishingSettings();
      const storedOverride = data.trackingDomainSource === "database" ? (data.trackingDomain ?? "") : "";
      applySettings(data, storedOverride);
      setIsMock(mock);
    } catch (err) {
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data, isMock: mock } = await updatePhishingSettings({
        fromAddress,
        trackingDomain: trackingDomainOverride,
      });
      const storedOverride = data.trackingDomainSource === "database" ? (data.trackingDomain ?? "") : trackingDomainOverride;
      applySettings(data, storedOverride);
      setIsMock(mock);
      setSuccess("Settings saved. New campaigns will use these values.");
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = fromAddress.trim() !== savedFromAddress.trim()
    || trackingDomainOverride.trim() !== savedTrackingDomainOverride.trim();
  const canEdit = canManageSettings();
  const activeTrackingDomain = resolvedTrackingDomain || trackingDomainOverride;

  return (
    <div className="w-75">
      <div>
        <h5 className="text-white">Settings</h5>
        <p className="dashboard-desc">Email sender and tracking configuration for phishing simulations</p>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={loadSettings} />
      <PhishingAlert type="success" message={success} />

      {loading ? (
        <p className="text-white-50">Loading settings...</p>
      ) : (
        <form onSubmit={handleSave}>
          <div className="dashboard-card mb-3">
            <p className="text-white mb-0">Email Configuration</p>
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="pe-4">
                <p className="text-white mb-0">From Address</p>
                <p className="mb-0">Sender shown on simulation emails.</p>
              </div>
              <input
                type="text"
                className="form-control w-50 ps-2 header-search-input"
                value={fromAddress}
                onChange={(event) => setFromAddress(event.target.value)}
                placeholder='LumiSec Support <support@lumisec.tech>'
                disabled={!canEdit || saving}
                required
              />
            </div>

            <div className="d-flex flex-wrap gap-3 align-items-center">
              <span className={`badge ${smtpConfigured ? "bg-success" : "bg-secondary"}`}>
                SMTP {smtpConfigured ? "configured" : "not configured"}
              </span>
              {source && (
                <span className="text-white-50 small">{FROM_SOURCE_LABELS[source] ?? source}</span>
              )}
            </div>
          </div>

          <div className="dashboard-card mb-3">
            <p className="text-white mb-0">Open &amp; Click Tracking</p>
            <hr />
            <p className="mb-3">
              Tracking URLs are embedded in simulation emails. On deploy, set <code>API_PUBLIC_URL</code> in the backend
              {" "}(e.g. <code>https://api.lumisec.tech</code>) — we append <code>/api/phishing</code> automatically.
              Leave the override empty to use auto-detection.
            </p>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="pe-4">
                <p className="text-white mb-0">Tracking URL override</p>
                <p className="mb-0">Optional. Full base or API root — empty uses env or request host.</p>
              </div>
              <input
                type="url"
                className="form-control w-50 ps-2 header-search-input"
                value={trackingDomainOverride}
                onChange={(event) => setTrackingDomainOverride(event.target.value)}
                placeholder="https://api.lumisec.tech"
                disabled={!canEdit || saving}
              />
            </div>

            <p className="text-white-50 small mb-2">
              Active tracking base: <code className="text-white">{activeTrackingDomain || "—"}</code>
            </p>
            {trackingDomainSource && (
              <p className="text-white-50 small mb-2">
                Source: {TRACKING_SOURCE_LABELS[trackingDomainSource] ?? trackingDomainSource}
              </p>
            )}
            {trackingDomainIsLocal ? (
              <p className="text-warning small mb-0">
                Localhost tracking — open pixels will <strong>not</strong> fire when recipients open the email in
                Gmail or Outlook web (only link clicks from your browser may register). Set a public HTTPS URL in
                Phishing Settings (e.g. <code>https://api.lumisec.tech/api/phishing</code>) or add{" "}
                <code>NGROK_URL</code> / <code>API_PUBLIC_URL</code> to the server env, then re-send emails.
              </p>
            ) : (
              <p className="text-white-50 small mb-0">
                Public tracking URL is configured. When a recipient opens an email, their mail client loads the
                tracking pixel and open rate updates automatically — no link click required.
              </p>
            )}
          </div>

          <RoleGate
            allow={canManageSettings}
            fallback={
              <p className="text-white-50 small">
                You can view settings. Only phishing managers can change them.
              </p>
            }
          >
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="save-btn p-2 rounded-3 text-white border-0"
                disabled={saving || !isDirty || !fromAddress.trim()}
              >
                <i className="fa-solid text-white fa-save pe-2" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </RoleGate>
        </form>
      )}
    </div>
  );
}
