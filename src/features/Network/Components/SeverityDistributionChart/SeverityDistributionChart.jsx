import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SeverityDistributionChart({ severityCounts = {} }) {
  const counts = useMemo(
    () => [
      severityCounts.critical ?? 0,
      severityCounts.high ?? 0,
      severityCounts.medium ?? 0,
      severityCounts.low ?? 0,
    ],
    [
      severityCounts.critical,
      severityCounts.high,
      severityCounts.medium,
      severityCounts.low,
    ]
  );
  const maxCount = Math.max(...counts, 1);

  const data = useMemo(
    () => ({
      labels: ["Critical", "High", "Medium", "Low"],
      datasets: [
        {
          data: counts,
          backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    }),
    [counts]
  );

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: maxCount + 1,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="w-100" style={{ height: "300px" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
