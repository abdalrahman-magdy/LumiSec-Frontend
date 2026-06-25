import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrafficFlowChart({ metrics }) {
  const timeline = useMemo(() => metrics?.timeline ?? {}, [metrics?.timeline]);

  const data = useMemo(() => {
    const labels = timeline.labels ?? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    const current = timeline.current ?? [2500, 3200, 3500, 11000, 2700, 6000, 9000];
    const threshold = timeline.threshold ?? current.map(() => 8000);

    return {
      labels,
      datasets: [
        {
          label: "Current PPS",
          data: current,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          fill: true,
          tension: 0.3,
          pointRadius: (ctx) => (ctx.raw > (metrics?.avgPps ?? 8000) * 1.5 ? 6 : 0),
          pointBackgroundColor: "#ef4444",
          pointBorderColor: "#fff",
        },
        {
          label: "3σ Threshold",
          data: threshold,
          borderColor: "#f97316",
          borderDash: [8, 4],
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [metrics?.avgPps, timeline]);

  const maxVal = Math.max(...(timeline.current ?? [12000]), ...(timeline.threshold ?? [8000]), 12000);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "end", labels: { color: "#94a3b8", usePointStyle: true } },
    },
    scales: {
      y: {
        min: 0,
        max: maxVal * 1.1,
        ticks: { color: "#475569" },
        grid: { color: "#1e293b" },
      },
      x: {
        ticks: { color: "#475569" },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ height: "400px", width: "100%", backgroundColor: "#0f172a", padding: "20px", borderRadius: "10px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
