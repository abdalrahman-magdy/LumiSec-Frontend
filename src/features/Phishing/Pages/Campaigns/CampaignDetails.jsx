import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingConfirmModal from "../../Components/Shared/PhishingConfirmModal";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import PhishingIntegrationActions from "../../Components/Shared/PhishingIntegrationActions";
import EventTimeline from "../../Components/Shared/EventTimeline";
import RoleGate from "../../Components/Shared/RoleGate";
import { canDeleteCampaigns, canLaunchCampaigns, canManageCampaigns } from "../../utils/roles";
import {
  campaignStatusClass,
  canDeleteCampaign,
  canPauseCampaign,
  canResumeCampaign,
  canStopCampaign,
  canViewLaunchConsole,
} from "../../utils/campaignStatus";
import useCampaigns from "../../hooks/useCampaigns";
import useTracking from "../../hooks/useTracking";
import CampaignManagePanel from "./CampaignManagePanel";
import CampaignReportsPanel from "./CampaignReportsPanel";
import { deleteCampaign } from "../../services/phishingApi";
import "../../Components/Shared/PhishingShared.css";
function StatusBadge({ status }) {
  return (
    <span className={`campaign-status-badge ${campaignStatusClass(status)}`}>
      {status}
    </span>
  );
}

export default function CampaignDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { campaign, loading, error, isMock, reload, pauseCampaign, resumeCampaign, stopCampaign } = useCampaigns(id);
  const { events } = useTracking(id, true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pendingStop, setPendingStop] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleControl = async (fn, actionName) => {
    setActionLoading(actionName);
    setActionError(null);
    try {
      await fn(id);
      await reload();
    } catch (err) {
      setActionError(err.message ?? "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmStop = async () => {
    setPendingStop(false);
    await handleControl(stopCampaign, "stop");
  };

  const confirmDelete = async () => {
    setPendingDelete(false);
    setDeleting(true);
    setActionError(null);
    try {
      await deleteCampaign(id);
      navigate("/Phishing/Campaigns");
    } catch (err) {
      setActionError(err.message ?? "Could not delete campaign.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PhishingLoading message="Loading campaign..." />;

  const status = campaign?.status;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
        <div>
          <Link to="/Phishing/Campaigns" className="phishing-list-btn small d-inline-block mb-2">
            <i className="fa-solid fa-arrow-left me-1" aria-hidden />
            All campaigns
          </Link>
          <h5 className="text-white mb-2">{campaign?.name}</h5>
          <StatusBadge status={status} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {canViewLaunchConsole(status) && (
            <RoleGate allow={canLaunchCampaigns}>
              <Link to={`/Phishing/Campaigns/${id}/launch`} className="btn phishing-campaign-action phishing-action-console">
                <i className="fa-solid fa-rocket me-1" />
                Launch Console
              </Link>
            </RoleGate>
          )}
          <RoleGate allow={canLaunchCampaigns}>
            {canPauseCampaign(status) && (
              <button
                type="button"
                className="btn phishing-campaign-action phishing-action-pause"
                disabled={Boolean(actionLoading)}
                onClick={() => handleControl(pauseCampaign, "pause")}
              >
                {actionLoading === "pause" ? (
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                ) : (
                  <i className="fa-solid fa-pause me-1" />
                )}
                Pause
              </button>
            )}
            {canResumeCampaign(status) && (
              <button
                type="button"
                className="btn phishing-campaign-action phishing-action-resume"
                disabled={Boolean(actionLoading)}
                onClick={() => handleControl(resumeCampaign, "resume")}
              >
                {actionLoading === "resume" ? (
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                ) : (
                  <i className="fa-solid fa-play me-1" />
                )}
                Resume
              </button>
            )}
            {canStopCampaign(status) && (
              <button
                type="button"
                className="btn phishing-campaign-action phishing-action-stop"
                disabled={Boolean(actionLoading)}
                onClick={() => setPendingStop(true)}
              >
                <i className="fa-solid fa-stop me-1" />
                Stop
              </button>
            )}
          </RoleGate>
          <RoleGate allow={canDeleteCampaigns}>
            {canDeleteCampaign(status) && (
              <button
                type="button"
                className="btn phishing-campaign-action phishing-action-stop"
                disabled={deleting}
                onClick={() => setPendingDelete(true)}
              >
                <i className="fa-solid fa-trash me-1" />
                Delete
              </button>
            )}
          </RoleGate>
        </div>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />
      <PhishingAlert type="danger" message={actionError} />

      <CampaignManagePanel campaign={campaign} onUpdated={reload} />

      <CampaignReportsPanel campaignId={id} campaignName={campaign?.name} />

      <div className="row g-3 mb-3">
        <div className="col-md-3 dashboard-card p-3">
          <p className="text-secondary mb-1">Recipients</p>
          <h4 className="text-white">{campaign?.recipientsCount ?? 0}</h4>
        </div>
        <div className="col-md-3 dashboard-card p-3">
          <p className="text-secondary mb-1">Opened</p>
          <h4 className="text-white">{campaign?.opened ?? 0}</h4>
        </div>
        <div className="col-md-3 dashboard-card p-3">
          <p className="text-secondary mb-1">Clicked</p>
          <h4 className="text-warning">{campaign?.clicked ?? 0}</h4>
        </div>
        <div className="col-md-3 dashboard-card p-3">
          <p className="text-secondary mb-1">Submitted</p>
          <h4 className="text-danger">{campaign?.submitted ?? 0}</h4>
        </div>
      </div>

      <RoleGate allow={canManageCampaigns}>
        <div className="dashboard-card p-3 mb-3">
          <h6 className="text-white mb-2">Integrations</h6>
          <PhishingIntegrationActions campaign={campaign} />
        </div>
      </RoleGate>

      <div className="dashboard-card p-3">
        <h6 className="text-white mb-3">Live Tracking Events</h6>
        <EventTimeline events={events} live />
      </div>

      <PhishingConfirmModal
        show={pendingStop}
        title="Stop campaign?"
        message={`"${campaign?.name}" will be cancelled. Emails already queued may still send, but the campaign will no longer be active.`}
        confirmLabel="Stop campaign"
        onConfirm={confirmStop}
        onClose={() => !actionLoading && setPendingStop(false)}
        loading={actionLoading === "stop"}
        error={actionLoading === "stop" ? actionError : null}
      />

      <PhishingConfirmModal
        show={pendingDelete}
        title="Delete campaign?"
        message={`Permanently delete "${campaign?.name}" and all its recipients? This cannot be undone.`}
        confirmLabel="Delete campaign"
        onConfirm={confirmDelete}
        onClose={() => !deleting && setPendingDelete(false)}
        loading={deleting}
        error={deleting ? actionError : null}
      />
    </div>
  );
}
