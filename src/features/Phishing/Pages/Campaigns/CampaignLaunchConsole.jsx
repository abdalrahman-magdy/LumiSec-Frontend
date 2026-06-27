import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import EventTimeline from "../../Components/Shared/EventTimeline";
import RoleGate from "../../Components/Shared/RoleGate";
import { canLaunchCampaigns } from "../../utils/roles";
import {
  CAMPAIGN_STATUS,
  canLaunchCampaign,
  canPauseCampaign,
  canResumeCampaign,
  canStopCampaign,
  normalizeCampaignStatus,
} from "../../utils/campaignStatus";
import useCampaigns from "../../hooks/useCampaigns";
import useTracking from "../../hooks/useTracking";
import "../../Components/Shared/PhishingShared.css";

export default function CampaignLaunchConsole() {
  const { id } = useParams();
  const {
    campaign,
    queue,
    loading,
    error,
    isMock,
    loadQueue,
    launchCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    reload,
  } = useCampaigns(id);
  const { events } = useTracking(id, true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [lifecycleSuccess, setLifecycleSuccess] = useState(null);
  const [launchResult, setLaunchResult] = useState(null);
  const [pendingStop, setPendingStop] = useState(false);

  const status = normalizeCampaignStatus(campaign?.status ?? queue?.status);
  const isRunning = status === CAMPAIGN_STATUS.RUNNING;
  const progress = queue?.total ? Math.round((queue.sent / queue.total) * 100) : 0;

  useEffect(() => {
    if (!id) return;
    loadQueue(id);
    const interval = setInterval(() => loadQueue(id), 2000);
    return () => clearInterval(interval);
  }, [id, loadQueue]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => reload(), 5000);
    return () => clearInterval(interval);
  }, [isRunning, reload]);

  const runAction = async (fn, actionName) => {
    setActionLoading(actionName);
    setActionError(null);
    setLifecycleSuccess(null);
    try {
      const res = await fn(id);
      if (actionName === "launch" && res?.data?.queued != null) {
        setLaunchResult(`Queued ${res.data.queued} email${res.data.queued === 1 ? "" : "s"} for delivery.`);
      } else if (actionName === "pause") {
        setLifecycleSuccess("Campaign paused.");
      } else if (actionName === "resume") {
        setLifecycleSuccess("Campaign resumed — emails will continue sending.");
      } else if (actionName === "stop") {
        setLifecycleSuccess("Campaign stopped.");
      }
      await loadQueue(id);
      await reload();
    } catch (err) {
      setActionError(err.message ?? "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmStop = async () => {
    setPendingStop(false);
    await runAction(stopCampaign, "stop");
  };

  if (loading && !campaign) return <PhishingLoading message="Loading launch console..." />;

  return (
    <RoleGate allow={canLaunchCampaigns} fallback={<p className="text-danger p-3">Launch access denied for your role.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <Link to={`/Phishing/Campaigns/${id}`} className="phishing-list-btn small d-inline-block mb-2">
              <i className="fa-solid fa-arrow-left me-1" aria-hidden />
              Back to details
            </Link>
            <h5 className="text-white mb-0">Launch Console — {campaign?.name}</h5>
            <p className="dashboard-desc mb-0">
              {isRunning ? "Monitoring active send queue" : "Email queue worker & live monitoring"}
            </p>
          </div>
          <Link to="/Phishing/Campaigns" className="phishing-list-btn">
            <i className="fa-solid fa-list me-1" aria-hidden />
            All campaigns
          </Link>
        </div>

        <PhishingAlert type="danger" message={error} isMock={isMock} />
        <PhishingAlert type="danger" message={actionError} />
        <PhishingAlert type="success" message={launchResult || lifecycleSuccess} />

        {isRunning && (
          <div className="dashboard-card p-3 mb-3">
            <p className="text-secondary small mb-0">
              <i className="fa-solid fa-circle-info me-1 text-success" />
              Campaign is <strong className="text-white">running</strong>. Launch is disabled — use Pause, Resume, or Stop below.
              Stats refresh every 5 seconds.
            </p>
          </div>
        )}

        <div className="row g-3 mb-3">
          <div className="col-lg-8 dashboard-card p-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-white">Queue Progress</span>
              <span className="text-secondary">
                {progress}% — {queue?.sent ?? 0}/{queue?.total ?? 0} sent
              </span>
            </div>
            <div className="scan-progress-bar mb-3">
              <div className="scan-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-secondary mb-2">
              Status: <span className="text-white text-capitalize">{status}</span>
            </p>
            <p className="text-secondary">Pending: {queue?.pending ?? 0} | Failed: {queue?.failed ?? 0}</p>

            <div className="d-flex gap-2 mt-3 flex-wrap">
              {canLaunchCampaign(status) && (
                <button
                  type="button"
                  className="btn phishing-campaign-action phishing-action-launch"
                  disabled={actionLoading === "launch"}
                  onClick={() => runAction(launchCampaign, "launch")}
                >
                  {actionLoading === "launch" ? (
                    <i className="fa-solid fa-spinner fa-spin me-1" aria-hidden />
                  ) : (
                    <i className="fa-solid fa-play me-1" aria-hidden />
                  )}
                  Launch Campaign
                </button>
              )}
              {canPauseCampaign(status) && (
                <button
                  type="button"
                  className="btn phishing-campaign-action phishing-action-pause"
                  disabled={Boolean(actionLoading)}
                  onClick={() => runAction(pauseCampaign, "pause")}
                >
                  {actionLoading === "pause" ? "Pausing..." : "Pause"}
                </button>
              )}
              {canResumeCampaign(status) && (
                <button
                  type="button"
                  className="btn phishing-campaign-action phishing-action-resume"
                  disabled={Boolean(actionLoading)}
                  onClick={() => runAction(resumeCampaign, "resume")}
                >
                  {actionLoading === "resume" ? "Resuming..." : "Resume"}
                </button>
              )}
              {canStopCampaign(status) && (
                <button
                  type="button"
                  className="btn phishing-campaign-action phishing-action-stop"
                  disabled={Boolean(actionLoading)}
                  onClick={() => setPendingStop(true)}
                >
                  Stop
                </button>
              )}
            </div>

            {!canLaunchCampaign(status) && !canPauseCampaign(status) && !canResumeCampaign(status) && !canStopCampaign(status) && (
              <p className="text-secondary small mt-3 mb-0">
                No lifecycle actions available for a {status} campaign.
              </p>
            )}

            <div className="launch-console-log mt-3">
              <p className="text-white mb-2">Worker Logs</p>
              {(queue?.logs ?? []).length === 0 ? (
                <p className="text-secondary small mb-0">No worker logs yet — ensure email worker and Redis are running.</p>
              ) : (
                (queue?.logs ?? []).map((log, i) => (
                  <div key={i} className="log-line">[{log.time}] {log.message}</div>
                ))
              )}
            </div>
          </div>

          <div className="col-lg-4 dashboard-card p-3">
            <h6 className="text-white mb-3">Live Events</h6>
            <EventTimeline events={events.slice(0, 8)} live />
          </div>
        </div>

        <PhishingConfirmModal
          show={pendingStop}
          title="Stop campaign?"
          message={`Cancel "${campaign?.name}"? This cannot be undone.`}
          confirmLabel="Stop campaign"
          onConfirm={confirmStop}
          onClose={() => !actionLoading && setPendingStop(false)}
          loading={actionLoading === "stop"}
        />
      </div>
    </RoleGate>
  );
}
