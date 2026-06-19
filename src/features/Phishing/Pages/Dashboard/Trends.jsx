import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import PhishingLoading from "../../Components/Shared/PhishingLoading";
import { useDashboardTrends } from "../../hooks/usePhishingDashboard";
import "../../Components/Shared/PhishingShared.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Trends() {
  const { data, loading, error, isMock, reload } = useDashboardTrends();

  const chartData = useMemo(() => ({
    labels: data?.labels ?? [],
    datasets: [
      { label: "Open Rate %", data: data?.openRate ?? [], borderColor: "#06B6D4", tension: 0.3 },
      { label: "Click Rate %", data: data?.clickRate ?? [], borderColor: "#F59E0B", tension: 0.3 },
      { label: "Submit Rate %", data: data?.submitRate ?? [], borderColor: "#EF4444", tension: 0.3 },
    ],
  }), [data]);

  if (loading) return <PhishingLoading message="Loading susceptibility trends..." />;

  return (
    <div className="phishing-soc-page">
      <h5 className="text-white">Susceptibility Trends</h5>
      <p className="dashboard-desc">Time-series phishing susceptibility across campaigns</p>
      <PhishingAlert type="danger" message={error} isMock={isMock} onRetry={reload} />

      <div className="dashboard-card p-3">
        <div style={{ height: 400 }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#9DA3B0" } } },
              scales: {
                x: { ticks: { color: "#6b7280" }, grid: { color: "#1f2937" } },
                y: { ticks: { color: "#6b7280" }, grid: { color: "#1f2937" } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
