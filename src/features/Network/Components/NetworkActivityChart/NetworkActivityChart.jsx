import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip);

export default function NetworkActivityChart({ flowMetrics }) {
  const timeline = flowMetrics?.timeline;
  const activity = flowMetrics?.activitySeries;

  const hasLiveData = Boolean(
    timeline?.current?.length
    || timeline?.baseline?.length
    || activity?.inbound?.length
    || activity?.outbound?.length
  );

  const data = useMemo(() => {
    if (!hasLiveData) {
      return { labels: [], datasets: [] };
    }

    const labels = timeline?.labels?.length ? timeline.labels : activity?.labels ?? [];
    const current = timeline?.current?.length ? timeline.current : activity?.inbound ?? [];
    const baseline = timeline?.baseline?.length ? timeline.baseline : activity?.outbound ?? [];
    const threshold = timeline?.threshold?.length ? timeline.threshold : [];

    const datasets = [
      {
        label: "Current PPS",
        data: current,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ];

    if (baseline.length) {
      datasets.push({
        label: "Baseline",
        data: baseline,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      });
    }

    if (threshold.length) {
      datasets.push({
        label: "Threshold",
        data: threshold,
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [4, 4],
      });
    }

    return { labels, datasets };
  }, [activity, hasLiveData, timeline]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: "#9DA3B0" } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
      y: { grid: { color: "#1f2937" }, ticks: { color: "#6b7280" }, beginAtZero: true },
    },
  };

  if (!hasLiveData) {
    return (
      <div
        className="d-flex align-items-center justify-content-center text-secondary"
        style={{ height: "400px", padding: "20px" }}
      >
        No flow metrics yet. Run packet capture to populate live network activity.
      </div>
    );
  }

  return (
    <div style={{ height: "400px", backgroundColor: "transparent", padding: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
