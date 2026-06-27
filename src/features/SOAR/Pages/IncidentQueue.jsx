import React, { useState } from "react";
import IncidentTable from "../Components/IncidentTable/IncidentTable";
import PlaybookCard from "../Components/PlaybookCard/PlaybookCard";
import ThreatFeedCard from "../Components/ThreatFeedCard/ThreatFeedCard";
import RiskCard from "../Components/RiskCard/RiskCard";
import "./IncidentsQueue.css";
import useIncidentsQueue from "../Hooks/useIncidentsQueue";
import StatsCard from "../Components/StatsCard/StatsCard";
import { Activity, DollarSign, Menu, Radio, RefreshCcw, Server, ShieldCheck, Timer } from "lucide-react";
import logo from "../../../assets/LumiSecLogoB 1@3x.png"

import { Link, useNavigate, useOutletContext } from "react-router-dom";

export default function IncidentQueue() {

  const { collapsed, setCollapsed } = useOutletContext();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Incident queue ready");
  const [sidePanel, setSidePanel] = useState(null);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [feedUpdatedAt, setFeedUpdatedAt] = useState("Just now");
  const {
    dashboard,
    incidents,
    loading,
    error,
  } = useIncidentsQueue({ severity: severityFilter });

  const openIncidents = dashboard?.openIncidents ?? 0;
  const criticalOpen = dashboard?.criticalOpen ?? 0;
  const activeRuns = dashboard?.activeRuns ?? 0;
  const alertsToday = dashboard?.alertsToday ?? 0;

  const openSidePanel = (type) => {
    const messages = {
      stream: "Live playbook stream opened",
      feed: "Threat intel feed refreshed",
      risk: "Asset risk context opened",
    };

    if (type === "feed") {
      setFeedUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }

    setSidePanel(type);
    setStatusMessage(messages[type]);
  };

  const startWorkflow = () => {
    if (!selectedIncident) return;

    setActiveWorkflow({
      id: selectedIncident._id,
      action: "Investigate",
      steps: [
        { label: "Collect endpoint telemetry", state: "Complete" },
        { label: "Correlate MITRE techniques", state: "Running" },
        { label: "Prepare containment approval", state: "Queued" },
      ],
    });
    setStatusMessage(`Investigation workflow started for ${selectedIncident.title}`);
  };


  return (
    <div className="incident-queue-page">

      <header className='incident-queue-topbar'>

      <div className='incident-queue-header-left'>

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

            <figure className='incident-queue-logo mb-0'>
                <Link to={"/SOAR"}>
                    <img src={logo} alt="logo" />
                </Link>
            </figure>

            <div className='incident-queue-title'>
                  <h1>Unified Incident Management Queue</h1>
            </div>


      </div>

          {/* RIGHT */}
          <div className='incident-queue-header-right'>
            <div className="incident-queue-divider"></div>
            <div className='incident-queue-user d-none d-md-block'>
              <p>Mohamed Atef</p>
              <span>Lead Security Analyst (Tier III)</span>
            </div>

            <button
              className="incident-profile-button"
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open analyst profile"
            >
              <figure className='incident-queue-profile mb-0'>
                <span className="soar-user-avatar-icon" aria-hidden="true">
                  <i className="fa-solid fa-user" />
                </span>
              </figure>
            </button>
          </div>

      </header>


      <div className="dashboard-container incident-queue-content p-3">

      <div className="row g-3">

        <div className="col-lg-9">

          <div className="row g-3">
            

              <StatsCard
              title={"Active Threats"}
              statistics = {openIncidents}
              desc={`${criticalOpen} critical open`}
              />
              <StatsCard
              title={"Critical Nodes"}
              icon ={<Server  size ={22} style={{color: "#C9D1D9"}} />}
              statistics = {criticalOpen}
              desc={"Critical incidents"}
              />
              <StatsCard
              title={"Active Runs"}
              icon={<Timer size ={22} style={{color: "#C9D1D9"}} />}
              statistics = {activeRuns}
              desc={"Queued or running"}
              />
              <StatsCard
              title={"Alerts Today"}
              icon={<DollarSign size ={22} style={{color: "#C9D1D9"}} />}
              statistics = {alertsToday}
              desc={"SOAR alerts received"}
              />
          </div>

          <div className="mt-3">
            <IncidentTable
              incidents={incidents}
              severityFilter={severityFilter}
              loading={loading}
              error={error}
              onFilterChange={(value) => {
                setSeverityFilter(value);
                setStatusMessage(`Showing ${value === "all" ? "all severities" : value} incidents`);
              }}
              onIncidentAction={(incident) => {
                navigate(`/SOAR/IncidentManagement/${incident._id}`);
              }}
            />
          </div>

        </div>

        <div className="col-lg-3">

          <div className="d-flex flex-column gap-3">
            <PlaybookCard onOpen={() => openSidePanel("stream")} />
            <ThreatFeedCard onRefresh={() => openSidePanel("feed")} />
            <RiskCard onOpen={() => openSidePanel("risk")} />
          </div>

        </div>

      </div>

      </div>

      <div className="incident-status-toast" role="status">
        {statusMessage}
      </div>

      {selectedIncident && (
        <div className="incident-drawer-backdrop" onClick={() => setSelectedIncident(null)}>
          <aside className="incident-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="incident-drawer-header">
              <div>
                <h2>{selectedIncident.title}</h2>
                <p>#{selectedIncident._id?.slice(-4).toUpperCase()} | {selectedIncident.severity?.toUpperCase()}</p>
              </div>
              <button type="button" onClick={() => setSelectedIncident(null)}>Close</button>
            </div>

            <div className="incident-drawer-body">
              <section>
                <h3>Entity Context</h3>
                <p>
                  {[
                    selectedIncident.incidentType,
                    selectedIncident.affectedHost ? `Host: ${selectedIncident.affectedHost}` : null,
                    selectedIncident.sourceIP ? `Source IP: ${selectedIncident.sourceIP}` : null,
                  ].filter(Boolean).join(" | ") || selectedIncident.description || "No extra context"}
                </p>
              </section>
              <section>
                <h3>Response Status</h3>
                <p className="text-capitalize">{selectedIncident.status?.replaceAll("_", " ")}</p>
              </section>
              <section>
                <h3>Tags</h3>
                <div className="incident-tag-list">
                  {selectedIncident.tags?.length
                    ? selectedIncident.tags.map((tag) => <span key={tag}>{tag}</span>)
                    : <p>No tags</p>}
                </div>
              </section>
              <button
                className="incident-primary-action"
                type="button"
                onClick={startWorkflow}
              >
                Start Investigation
              </button>

              {activeWorkflow?.id === selectedIncident._id && (
                <section className="incident-workflow-panel">
                  <div className="incident-workflow-title">
                    <Activity size={18} />
                    <h3>{activeWorkflow.action} Workflow</h3>
                  </div>
                  <div className="incident-workflow-steps">
                    {activeWorkflow.steps.map((step) => (
                      <div className={`incident-workflow-step ${step.state.toLowerCase()}`} key={step.label}>
                        <span>{step.label}</span>
                        <strong>{step.state}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}

      {sidePanel && (
        <div className="incident-drawer-backdrop" onClick={() => setSidePanel(null)}>
          <aside className="incident-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="incident-drawer-header">
              <div>
                <h2>
                  {sidePanel === "stream" && "Live Playbook Stream"}
                  {sidePanel === "feed" && "Threat Intel Feed"}
                  {sidePanel === "risk" && "Asset Risk Context"}
                </h2>
                <p>
                  {sidePanel === "stream" && "Active automation and containment steps"}
                  {sidePanel === "feed" && `Last refreshed ${feedUpdatedAt}`}
                  {sidePanel === "risk" && "SRV-01 exposure and mitigation view"}
                </p>
              </div>
              <button type="button" onClick={() => setSidePanel(null)}>Close</button>
            </div>

            <div className="incident-drawer-body">
              {sidePanel === "stream" && (
                <>
                  <section className="incident-live-card">
                    <div className="incident-live-heading">
                      <Radio size={18} />
                      <h3>Containment: SRV-01</h3>
                    </div>
                    <p>Isolate Host is running with 75% completion.</p>
                    <div className="incident-progress"><span style={{ width: "75%" }} /></div>
                  </section>
                  <section>
                    <h3>Automation Events</h3>
                    <div className="incident-event-list">
                      <p>Firewall policy staged for domain controller segment.</p>
                      <p>EDR isolation command waiting for admin approval.</p>
                      <p>Email triage purged 42 malicious links.</p>
                    </div>
                  </section>
                </>
              )}

              {sidePanel === "feed" && (
                <>
                  <section className="incident-live-card">
                    <div className="incident-live-heading">
                      <RefreshCcw size={18} />
                      <h3>Feed Refreshed</h3>
                    </div>
                    <p>New indicators and campaign notes are now synced.</p>
                  </section>
                  <section>
                    <h3>Latest Intelligence</h3>
                    <div className="incident-event-list">
                      <p><strong>Urgent:</strong> Zero-day campaign targeting Civic VPN gateways.</p>
                      <p><strong>Update:</strong> BlackByte group moved to fresh C2 infrastructure.</p>
                      <p><strong>Signal:</strong> Ransomware loader hash matched SRV-01 telemetry.</p>
                    </div>
                  </section>
                </>
              )}

              {sidePanel === "risk" && (
                <>
                  <section className="incident-risk-score">
                    <ShieldCheck size={24} />
                    <strong>88%</strong>
                    <span>SRV-01 Security Risk</span>
                  </section>
                  <section>
                    <h3>Risk Drivers</h3>
                    <div className="incident-event-list">
                      <p>Domain Admin privileges detected on active session.</p>
                      <p>Active malware beaconing to suspicious infrastructure.</p>
                      <p>Server belongs to a high-value authentication segment.</p>
                    </div>
                  </section>
                  <button
                    className="incident-primary-action"
                    type="button"
                    onClick={() => setStatusMessage("Containment recommendation queued for SRV-01")}
                  >
                    Queue Containment Recommendation
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {profileOpen && (
        <div className="incident-drawer-backdrop" onClick={() => setProfileOpen(false)}>
          <aside className="incident-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="incident-drawer-header">
              <div>
                <h2>Analyst Profile</h2>
                <p>Current incident response owner</p>
              </div>
              <button type="button" onClick={() => setProfileOpen(false)}>Close</button>
            </div>
            <div className="incident-profile-panel">
              <span className="soar-user-avatar-icon soar-user-avatar-icon-lg" aria-hidden="true">
                <i className="fa-solid fa-user" />
              </span>
              <h3>Mohamed Atef</h3>
              <p>Lead Security Analyst (Tier III)</p>
              <dl>
                <div><dt>Queue Ownership</dt><dd>Critical Incidents</dd></div>
                <div><dt>Open Cases</dt><dd>7</dd></div>
                <div><dt>Avg. Response</dt><dd>42m</dd></div>
                <div><dt>Shift</dt><dd>Morning SOC</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
