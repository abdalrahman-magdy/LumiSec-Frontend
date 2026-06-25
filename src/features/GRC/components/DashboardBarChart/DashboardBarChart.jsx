import React from 'react'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardBarChart({ statusCounts = [] }) {
    const rows = statusCounts.length ? statusCounts : [{ _id: "none", count: 0 }];

    const data = {
        labels: rows.map((item) => String(item._id || "unspecified").replaceAll("_", " ")),

        datasets: [
            {
                label: "Findings",
                data: rows.map((item) => item.count || 0),
                backgroundColor: "#4F46E5",
            },
        ],
    };

return <>
    
    <div className='w-100 chart-container'>
        <Bar
            data={data}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { ticks: { precision: 0 } }
                }
            }}
        />
    </div>

</>
}
