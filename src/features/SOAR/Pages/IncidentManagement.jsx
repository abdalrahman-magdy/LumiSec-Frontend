import React, { useMemo, useState } from 'react'
import Summary from '../Components/Summary/Summary'
import "./IncidentManagement.css"
import InvesigaionTimeline from '../Components/InvesigaionTimeline/InvesigaionTimeline'
import Actions from '../Components/Actions/Actions'
import { Menu } from 'lucide-react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import returnImg from "../../../assets/Return.png"
import logo from "../../../assets/LumiSecLogoB 1@3x.png"
import useIncidentManagement from '../Hooks/useIncidentManagement'
import { getUser } from '../../auth/utils/authStorage'




export default function IncidentManagement() {

  const { collapsed, setCollapsed } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState(null);
  const {
    incident,
    timeline,
    artifacts,
    related,
    loading,
    error,
    savingNote,
    actionLoading,
    addNote,
    updateStatus,
    assignIncident,
    closeCurrentIncident,
    runRecommendedAction,
  } = useIncidentManagement(id);

  const alerts = timeline.filter((event) => event.type === "alert");
  const incidentTitle = incident
    ? `[${incident.severity?.toUpperCase()}] ${incident.title}`
    : id
      ? "Loading incident..."
      : "Select an incident";
  const currentUser = useMemo(() => getUser(), []);
  const currentUserId = currentUser?._id ?? currentUser?.id;

  const runWithFeedback = async (label, fn) => {
    setActionMessage(null);
    try {
      await fn();
      setActionMessage({ type: "success", text: `${label} done.` });
    } catch (err) {
      setActionMessage({ type: "danger", text: err.message || `${label} failed.` });
    }
  };

  const handleRecommendedAction = (action) => {
    if (action === "scan_endpoint") {
      const target = incident?.affectedHost || incident?.sourceIP || artifacts.find((artifact) => artifact.type === "ip")?.value;
      navigate("/Network/PortScanning", { state: { target } });
      return;
    }

    const labels = {
      isolate_host: "Host isolation",
      block_ip: "IP block",
      reset_password: "Password reset request",
    };
    runWithFeedback(labels[action] || "Action", () => runRecommendedAction(action));
  };

  const handleArtifactAction = (action, artifact) => {
    if (action === "block_ip") {
      runWithFeedback("IP block", () => runRecommendedAction("block_ip"));
      return;
    }

    if (action === "scan_artifact") {
      if (["ip", "domain"].includes(artifact?.type)) {
        navigate("/Network/PortScanning", { state: { target: artifact.value } });
        return;
      }
      runWithFeedback("Artifact scan request", () => addNote(`Scan requested for ${artifact?.type || "artifact"}: ${artifact?.value}`));
    }
  };

  return (
    <section className="incident-management-page">
      <header className='incident-management-topbar'>
        <div className='incident-management-header-left'>
          <button
            className='btn text-white border-0 p-0 d-lg-none'
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>

          <button
            className='btn text-white border-0 p-0 d-none d-lg-block'
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            <Menu size={28} />
          </button>

          <Link to="/SOAR" className='incident-management-logo'>
            <img src={logo} alt="LumiSec" />
          </Link>

          <div className='incident-management-title'>
            <h1>{incidentTitle}</h1>
            <span>{incident?._id ? `Incident #${incident._id.slice(-4).toUpperCase()}` : "No incident selected"}</span>
          </div>
        </div>

        <div className='incident-management-header-actions'>
          <Link to="/SOAR/IncidentsQueue" className='Incidents-Queue-btn rounded-3 text-white border-0 d-flex align-items-center text-decoration-none'>
            <img src={returnImg} alt="" />
            Incidents Queue
          </Link>

          <select
            aria-label="Incident status"
            className='form-select select-date text-white border-0'
            value={incident?.status || ""}
            disabled={!id || actionLoading === "status"}
            onChange={(event) => runWithFeedback("Status update", () => updateStatus(event.target.value))}
          >
            <option value="">Status</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="false_positive">False Positive</option>
          </select>

          <select
            aria-label="Assign incident"
            className='form-select select-date text-white border-0'
            value={incident?.assignedTo?._id || incident?.assignedTo || ""}
            disabled={!id || actionLoading === "assign"}
            onChange={(event) => runWithFeedback("Assignment update", () => assignIncident(event.target.value))}
          >
            <option value="">Assign to...</option>
            {currentUserId && <option value={currentUserId}>{currentUser?.name || currentUser?.email || "Assign to me"}</option>}
          </select>

          <button
            className="Close-Incident-btn text-white border-0 rounded-3 d-flex align-items-center"
            disabled={!id || actionLoading === "close"}
            onClick={() => runWithFeedback("Close incident", closeCurrentIncident)}
          >
            <i className="fa-regular fa-circle-xmark text-danger fs-5"></i>
            {actionLoading === "close" ? "Closing..." : "Close Incident"}
          </button>
        </div>

        <figure className='profile-figure incident-management-profile mb-0'>
          <span className="soar-user-avatar-icon" aria-hidden="true">
            <i className="fa-solid fa-user" />
          </span>
        </figure>
      </header>

      {error && (
        <div className="incident-management-error">
          {error.message || "Failed to load incident"}
        </div>
      )}

      {actionMessage && (
        <div className={`incident-management-error ${actionMessage.type === "success" ? "incident-management-success" : ""}`}>
          {actionMessage.text}
        </div>
      )}

      {!id && (
        <div className="incident-management-error">
          Open an incident from the queue to view backend-backed details.
        </div>
      )}

      <div className='incident-management-grid'>
        <aside className="incident-management-summary-panel">
          <Summary
            incident={incident}
            artifacts={artifacts}
            loading={loading}
            actionLoading={actionLoading}
            onArtifactAction={handleArtifactAction}
          />
        </aside>

        <main className="incident-management-timeline-panel">
          <InvesigaionTimeline
            events={timeline}
            loading={loading}
            onAddNote={addNote}
            savingNote={savingNote}
          />
        </main>

        <aside className='incident-management-actions-panel'>
          <Actions
            related={related}
            alerts={alerts}
            actionLoading={actionLoading}
            onAction={handleRecommendedAction}
          />
        </aside>
      </div>
    </section>
  )
}
