import React from "react";
import { Link, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import PhishingIntegrationActions from "../../Components/Shared/PhishingIntegrationActions";
import EventTimeline from "../../Components/Shared/EventTimeline";
import RoleGate from "../../Components/Shared/RoleGate";
import { canLaunchCampaigns, canManageCampaigns } from "../../utils/roles";
import useCampaigns from "../../hooks/useCampaigns";
import useTracking from "../../hooks/useTracking";
import "../../Components/Shared/PhishingShared.css";

export default function CampaignDetails() {
  const { id } = useParams();
  const { campaign, loading, error, isMock, reload, pauseCampaign, resumeCampaign, stopCampaign } = useCampaigns(id);
  const { events } = useTracking(id, true);

  const handleControl = async (fn) => {
    await fn(id);
    reload();
  };

  if (loading) return <PhishingLoading message="Loading campaign..." />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="text-white">{campaign?.name}</h5>
          <p className="dashboard-desc text-capitalize">Status: {campaign?.status}</p>
        </div>
        <div className="d-flex gap-2">
          <RoleGate allow={canLaunchCampaigns}>
            <Link to={`/Phishing/Campaigns/${id}/launch`} className="btn add-btn text-white border-0">Launch Console</Link>
          </RoleGate>
          <RoleGate allow={canLaunchCampaigns}>
            {campaign?.status === "active" && (
              <button type="button" className="btn integration-btn" onClick={() => handleControl(pauseCampaign)}>Pause</button>
            )}
            {campaign?.status === "paused" && (
              <button type="button" className="btn integration-btn" onClick={() => handleControl(resumeCampaign)}>Resume</button>
            )}
            <button type="button" className="btn integration-btn" onClick={() => handleControl(stopCampaign)}>Stop</button>
          </RoleGate>
        </div>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="row g-3 mb-3">
        <div className="col-md-3 dashboard-card p-3"><p className="text-secondary mb-1">Recipients</p><h4 className="text-white">{campaign?.recipientsCount}</h4></div>
        <div className="col-md-3 dashboard-card p-3"><p className="text-secondary mb-1">Opened</p><h4 className="text-white">{campaign?.opened}</h4></div>
        <div className="col-md-3 dashboard-card p-3"><p className="text-secondary mb-1">Clicked</p><h4 className="text-warning">{campaign?.clicked}</h4></div>
        <div className="col-md-3 dashboard-card p-3"><p className="text-secondary mb-1">Submitted</p><h4 className="text-danger">{campaign?.submitted}</h4></div>
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
    </div>
  );
}
