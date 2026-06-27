import React, { useRef, useState } from 'react'
import DashboardCard from '../Components/DashboardCard/DashboardCard'
import { ArrowDown, ArrowUp, Clock, Hourglass, LogOut, Menu, OctagonAlert, Settings } from 'lucide-react'
import DashboardBarChart from '../Components/DashboardBarChart/DashboardBarChart'
import DashboardPieChart from '../Components/DashboardPieChart/DashboardPieChart'
import AnalystPerformance from '../Components/AnalystPerformance/AnalystPerformance'
import AutomatedPlayBook from '../Components/AutomatedPlayBook/AutomatedPlayBook'
import { Link, useOutletContext } from 'react-router-dom'
import logo from "../../../assets/LumiSecLogoB 1@3x.png"
import "./SoarAnalytics.css"
import { useAuth } from '../../auth/context/AuthContext'
import useSoarAnalytics from '../Hooks/useSoarAnalytics'
import { exportSoarAnalytics } from '../Services/soar.api'

const periodOptions = [
    { value: "30", label: "Last 30 Days" },
    { value: "7", label: "Last 7 Days" },
    { value: "14", label: "Last 14 Days" },
    { value: "90", label: "Last 90 Days" },
];

function hoursToDisplay(value) {
    const hours = Number(value || 0);
    if (!hours) return "0h";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
}


export default function SoarAnalytics () {

    const { collapsed, setCollapsed } = useOutletContext();
    const { user, logout } = useAuth();
    const detailsSectionRef = useRef(null);
    const dateInputRef = useRef(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [activeDetailsTab, setActiveDetailsTab] = useState("analysts");
    const [openPanel, setOpenPanel] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("30");
    const [selectedDate, setSelectedDate] = useState("");
    const { days, report, analysts, loading, error } = useSoarAnalytics(selectedPeriod);
    const kpis = report?.kpis || {};
    const automationRoi = report?.automationRoi || {};
    const topPlaybooks = report?.topPlaybooks || [];
    const activeMetrics = {
        respond: hoursToDisplay(0),
        resolve: hoursToDisplay(kpis.avgResolutionHours),
        incidents: kpis.closedIncidents ?? 0,
        falsePositive: `${kpis.totalIncidents ? Math.round(((kpis.totalIncidents - kpis.closedIncidents) / kpis.totalIncidents) * 100) : 0}%`,
        roi: `${automationRoi.estimatedHoursSaved ?? 0}h`,
        respondTrend: "0%",
        resolveTrend: "0%",
        incidentsTrend: `${kpis.totalIncidents ?? 0} total`,
        falsePositiveTrend: "backend",
        roiTrend: `${automationRoi.roiPercent ?? 0}%`,
    };
    const displayName = user?.name || user?.email?.split("@")[0] || "Demo User";
    const displayEmail = user?.email || "demo@lumisec.local";
    const displayRole = user?.role
        ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)
        : "Security Analyst";

    const openDetails = (tab) => {
        setActiveDetailsTab(tab);
        setDetailsOpen(true);
        window.setTimeout(() => {
            detailsSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 50);
    };

    const openCalendar = () => {
        const input = dateInputRef.current;
        if (!input) return;

        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }

        input.focus();
    };

    const handleExportReport = async () => {
        const selectedPeriodLabel =
            periodOptions.find((option) => option.value === selectedPeriod)?.label || "Last 30 Days";
        try {
            await exportSoarAnalytics({ format: "csv", days });
        } catch (error) {
            console.warn("[SOAR] Backend export queue failed, creating local CSV", error);
        }
        const rows = [
            ["LumiSec Analytics Report"],
            ["Period", selectedPeriodLabel],
            ["Selected Date", selectedDate || "Not selected"],
            [],
            ["Metric", "Value", "Trend", "Description"],
            ["Mean Time To Respond", activeMetrics.respond, activeMetrics.respondTrend, "Average response time"],
            ["Mean Time To Resolve", activeMetrics.resolve, activeMetrics.resolveTrend, "Average response time"],
            ["Total Incidents Resolved", activeMetrics.incidents, activeMetrics.incidentsTrend, "Successfully closed"],
            ["False Positive Rate", activeMetrics.falsePositive, activeMetrics.falsePositiveTrend, "Accuracy improvement"],
            ["Automation ROI", activeMetrics.roi, activeMetrics.roiTrend, "Hours saved"],
            [],
            ["Analyst", "Closed", "Open", "Assigned", "Playbook Runs"],
            ...analysts.map((row) => [
                row.analyst?.name || row.analyst?.email || "Unknown",
                row.closed ?? 0,
                row.open ?? 0,
                row.assigned ?? 0,
                row.playbookRuns ?? 0,
            ]),
            [],
            ["Playbook", "Times Executed", "Completed", "Failed", "Success Rate"],
            ...topPlaybooks.map((playbook) => [
                playbook.name || "Unnamed",
                playbook.runs ?? 0,
                playbook.completed ?? 0,
                playbook.failed ?? 0,
                `${Math.round(playbook.successRate ?? 0)}%`,
            ]),
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
                    .join(",")
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safePeriod = selectedPeriodLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        link.href = url;
        link.download = `lumisec-analytics-${safePeriod}${selectedDate ? `-${selectedDate}` : ""}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };




  return <div className='soar-analytics-page'>


    <header className='soar-analytics-topbar'>

    <div className='soar-analytics-left'>

        {/* Mobile open sidebar */}
        <button
            className='btn text-white border-0 p-0 d-lg-none'
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
        >
            <Menu size={28} />
        </button>

        {/* Desktop collapse */}
        <button
            className='btn text-white border-0 p-0 d-none d-lg-block'
            onClick={() => setCollapsed(!collapsed)}
        >
            <Menu size={28} />
        </button>

            <figure className='soar-analytics-logo mb-0'>
                <Link to={"/SOAR"}>
                    <img src={logo} alt="logo" />
                </Link>
            </figure>

        <div className='soar-analytics-title'>
                <h2 className="m-0">Analytics & Reporting</h2>
            <p>Historical analysis and performance metrics</p>
        </div>


    </div>

        <div className='soar-analytics-actions'>

        <button className='soar-calendar-button' type='button' onClick={openCalendar} aria-label='Open calendar'>
            <i className="fa-solid fa-calendar-days"></i>
        </button>

            <select
                name="analyticsPeriod"
                id="analyticsPeriod"
                className='soar-analytics-select'
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value)}
            >
                {periodOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                ))}
            </select>
            <input
                ref={dateInputRef}
                className='soar-hidden-date-input'
                type='date'
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label='Choose analytics date'
            />

            <div>
            <button className="export-btn btn add-btn text-white border-0 ps-2" type="button" onClick={handleExportReport}>
            <i className="fa-solid fa-download pe-2"></i>
            Export Report
            </button>
            </div>


        </div>

        {/* RIGHT */}
        <button
            className='soar-analytics-settings-button'
            type='button'
            onClick={() => setOpenPanel("settings")}
            aria-label='Open settings'
        >
            <Settings size={20} />
        </button>

        <div className='soar-analytics-profile'>
            <button className='soar-profile-button' type='button' onClick={() => setOpenPanel("profile")}>
                <figure className='mb-0'>
                    <span className="soar-user-avatar-icon" aria-hidden="true">
                        <i className="fa-solid fa-user" />
                    </span>
                </figure>
            </button>
        </div>

    </header>
    
    <div className='row gy-3 align-items-center mb-5 p-3 analytics-summary-row'>
        {error && (
            <div className='col-12'>
                <div className='soar-analytics-error'>{error.message || "Failed to load SOAR analytics"}</div>
            </div>
        )}
        <DashboardCard
            icon={<Clock />}
            title={"Mean Time To Respond"}
            Statistics={activeMetrics.respond}
            arrow={<ArrowDown  size={20} color='red'/>}
            arrowDirection={"down"}
            text1={activeMetrics.respondTrend}
            desc1={"vs last period"}
            text2= {"Average response time"} 
        />

        <DashboardCard
            icon={<Hourglass />}
            title={"Mean Time To Resolve"}
            Statistics={activeMetrics.resolve}
            arrow={<ArrowDown  size={20} color='red'/>}
            arrowDirection={"down"}
            text1={activeMetrics.resolveTrend}
            desc1={"vs last period"}
            text2= {"Average response time"} 
        />

        <DashboardCard
            icon={<i className="fa-solid fa-circle-check fs-5" style={{color: "purple" }}></i>}
            title={"Total Incidents Resolved"}
            Statistics={activeMetrics.incidents}
            arrow={<ArrowUp  size={20} color='green'/>}
            arrowDirection={"up"}
            text1={activeMetrics.incidentsTrend}
            desc1={"vs last period"}
            text2= {"Successfully closed"} 
        />

        <DashboardCard
            icon={<OctagonAlert color='#f6cc3b'/>}
            title={"False Positive Rate"}
            Statistics={activeMetrics.falsePositive}
            arrow={<ArrowDown  size={20} color='red'/>}
            arrowDirection={"down"}
            text1={activeMetrics.falsePositiveTrend}
            desc1={"vs last period"}
            text2= {"Accuracy improvement"} 
        />

        <DashboardCard
            icon={<div className="fa-solid fa-gears"></div>}
            title={"Automation ROI"}
            Statistics={activeMetrics.roi}
            arrow={<ArrowUp  size={20} color='green'/>}
            arrowDirection={"up"}
            text1={activeMetrics.roiTrend}
            desc1={"vs last period"}
            text2= {"Hours saved"} 
        />

    </div>

    <div className='row g-3 justify-content-between align-items-stretch mb-4 mb-lg-5 p-3 analytics-panel-row'>

        <div className='col-12 col-lg-6'>
            <div className='dashboard-card analytics-panel h-100 p-3 rounded-4'>
                <DashboardBarChart incidentsOverTime={report?.incidentsOverTime || []} />
            </div>
        </div>

        <div className='col-12 col-lg-6'>
            <div className='dashboard-card analytics-panel h-100 d-flex justify-content-center align-items-center p-3 rounded-4'>
                <DashboardPieChart incidentTypes={report?.incidentTypes || []} />
            </div>
        </div>

    </div>

    <div className='row g-3 justify-content-between align-items-stretch mb-4 mb-lg-5 px-lg-3 p-3'>
        <div className='col-12 col-lg-6 row g-3 align-items-stretch'>
            <AnalystPerformance analysts={analysts} loading={loading} onViewAll={() => openDetails("analysts")} />
        </div>

        <div className='col-12 col-lg-6 row g-3 align-items-stretch'>
            <AutomatedPlayBook playbooks={topPlaybooks} loading={loading} onViewAll={() => openDetails("playbooks")} />
        </div>

    </div>

    <section
        className={`analytics-details-section ${detailsOpen ? "open" : ""}`}
        ref={detailsSectionRef}
        aria-label='Analytics details'
    >
        <div className='analytics-details-card'>
                <div className='analytics-details-header'>
                    <div>
                        <h3>Analytics Details</h3>
                        <p>Full operational data for analysts and automated playbooks</p>
                    </div>
                    <button type='button' onClick={() => setDetailsOpen(false)}>Hide</button>
                </div>

                <div className='analytics-tabs'>
                    <button
                        className={activeDetailsTab === "analysts" ? "active" : ""}
                        type='button'
                        onClick={() => setActiveDetailsTab("analysts")}
                    >
                        Analysts
                    </button>
                    <button
                        className={activeDetailsTab === "playbooks" ? "active" : ""}
                        type='button'
                        onClick={() => setActiveDetailsTab("playbooks")}
                    >
                        Playbooks
                    </button>
                </div>

                <div className='analytics-modal-table-wrap'>
                    {activeDetailsTab === "analysts" ? (
                        <table className='analytics-modal-table'>
                            <thead>
                                <tr>
                                    <th>Analyst</th>
                                    <th>Closed</th>
                                    <th>Open</th>
                                    <th>Assigned</th>
                                    <th>Playbook Runs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysts.map((row) => (
                                    <tr key={row.analyst?._id || row.analyst?.email || row.analyst?.name}>
                                        <td>{row.analyst?.name || row.analyst?.email || "Unknown analyst"}</td>
                                        <td>{row.closed ?? 0}</td>
                                        <td>{row.open ?? 0} open</td>
                                        <td>{row.assigned ?? 0}</td>
                                        <td>{row.playbookRuns ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className='analytics-modal-table'>
                            <thead>
                                <tr>
                                    <th>Playbook</th>
                                    <th>Times Executed</th>
                                    <th>Completed</th>
                                    <th>Success Rate</th>
                                    <th>Failed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPlaybooks.map((playbook) => (
                                    <tr key={playbook.playbookId || playbook.name}>
                                        <td>{playbook.name || "Unnamed playbook"}</td>
                                        <td>{playbook.runs ?? 0}</td>
                                        <td>{playbook.completed ?? 0}</td>
                                        <td>{Math.round(playbook.successRate ?? 0)}%</td>
                                        <td>{playbook.failed ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
        </div>
    </section>

    {openPanel && (
        <div
            className='soar-panel-backdrop side-mode'
            role='dialog'
            aria-modal='true'
            onClick={() => setOpenPanel(null)}
        >
            <div
                className='soar-side-drawer'
                onClick={(event) => event.stopPropagation()}
            >
                <div className='soar-user-modal-header'>
                    <div>
                        <h3>{openPanel === "profile" ? "Profile" : "Platform Settings"}</h3>
                        <p>{openPanel === "profile" ? "Signed-in user information" : "General LumiSec workspace preferences"}</p>
                    </div>
                    <button type='button' onClick={() => setOpenPanel(null)}>Close</button>
                </div>

                {openPanel === "profile" ? (
                    <div className='soar-profile-panel'>
                        <div className='soar-profile-hero'>
                            <span className="soar-user-avatar-icon soar-user-avatar-icon-lg" aria-hidden="true">
                                <i className="fa-solid fa-user" />
                            </span>
                            <div>
                                <h4>{displayName}</h4>
                                <p>{displayRole}</p>
                            </div>
                        </div>

                        <div className='soar-profile-grid'>
                            <label>
                                Full Name
                                <input value={displayName} readOnly />
                            </label>
                            <label>
                                Email Address
                                <input value={displayEmail} readOnly />
                            </label>
                            <label>
                                Role
                                <input value={displayRole} readOnly />
                            </label>
                            <label>
                                Access Scope
                                <input value='SOAR, Analytics, Playbooks, Incidents' readOnly />
                            </label>
                        </div>

                        <div className='soar-profile-actions'>
                            <button type='button' onClick={() => setOpenPanel(null)}>Done</button>
                            <button
                                type='button'
                                className='danger'
                                onClick={() => {
                                    logout();
                                    setOpenPanel(null);
                                }}
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='soar-settings-panel'>
                        <section>
                            <h4>Account & Workspace</h4>
                            <label>
                                Default module
                                <select defaultValue='welcome'>
                                    <option value='welcome'>Welcome Dashboard</option>
                                    <option value='soar'>SOAR Analytics</option>
                                    <option value='network'>Network Security</option>
                                    <option value='grc'>GRC</option>
                                </select>
                            </label>
                            <label>
                                Interface density
                                <select defaultValue='comfortable'>
                                    <option value='comfortable'>Comfortable</option>
                                    <option value='compact'>Compact</option>
                                </select>
                            </label>
                        </section>

                        <section>
                            <h4>Security</h4>
                            <label><input type='checkbox' defaultChecked /> Require confirmation for sensitive actions</label>
                            <label><input type='checkbox' defaultChecked /> Keep audit trail for user activity</label>
                            <label><input type='checkbox' /> Auto-lock session after inactivity</label>
                        </section>

                        <section>
                            <h4>Notifications</h4>
                            <label><input type='checkbox' defaultChecked /> High severity security alerts</label>
                            <label><input type='checkbox' defaultChecked /> Compliance and remediation updates</label>
                            <label><input type='checkbox' /> Weekly executive summary email</label>
                        </section>

                        <section>
                            <h4>Reports</h4>
                            <label>
                                Default date range
                                <select defaultValue='30'>
                                    <option value='7'>Last 7 Days</option>
                                    <option value='30'>Last 30 Days</option>
                                    <option value='90'>Last 90 Days</option>
                                </select>
                            </label>
                            <label>
                                Export format
                                <select defaultValue='pdf'>
                                    <option value='pdf'>PDF</option>
                                    <option value='csv'>CSV</option>
                                    <option value='xlsx'>Excel</option>
                                </select>
                            </label>
                        </section>

                        <section>
                            <h4>Integrations</h4>
                            <label><input type='checkbox' defaultChecked /> Enable SIEM alert intake</label>
                            <label><input type='checkbox' defaultChecked /> Enable threat feed enrichment</label>
                            <label><input type='checkbox' /> Sync findings with GRC remediation</label>
                        </section>

                        <div className='soar-settings-actions'>
                            <button type='button' onClick={() => setOpenPanel(null)}>Cancel</button>
                            <button type='button' className='primary' onClick={() => setOpenPanel(null)}>Save Settings</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )}

  </div>

}
