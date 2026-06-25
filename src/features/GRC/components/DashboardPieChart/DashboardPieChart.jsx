import React from 'react';

import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardPieChart({ severityCounts = [] }) {
const rows = severityCounts.length ? severityCounts : [{ _id: "none", count: 0 }];

const data = {

    labels: rows.map((item) => String(item._id || "unspecified").replaceAll("_", " ")),

    datasets: [
        {
            label: "Audits",

            data: rows.map((item) => item.count || 0),

            backgroundColor: [
                "#4F46E5",
                "#22C55E",
                "#F59E0B",
                "#EF4444",
            ],

            borderWidth: 1,
        },
    ],
};

return (
<>
    <div className='pie-chart-container'>
        <Pie
            data={data}
            options={{
                responsive: true,
                maintainAspectRatio: false,
            }}
        />
    </div>
</>
);
}
