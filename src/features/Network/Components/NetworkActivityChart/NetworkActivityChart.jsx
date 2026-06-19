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

const DEFAULT_LABELS = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00"];

export default function NetworkActivityChart({ flowMetrics }) {
  const timeline = flowMetrics?.timeline;
  const activity = flowMetrics?.activitySeries;

  const data = useMemo(() => {
    const labels = timeline?.labels?.length ? timeline.labels : activity?.labels ?? DEFAULT_LABELS;
    const current = timeline?.current?.length ? timeline.current : activity?.inbound ?? [1000, 600, 500, 800, 2000, 3000, 2800];
    const baseline = timeline?.baseline?.length ? timeline.baseline : activity?.outbound ?? [800, 400, 300, 500, 1500, 2000, 1800];
    const threshold = timeline?.threshold?.length ? timeline.threshold : [600, 200, 150, 300, 1000, 1500, 1200];

    return {
      labels,
      datasets: [
        {
          label: "Current",
          data: current,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.2)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Baseline",
          data: baseline,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Threshold",
          data: threshold,
          borderColor: "#eab308",
          backgroundColor: "rgba(234, 179, 8, 0.1)",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [4, 4],
        },
      ],
    };
  }, [flowMetrics, timeline, activity]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: "#9DA3B0" } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
      y: { grid: { color: "#1f2937" }, ticks: { color: "#6b7280" } },
    },
  };

  return (
    <div style={{ height: "400px", backgroundColor: "transparent", padding: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
