import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Blocks,
  Box,
  ChevronDown,
  Clock,
  DatabaseZap,
  Gauge,
  Link as LinkIcon,
  Mail,
  Maximize,
  MessageSquare,
  Minus,
  Play,
  Save,
  Search,
  Send,
  Settings,
  Zap,
} from "lucide-react";
import profile from "../../../assets/prrofile.png";
import "./SoarPlaybookBuilder.css";
import { createPlaybook, getPlaybooks, updatePlaybook } from "../Services/soar.api";

const nodeGroups = [
  {
    label: "Triggers",
    items: [
      { icon: <LinkIcon />, text: "Webhook Trigger", tone: "trigger", type: "webhook" },
      { icon: <Mail />, text: "Email Alert", tone: "trigger", type: "email" },
    ],
  },
  {
    label: "Security Tools",
    items: [
      { icon: <SigmaIcon />, text: "VirusTotal Lookup", tone: "tool", type: "lookup" },
      { icon: <Blocks />, text: "FortiGate Block", tone: "firewall", type: "block" },
      { icon: <Search />, text: "Splunk Query", tone: "search", type: "splunk" },
    ],
  },
  {
    label: "Logic",
    items: [
      { icon: <Gauge />, text: "IF Condition", tone: "logic", type: "condition" },
      { icon: <Clock />, text: "Delay", tone: "logic", type: "delay" },
    ],
  },
  {
    label: "Communication",
    items: [
      { icon: <MessageSquare />, text: "Slack Alert", tone: "slack", type: "slack" },
      { icon: <Send />, text: "Send Email", tone: "send", type: "send" },
    ],
  },
];

const initialCanvasNodes = [
  {
    id: "condition-1",
    type: "condition",
    title: "IF: Malicious",
    detail: "Check threat score > 5",
    meta: "Listens for security alerts",
    style: { left: 370, top: 110 },
    labels: true,
  },
  {
    id: "lookup-1",
    type: "lookup",
    title: "VirusTotal Lookup",
    detail: "Check IP reputation",
    meta: "Input: {{trigger:ip_address}}",
    style: { left: 370, top: 250 },
  },
  {
    id: "block-1",
    type: "block",
    title: "FortiGate Block",
    detail: "Action: Block IP",
    style: { left: 210, top: 400 },
  },
  {
    id: "log-1",
    type: "log",
    title: "Log Event",
    detail: "Record benign IP",
    meta: "Level: info",
    style: { left: 600, top: 400 },
  },
  {
    id: "slack-1",
    type: "slack",
    title: "Slack Alert",
    detail: "Notify security team",
    meta: "Channel: #security-alerts",
    style: { left: 210, top: 560 },
  },
];

const nodeTemplates = {
  webhook: {
    detail: "Receive alert payload",
    meta: "Method: POST",
  },
  email: {
    detail: "Parse incoming alert",
    meta: "Source: mailbox",
  },
  lookup: {
    detail: "Check IP reputation",
    meta: "Input: {{trigger:ip_address}}",
  },
  block: {
    detail: "Action: Block IP",
    meta: "Target: firewall policy",
  },
  splunk: {
    detail: "Search related events",
    meta: "Index: security",
  },
  condition: {
    detail: "Check threat score > 5",
    meta: "Routes true and false branches",
    labels: true,
  },
  delay: {
    detail: "Wait before next step",
    meta: "Duration: 5 minutes",
  },
  slack: {
    detail: "Notify security team",
    meta: "Channel: #security-alerts",
  },
  send: {
    detail: "Send incident summary",
    meta: "Recipients: SOC team",
  },
};

const zoomOptions = [75, 90, 100, 125, 150];

export default function SoarPlaybookBuilder() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(initialCanvasNodes);
  const [selectedNodeId, setSelectedNodeId] = useState("lookup-1");
  const [zoom, setZoom] = useState(100);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isActive, setIsActive] = useState(false);
  const [playbookName, setPlaybookName] = useState("Incident Response Playbook");
  const [savedPlaybooks, setSavedPlaybooks] = useState([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  const handleAddNode = (item) => {
    const template = nodeTemplates[item.type] || {};
    const nextNode = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      title: item.text,
      detail: template.detail || "Configure node action",
      meta: template.meta,
      labels: template.labels,
      style: {
        left: 260 + ((nodes.length % 3) * 320),
        top: 690 + (Math.floor(nodes.length / 3) * 145),
      },
    };

    setNodes((currentNodes) => [...currentNodes, nextNode]);
    setSelectedNodeId(nextNode.id);
    setStatus(`${item.text} added to canvas`);
  };

  const updateZoom = (nextZoom) => {
    const clampedZoom = Math.max(75, Math.min(150, nextZoom));
    setZoom(clampedZoom);
    setStatus(`Canvas zoom set to ${clampedZoom}%`);
  };

  const handleRunTest = (scope = "Playbook") => {
    setStatus(`${scope} test completed successfully`);
  };

  const loadPlaybooks = async () => {
    try {
      const result = await getPlaybooks({ limit: 20, sort: "-createdAt" });
      setSavedPlaybooks(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setStatus(error.message || "Could not load playbooks");
    }
  };

  const nodeFromAction = (action, index) => ({
    id: action.id || `${action.type || "action"}-${index}`,
    type: action.type || "action",
    title: action.params?.title || action.type || "Action",
    detail: action.params?.detail || "Configured backend action",
    meta: action.params?.meta,
    labels: action.type === "condition",
    style: action.params?.position || {
      left: 260 + ((index % 3) * 320),
      top: 120 + (Math.floor(index / 3) * 145),
    },
  });

  const loadPlaybookOnCanvas = (playbookId) => {
    setSelectedPlaybookId(playbookId);
    if (!playbookId) {
      setPlaybookName("Incident Response Playbook");
      setNodes(initialCanvasNodes);
      setSelectedNodeId("lookup-1");
      setIsActive(false);
      setStatus("New playbook draft");
      return;
    }

    const playbook = savedPlaybooks.find((item) => item._id === playbookId);
    if (!playbook) return;

    const nextNodes = Array.isArray(playbook.graph?.nodes) && playbook.graph.nodes.length
      ? playbook.graph.nodes
      : (playbook.actions || []).map(nodeFromAction);

    setPlaybookName(playbook.name || "Incident Response Playbook");
    setNodes(nextNodes.length ? nextNodes : initialCanvasNodes);
    setSelectedNodeId(nextNodes[0]?.id || initialCanvasNodes[0].id);
    setIsActive(Boolean(playbook.isActive));
    setStatus(`Loaded: ${playbook.name}`);
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const buildPlaybookPayload = () => ({
    name: playbookName.trim() || `Playbook ${new Date().toISOString()}`,
    description: "Created from LumiSec SOAR Playbook Builder",
    triggerType: isActive ? "auto" : "manual",
    actions: nodes.map((node, index) => ({
      id: node.id,
      type: node.type,
      order: index,
      params: {
        title: node.title,
        detail: node.detail,
        meta: node.meta,
        position: node.style,
      },
    })),
    graph: { nodes },
    isActive,
  });

  const handleSavePlaybook = async () => {
    setSaving(true);
    setStatus("Saving playbook...");
    try {
      const result = await createPlaybook(buildPlaybookPayload());
      setSelectedPlaybookId(result.data?._id || "");
      setStatus(`Saved: ${result.data?.name || playbookName}`);
      await loadPlaybooks();
    } catch (error) {
      setStatus(error.message || "Failed to save playbook");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlaybook = async () => {
    if (!selectedPlaybookId) {
      await handleSavePlaybook();
      return;
    }

    setSaving(true);
    setStatus("Updating playbook...");
    try {
      const result = await updatePlaybook(selectedPlaybookId, buildPlaybookPayload());
      setStatus(`Updated: ${result.data?.name || playbookName}`);
      await loadPlaybooks();
    } catch (error) {
      setStatus(error.message || "Failed to update playbook");
    } finally {
      setSaving(false);
    }
  };

  const renderNodeIcon = (type) => {
    if (type === "condition") return <Gauge />;
    if (type === "lookup") return <SigmaIcon />;
    if (type === "block") return <Blocks />;
    if (type === "log" || type === "splunk") return <DatabaseZap />;
    if (type === "slack") return <MessageSquare />;
    if (type === "webhook") return <LinkIcon />;
    if (type === "email" || type === "send") return <Mail />;
    if (type === "delay") return <Clock />;
    return <Box />;
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/welcome");
  };

  return (
    <main className="soar-platform">
      <header className="soar-platform-header">
        <div className="soar-title">
          <button className="soar-back-button" type="button" onClick={handleBack}>
            <ArrowLeft />
            Back
          </button>
          <strong>LumiSec SOAR</strong>
          <span />
          <input
            className="soar-playbook-name-input"
            value={playbookName}
            onChange={(event) => setPlaybookName(event.target.value)}
            aria-label="Playbook name"
          />
        </div>
        <div className="soar-actions">
          <small className="soar-saved-count">{savedPlaybooks.length} saved</small>
          <button className="soar-top-button muted" type="button" onClick={handleSavePlaybook} disabled={saving}>
            <Save />
            {saving ? "Saving" : "Save"}
          </button>
          <button className="soar-top-button muted" type="button" onClick={handleUpdatePlaybook} disabled={saving || !selectedPlaybookId}>
            <Save />
            Update
          </button>
          <button className="soar-top-button warning" type="button" onClick={() => handleRunTest()}>
            <Play />
            Run Test
          </button>
          <button
            className={`soar-top-button active ${isActive ? "is-live" : ""}`}
            type="button"
            onClick={() => {
              setIsActive((current) => !current);
              setStatus(isActive ? "Playbook deactivated" : "Playbook activated");
            }}
          >
            <Zap />
            {isActive ? "Active" : "Activate"}
          </button>
          <i aria-hidden="true" />
          <button className="soar-icon-button" type="button" aria-label="Settings" onClick={() => setStatus("Settings panel opened")}>
            <Settings />
          </button>
          <img className="soar-avatar" src={profile} alt="User profile" />
        </div>
      </header>

      <section className="soar-workspace">
        <aside className="soar-node-sidebar" aria-label="Playbook nodes">
          <Link className="palette-dashboard" to="/SOAR">
            <Box />
            Dashboard
          </Link>
          <section className="node-group">
            <h2>Saved Playbooks</h2>
            <select
              className="saved-playbook-select"
              value={selectedPlaybookId}
              onChange={(event) => loadPlaybookOnCanvas(event.target.value)}
              aria-label="Load saved playbook"
            >
              <option value="">New playbook</option>
              {savedPlaybooks.map((playbook) => (
                <option value={playbook._id} key={playbook._id}>
                  {playbook.name}
                </option>
              ))}
            </select>
          </section>
          {nodeGroups.map((group) => (
            <section className="node-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="node-palette-list">
                {group.items.map((item) => (
                  <button
                    className={`palette-node ${item.tone}`}
                    type="button"
                    key={item.text}
                    onClick={() => handleAddNode(item)}
                  >
                    {React.cloneElement(item.icon, { "aria-hidden": true })}
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <section className="soar-canvas" aria-label="Incident response playbook canvas">
          <div className="canvas-toolbar" aria-label="Canvas controls">
            <button type="button" aria-label="Fit view" onClick={() => updateZoom(100)}>
              <Maximize />
            </button>
            <button type="button" aria-label="Zoom out" onClick={() => updateZoom(zoom - 10)}>
              <Minus />
            </button>
            <button className="zoom-select" type="button" onClick={() => setZoomMenuOpen((current) => !current)}>
              {zoom}%
              <ChevronDown />
            </button>
            {zoomMenuOpen && (
              <div className="zoom-menu">
                {zoomOptions.map((option) => (
                  <button
                    className={option === zoom ? "selected" : ""}
                    type="button"
                    onClick={() => {
                      updateZoom(option);
                      setZoomMenuOpen(false);
                    }}
                    key={option}
                  >
                    {option}%
                  </button>
                ))}
              </div>
            )}
            <button type="button" aria-label="Zoom in" onClick={() => updateZoom(zoom + 10)}>
              +
            </button>
          </div>

          <div className="canvas-stage" style={{ transform: `scale(${zoom / 100})` }}>
            {nodes.map((node) => (
              <button
                className={`canvas-node ${node.type} ${node.id === selectedNodeId ? "selected" : ""}`}
                style={{ left: node.style.left, top: node.style.top }}
                type="button"
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setStatus(`${node.title} selected`);
                }}
                key={node.id}
              >
                {node.labels && (
                  <>
                    <span className="branch-label true-label">True</span>
                    <span className="branch-label false-label">False</span>
                  </>
                )}
                <span className="node-port input-port" />
                <span className="node-port output-port" />
                <h2>
                  {renderNodeIcon(node.type)}
                  {node.title}
                </h2>
                <p>{node.detail}</p>
                {node.meta && <small>{node.meta}</small>}
              </button>
            ))}
            <div className="canvas-ghost-node" aria-hidden="true" />
          </div>

          <div className="builder-status" role="status">
            {status}
          </div>
        </section>

        <aside className="config-panel" aria-label="Node configuration">
          <div className="config-heading">
            <h2>Node Configuration</h2>
            <p>{selectedNode?.title}</p>
          </div>

          {selectedNode?.type === "lookup" ? (
            <>
              <label>
                API Key
                <input type="password" value="abcdefghijklmnopqr" readOnly />
              </label>

              <label>
                IP Address Input
                <div className="template-input">
                  <span>{"{trigger:ip_addr"}</span>
                  <code>{"{{trigger:ip_address}}"}</code>
                  <ChevronDown aria-hidden="true" />
                </div>
              </label>

              <section className="config-checks">
                <h3>Output Fields</h3>
                {["Reputation Score", "Threat Categories", "Last Analysis Date"].map((item) => (
                  <label key={item}>
                    <input type="checkbox" defaultChecked />
                    <span>{item}</span>
                  </label>
                ))}
              </section>
            </>
          ) : (
            <>
              <label>
                Node Name
                <input type="text" value={selectedNode?.title || ""} readOnly />
              </label>
              <label>
                Action
                <input type="text" value={selectedNode?.detail || ""} readOnly />
              </label>
              <label>
                Context
                <input type="text" value={selectedNode?.meta || "No extra context"} readOnly />
              </label>
            </>
          )}

          <label>
            Error Handling
            <select defaultValue="Continue on Error">
              <option>Continue on Error</option>
              <option>Stop Playbook</option>
              <option>Retry Node</option>
            </select>
          </label>

          <button className="test-node-button" type="button" onClick={() => handleRunTest(selectedNode?.title || "Node")}>
            <Play />
            Test Node
          </button>
        </aside>
      </section>
    </main>
  );
}

function SigmaIcon() {
  return (
    <span className="sigma-icon" aria-hidden="true">
      Σ
    </span>
  );
}
