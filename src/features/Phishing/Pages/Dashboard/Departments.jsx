import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import DepartmentRisk from "../../Components/DepartmentRisk/DepartmentRisk";
import { useDashboardDepartments } from "../../hooks/usePhishingDashboard";
import "../../Components/Shared/PhishingShared.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function Departments() {
  const { data, loading, error, isMock, reload } = useDashboardDepartments();

  if (loading) return <PhishingLoading message="Loading department breakdown..." />;

  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [{
      label: "Vulnerability %",
      data: data.map((d) => d.vulnerability),
      backgroundColor: data.map((d) => (d.vulnerability >= 70 ? "#EF4444" : d.vulnerability >= 50 ? "#F59E0B" : "#10B981")),
      borderRadius: 8,
    }],
  };

  return (
    <div className="phishing-soc-page">
      <h5 className="text-white">Department Breakdown</h5>
      <p className="dashboard-desc">Vulnerability per department — HR, IT, Finance, etc.</p>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="row g-3">
        <div className="col-lg-8 dashboard-card p-3">
          <h6 className="text-white mb-3">Department Vulnerability</h6>
          <div style={{ height: 320 }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="col-lg-4 dashboard-card p-3">
          <DepartmentRisk />
        </div>
      </div>

      <div className="dashboard-card p-3 mt-3">
        <table className="w-100 discover-tabel">
          <thead>
            <tr><th>Department</th><th>Employees</th><th>Clicked</th><th>Vulnerability</th></tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.department}>
                <td className="text-white">{d.department}</td>
                <td>{d.employees}</td>
                <td>{d.clicked}</td>
                <td><span className={d.vulnerability >= 70 ? "phishing-risk-high px-2 rounded" : d.vulnerability >= 50 ? "phishing-risk-medium px-2 rounded" : "phishing-risk-low px-2 rounded"}>{d.vulnerability}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
