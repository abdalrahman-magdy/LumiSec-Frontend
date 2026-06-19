import React from "react";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import { useDashboardRisks } from "../../hooks/usePhishingDashboard";
import { riskLevelClass } from "../../utils/normalizers";
import "../../Components/Shared/PhishingShared.css";

export default function Risks() {
  const { data, loading, error, isMock, reload } = useDashboardRisks();

  if (loading) return <PhishingLoading message="Loading risk scores..." skeleton rows={5} />;

  return (
    <div className="phishing-soc-page">
      <h5 className="text-white">Risk Dashboard</h5>
      <p className="dashboard-desc">User susceptibility heatmap — high risk users highlighted</p>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="row g-3 mb-4">
        {data.map((user) => (
          <div key={user.id} className="col-md-6 col-lg-4">
            <div className={`dashboard-card p-3 heatmap-cell ${riskLevelClass(user.level)}`}>
              <p className="text-white fw-medium mb-1">{user.name}</p>
              <p className="text-secondary mb-2">{user.email}</p>
              <p className="mb-1">Dept: {user.department}</p>
              <h4 className="mb-0">Score: {user.score}</h4>
              <span className="badge mt-2 text-capitalize">{user.level} risk</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-card p-3">
        <table className="w-100 discover-tabel">
          <thead>
            <tr>
              <th>User</th>
              <th>Department</th>
              <th>Risk Score</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td className="text-white">{u.name}<br /><small className="text-secondary">{u.email}</small></td>
                <td className="text-secondary">{u.department}</td>
                <td className="text-white">{u.score}</td>
                <td><span className={`rounded-3 px-2 py-1 ${riskLevelClass(u.level)}`}>{u.level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
