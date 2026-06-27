import React from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canCreateCampaigns } from "../../utils/roles";
import { campaignStatusClass, canViewLaunchConsole } from "../../utils/campaignStatus";
import useCampaigns from "../../hooks/useCampaigns";
import "../../Components/Shared/PhishingShared.css";

function StatusBadge({ status }) {
  return (
    <span className={`campaign-status-badge ${campaignStatusClass(status)}`}>
      {status}
    </span>
  );
}

export default function CampaignList() {
  const { campaigns, loading, error, isMock, reload } = useCampaigns();

  if (loading) return <PhishingLoading message="Loading campaigns..." skeleton rows={5} />;

  return (
    <div className="phishing-soc-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="text-white">Campaigns</h5>
          <p className="dashboard-desc">{campaigns.length} total campaigns</p>
        </div>
        <RoleGate allow={canCreateCampaigns}>
          <Link to="/Phishing/Campaigns/create" className="btn add-btn text-white border-0">
            <i className="fa-solid fa-plus me-2" />
            New Campaign
          </Link>
        </RoleGate>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      {campaigns.length === 0 ? (
        <div className="dashboard-card p-4 text-center text-secondary">
          No campaigns yet.{" "}
          <RoleGate allow={canCreateCampaigns}>
            <Link to="/Phishing/Campaigns/create" className="text-white">Create one</Link>
          </RoleGate>{" "}
          to get started.
        </div>
      ) : (
        <div className="dashboard-card p-0 phishing-campaigns-table-wrap">
          <table className="phishing-campaigns-table discover-tabel">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Opened</th>
                <th>Clicked</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="text-white fw-medium">{c.name}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.sent}</td>
                  <td>{c.opened}</td>
                  <td>{c.clicked}</td>
                  <td className={c.submitted > 10 ? "text-danger fw-bold" : ""}>{c.submitted}</td>
                  <td>
                    <div className="phishing-table-actions phishing-table-actions-fill">
                      <Link
                        to={`/Phishing/Campaigns/${c.id}`}
                        className="btn btn-sm phishing-campaign-action phishing-action-details"
                        title="View campaign details"
                      >
                        <i className="fa-solid fa-eye me-1" />
                        Details
                      </Link>
                      {canViewLaunchConsole(c.status) && (
                        <Link
                          to={`/Phishing/Campaigns/${c.id}/launch`}
                          className="btn btn-sm phishing-campaign-action phishing-action-console"
                          title="Open launch console"
                        >
                          <i className="fa-solid fa-rocket me-1" />
                          Launch
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
