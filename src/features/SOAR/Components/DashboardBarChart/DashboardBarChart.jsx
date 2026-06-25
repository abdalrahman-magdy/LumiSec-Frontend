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

export default function DashboardBarChart({ incidentsOverTime = [] }) {
    const labels = [...new Set(incidentsOverTime.map((item) => item._id?.date).filter(Boolean))];
    const severities = ["medium", "high", "critical"];
    const valuesBySeverity = Object.fromEntries(severities.map((severity) => [severity, []]));

    labels.forEach((date) => {
        severities.forEach((severity) => {
            const item = incidentsOverTime.find((entry) => entry._id?.date === date && entry._id?.severity === severity);
            valuesBySeverity[severity].push(item?.count || 0);
        });
    });

    const data = {
        labels: labels.length ? labels : ["No data"],

        datasets: [
            {
                label: "Medium",
                data: labels.length ? valuesBySeverity.medium : [0],
                backgroundColor: "#10B981",
                borderRadius: { topRight: 0, topLeft: 0, bottomRight: 0, bottomLeft: 0 } 
            },
            {
                label: "High",
                data: labels.length ? valuesBySeverity.high : [0],
                backgroundColor: "#F59E0B",
                borderRadius: { topRight: 0, topLeft: 0, bottomRight: 0, bottomLeft: 0 }
            },
            {
                label: "Critical",
                data: labels.length ? valuesBySeverity.critical : [0],
                backgroundColor: "#EF4444",
                borderRadius: { topRight: 8, topLeft: 8, bottomRight: 0, bottomLeft: 0 }
            },
        ],
    };

    return <>
        <div className='w-100 chart-container pb-5'>


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', marginBottom: "30px", fontSize: '20px' }}>Incidents Over Time</h3>
        </div>


        <Bar
            data={data}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 50 
                        }
                    },
                },

                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        min: 0,
                        ticks: { precision: 0 }
                    },
                },
            }}
        />
        </div>
    </>
}
