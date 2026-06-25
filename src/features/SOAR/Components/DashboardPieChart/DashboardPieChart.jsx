import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardPieChart({ incidentTypes = [] }) {
    const colors = ["#26ACFF", "#10B981", "#EC4899", "#A855F7", "#64748B"];

    const rawData = incidentTypes.length
        ? incidentTypes.slice(0, 5).map((item, index) => ({
            label: item._id?.type || item._id || "unspecified",
            value: item.count || 0,
            color: colors[index % colors.length],
        }))
        : [{ label: "No data", value: 1, color: "#64748B" }];

    const total = rawData.reduce((sum, item) => sum + item.value, 0) || 1;

    const data = {
        labels: rawData.map(item => item.label),
        datasets: [
            {
                data: rawData.map(item => item.value),
                backgroundColor: rawData.map(item => item.color),
                borderWidth: 2, 
                borderColor: "#ffffff", 
                spacing: 8, 
                borderRadius: 8, 
                cutout: "78%",
            },
        ],
    };

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
            const { ctx, chartArea: { top, bottom, left, right } } = chart;
            ctx.save();
            
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            ctx.font = 'normal 14px sans-serif';
            ctx.fillStyle = '#9CA3AF'; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Total', centerX, centerY - 12);

            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillText(String(total), centerX, centerY + 12);
            
            ctx.restore();
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw}`
                }
            }
        },
    };

    return (
        <div style={{
            padding: '24px', 
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', marginBottom: "30px", fontSize: '20px' }}>Top Incident Types</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                
                <div style={{ width: '320px', height: '320px', position: 'relative' }}>
                    <Doughnut 
                        data={data} 
                        options={options} 
                        plugins={[centerTextPlugin]} 
                    />
                </div>

                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '160px' }}>
                    {rawData.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: item.color,
                                    borderRadius: '50%',
                                    display: 'inline-block'
                                }}></span>
                                <span style={{ color: '#E5E7EB', fontSize: '15px' }}>{item.label}:</span>
                            </div>
                            
                            <span style={{ color: '#9CA3AF', fontSize: '15px', fontWeight: '500' }}>{item.value}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
