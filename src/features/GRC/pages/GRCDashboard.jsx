import React from 'react'
import DashboardCard from '../components/DashboardCard/DashboardCard'
import checkIcon from "../../../assets/checkIcon.png"
import crossIcon from "../../../assets/crossIcon.png"
import TimeIcon from "../../../assets/TimeIcon.png"
import CommentIcon from "../../../assets/CommentIcon.png"
import DashboardBarChart from '../components/DashboardBarChart/DashboardBarChart'
import DashboardPieChart from '../components/DashboardPieChart/DashboardPieChart'
import useGrcDashboard from '../hooks/useGrcDashboard'

export default function GRCDashboard() {
const { overview, compliance, tasks, loading, error } = useGrcDashboard();
const frameworkCompliance = compliance?.byFramework || [];
const totalControls = frameworkCompliance.reduce((sum, item) => sum + (item.total || 0), 0);
const compliantControls = frameworkCompliance.reduce((sum, item) => sum + (item.compliant || 0), 0);
const complianceRate = totalControls ? Math.round((compliantControls / totalControls) * 100) : 0;
const nonCompliantControls = (compliance?.byStatus || [])
    .filter((item) => item._id !== "compliant")
    .reduce((sum, item) => sum + (item.count || 0), 0);

return <>
    
    <div>
        <h2 className='text-white mb-4 mb-lg-5'>
            GRC Dashboard
        </h2>
        {error && <p className='text-danger'>{error.message || "Failed to load GRC dashboard"}</p>}
    </div>

    <div className='row g-3 mb-4 mb-lg-5'>

        <DashboardCard
            icon={checkIcon}
            Statistics={loading ? "..." : `${complianceRate}%`}
            text={"Overall Compliance"}
        />

        <DashboardCard
            icon={crossIcon}
            Statistics={loading ? "..." : nonCompliantControls}
            text={"Non-Compliant Controls"}
        />

        <DashboardCard
            icon={TimeIcon}
            Statistics={loading ? "..." : (overview?.openTasks ?? tasks?.overdue ?? 0)}
            text={"Remediation Tasks"}
        />

        <DashboardCard
            icon={CommentIcon}
            Statistics={loading ? "..." : (overview?.openFindings ?? 0)}
            text={"Open Findings"}
        />

    </div>

    <div className='row g-4 justify-content-between align-items-stretch mb-4 mb-lg-5 px-0 px-lg-3'>

        <div className='col-12 col-lg-6'>
            <div className='dashboard-card h-100 p-3 rounded-4'>
                <DashboardBarChart statusCounts={overview?.findingsByStatus || []} />
            </div>
        </div>

        <div className='col-12 col-lg-5'>
            <div className='dashboard-card h-100 d-flex justify-content-center align-items-center p-3 rounded-4'>
                <DashboardPieChart severityCounts={overview?.findingsBySeverity || []} />
            </div>
        </div>

    </div>

</>
}
