import React from "react";
import { Link } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import RoleGate from "../../Components/Shared/RoleGate";
import { canManageCampaigns } from "../../utils/roles";
import useCampaigns from "../../hooks/useCampaigns";
import "../../Components/Shared/PhishingShared.css";

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
        <RoleGate allow={canManageCampaigns}>
          <Link to="/Phishing/Campaigns/create" className="btn add-btn text-white border-0">
            <i className="fa-solid fa-plus me-2" />New Campaign
          </Link>
        </RoleGate>
      </div>

      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="dashboard-card p-0">
        <table className="w-100 discover-tabel">
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
                <td><span className="badge text-capitalize">{c.status}</span></td>
                <td>{c.sent}</td>
                <td>{c.opened}</td>
                <td>{c.clicked}</td>
                <td className={c.submitted > 10 ? "text-danger fw-bold" : ""}>{c.submitted}</td>
                <td>
                  <Link to={`/Phishing/Campaigns/${c.id}`} className="btn btn-sm integration-btn me-1">Details</Link>
                  {c.status === "active" && (
                    <Link to={`/Phishing/Campaigns/${c.id}/launch`} className="btn btn-sm integration-btn">Console</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
