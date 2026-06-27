import React from "react";
import { Link } from "react-router-dom";
import { campaignRates, formatNumber } from "../../utils/normalizers";
import { campaignStatusClass } from "../../utils/campaignStatus";
import "./RecentCampaignsTabel.css";
import "../Shared/PhishingShared.css";

function StatusBadge({ status }) {
  return (
    <span className={`campaign-status-badge ${campaignStatusClass(status)}`}>
      {status}
    </span>
  );
}

export default function RecentCampaignsTabel({ campaigns = [] }) {
  const rows = campaigns.slice(0, 5);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="text-white mb-2">Recent Campaigns</h6>
          <p>Latest simulation performance</p>
        </div>
        <Link to="/Phishing/Campaigns" className="purple-number text-decoration-none">View all →</Link>
      </div>

      <div className="table-responsive-wrapper">
        <table className="w-100 recent-campigns discover-tabel">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Sent</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Submit Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-secondary text-center py-4">No campaigns yet</td>
              </tr>
            ) : (
              rows.map((campaign) => {
                const rates = campaignRates(campaign);
                return (
                  <tr key={campaign.id}>
                    <td className="ip-address text-white fw-medium px-1">{campaign.name}</td>
                    <td className="mac-address text-secondary text-center">{formatNumber(campaign.sent)}</td>
                    <td className="text-white text-center"><p className="purple-number mb-0">{rates.openRate}%</p></td>
                    <td className="text-white text-center"><p className="orange-number mb-0">{rates.clickRate}%</p></td>
                    <td className="text-white text-center"><p className="red-number mb-0">{rates.submitRate}%</p></td>
                    <td className="py-3 px-1">
                      <StatusBadge status={campaign.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
