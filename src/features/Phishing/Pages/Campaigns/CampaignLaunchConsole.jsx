import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import EventTimeline from "../../Components/Shared/EventTimeline";
import RoleGate from "../../Components/Shared/RoleGate";
import { canLaunchCampaigns } from "../../utils/roles";
import useCampaigns from "../../hooks/useCampaigns";
import useTracking from "../../hooks/useTracking";
import "../../Components/Shared/PhishingShared.css";

export default function CampaignLaunchConsole() {
  const { id } = useParams();
  const { campaign, queue, loading, error, isMock, loadQueue, launchCampaign, pauseCampaign, resumeCampaign, stopCampaign, reload } = useCampaigns(id);
  const { events } = useTracking(id, true);
  const [launching, setLaunching] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadQueue(id);
    const interval = setInterval(() => loadQueue(id), 2000);
    return () => clearInterval(interval);
  }, [id, loadQueue]);

  const progress = queue ? Math.round((queue.sent / queue.total) * 100) : 0;

  const handleLaunch = async () => {
    setLaunching(true);
    setActionError(null);
    try {
      await launchCampaign(id);
      await loadQueue(id);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  if (loading && !campaign) return <PhishingLoading message="Loading launch console..." />;

  return (
    <RoleGate allow={canLaunchCampaigns} fallback={<p className="text-danger p-3">Launch access denied for your role.</p>}>
      <div className="phishing-soc-page">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="text-white">Launch Console — {campaign?.name}</h5>
            <p className="dashboard-desc">Email queue worker & live monitoring</p>
          </div>
          <Link to={`/Phishing/Campaigns/${id}`} className="btn integration-btn">Back to Details</Link>
        </div>

        <PhishingAlert type="danger" message={error || actionError} isMock={isMock} />

        <div className="row g-3 mb-3">
          <div className="col-lg-8 dashboard-card p-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-white">Queue Progress</span>
              <span className="text-secondary">{progress}% — {queue?.sent ?? 0}/{queue?.total ?? 0} sent</span>
            </div>
            <div className="scan-progress-bar mb-3">
              <div className="scan-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-secondary mb-2">Status: <span className="text-white text-capitalize">{queue?.status ?? campaign?.status}</span></p>
            <p className="text-secondary">Pending: {queue?.pending ?? 0} | Failed: {queue?.failed ?? 0}</p>

            <div className="d-flex gap-2 mt-3 flex-wrap">
              <button type="button" className="btn add-btn text-white border-0" disabled={launching} onClick={handleLaunch}>
                {launching ? <i className="fa-solid fa-spinner fa-spin me-1" /> : <i className="fa-solid fa-play me-1" />}
                Launch Campaign
              </button>
              <button type="button" className="btn integration-btn" onClick={() => pauseCampaign(id)}>Pause</button>
              <button type="button" className="btn integration-btn" onClick={() => resumeCampaign(id)}>Resume</button>
              <button type="button" className="btn integration-btn text-danger" onClick={() => stopCampaign(id)}>Stop</button>
            </div>

            <div className="launch-console-log mt-3">
              <p className="text-white mb-2">Worker Logs</p>
              {(queue?.logs ?? []).map((log, i) => (
                <div key={i} className="log-line">[{log.time}] {log.message}</div>
              ))}
            </div>
          </div>

          <div className="col-lg-4 dashboard-card p-3">
            <h6 className="text-white mb-3">Live Events</h6>
            <EventTimeline events={events.slice(0, 8)} live />
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
