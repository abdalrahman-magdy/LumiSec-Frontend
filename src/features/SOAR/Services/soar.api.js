import { request } from "../../../services/apiClient";

const SOAR_BASE = "/api/soar";
const LOCAL_PLAYBOOKS_KEY = "lumisec_soar_playbooks";
const LOCAL_NOTES_KEY = "lumisec_soar_incident_notes";

function localResult(data, message = "Demo data") {
  return { data, pagination: null, message };
}

function readLocalList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function buildIncidentTimeline(incident) {
  if (!incident) return [];
  const events = [
    {
      id: `${incident._id}-created`,
      type: "alert",
      title: "Incident created",
      description: incident.description || incident.title,
      timestamp: incident.createdAt,
    },
  ];

  (incident.actions || []).forEach((action, index) => {
    events.push({
      id: `${incident._id}-action-${index}`,
      type: "action",
      title: action.action,
      description: action.result,
      timestamp: action.performedAt,
    });
  });

  if (incident.closedAt) {
    events.push({
      id: `${incident._id}-closed`,
      type: "note",
      title: "Incident closed",
      description: incident.notes || "Closed from SOAR",
      timestamp: incident.closedAt,
    });
  }

  return events;
}

function buildIncidentArtifacts(incident) {
  if (!incident) return [];
  return [
    incident.sourceIP && { type: "ip", value: incident.sourceIP, source: "incident" },
    incident.affectedHost && { type: "host", value: incident.affectedHost, source: "incident" },
  ].filter(Boolean);
}

function summarizeIncidents(incidents = []) {
  const openStatuses = ["new", "in_progress", "escalated", "resolved"];
  const openIncidents = incidents.filter((item) => openStatuses.includes(item.status)).length;
  return {
    openIncidents,
    criticalOpen: incidents.filter((item) => item.severity === "critical" && openStatuses.includes(item.status)).length,
    activeRuns: incidents.filter((item) => item.playbookExecuted).length,
    alertsToday: incidents.filter((item) => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt).toDateString() === new Date().toDateString();
    }).length,
  };
}

function buildAnalyticsReport(incidents = []) {
  const closedIncidents = incidents.filter((item) => ["closed", "false_positive"].includes(item.status)).length;
  const bySeverity = incidents.reduce((acc, item) => {
    const key = item.severity || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    kpis: {
      totalIncidents: incidents.length,
      closedIncidents,
      avgResolutionHours: 0,
    },
    automationRoi: {
      estimatedHoursSaved: incidents.filter((item) => item.playbookExecuted).length,
      roiPercent: incidents.length ? Math.round((closedIncidents / incidents.length) * 100) : 0,
    },
    incidentsOverTime: incidents.slice(0, 10).map((item) => ({
      label: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Unknown",
      count: 1,
    })),
    incidentTypes: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
    topPlaybooks: readLocalList(LOCAL_PLAYBOOKS_KEY).slice(0, 5).map((playbook) => ({
      name: playbook.name,
      runs: 0,
      completed: 0,
      failed: 0,
      successRate: 0,
    })),
  };
}

export function getIncidents(params = {}) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents`,
    params,
  });
}

export function createIncident(payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/incidents`,
    data: payload,
  });
}

export function getIncident(id) {
  return getIncidents({ limit: 100 }).then((result) => {
    const incident = (result.data || []).find((item) => item._id === id || item.id === id);
    if (!incident) throw new Error("Incident detail endpoint is not available yet.");
    return localResult(incident, "Incident fetched from list endpoint");
  });
}

export function updateIncident(id, payload) {
  if (payload?.status === "closed" || payload?.status === "false_positive") {
    return closeIncident(id, {
      notes: payload.notes || "Closed from Incident Management screen.",
      isFalsePositive: payload.status === "false_positive",
    });
  }
  // TODO Phase 2/backend: replace this local acknowledgement when incident update/assign endpoints exist.
  return Promise.resolve(localResult({ _id: id, ...payload }, "Incident update is local-only in Phase 1"));
}

export function closeIncident(id, payload = {}) {
  return request({
    method: "PATCH",
    url: `${SOAR_BASE}/incidents/${id}/close`,
    data: {
      notes: payload.notes || payload.resolution || "Closed from SOAR",
      isFalsePositive: Boolean(payload.isFalsePositive),
    },
  });
}

export function getIncidentTimeline(id) {
  return getIncident(id).then((result) => localResult({ events: buildIncidentTimeline(result.data) }));
}

export function getIncidentArtifacts(id) {
  return getIncident(id).then((result) => localResult(buildIncidentArtifacts(result.data)));
}

export function createIncidentArtifact(id, payload) {
  return Promise.resolve(localResult({ incidentId: id, ...payload }, "Incident artifacts are local-only in Phase 1"));
}

export function getIncidentNotes(id) {
  const notes = readLocalList(LOCAL_NOTES_KEY).filter((note) => note.incidentId === id);
  return Promise.resolve(localResult(notes));
}

export function createIncidentNote(id, payload) {
  const notes = readLocalList(LOCAL_NOTES_KEY);
  const note = {
    _id: `note-${Date.now()}`,
    incidentId: id,
    content: payload.content,
    isInternal: payload.isInternal,
    createdAt: new Date().toISOString(),
  };
  writeLocalList(LOCAL_NOTES_KEY, [note, ...notes]);
  return Promise.resolve(localResult(note));
}

export function getRelatedIncidents(id) {
  return Promise.resolve(localResult({ explicit: [], inferred: [] }));
}

export function runIncidentPlaybook(id, payload) {
  if (payload?.playbookId) {
    return executePlaybook(id, payload.playbookId);
  }
  return Promise.reject(new Error("A saved backend playbook ID is required to execute a playbook."));
}

export function executePlaybook(incidentId, playbookId) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/incidents/${incidentId}/playbook/${playbookId}`,
  });
}

export function blockIp(payload) {
  // TODO backend: wire to a real SOAR/network containment endpoint when exposed.
  return Promise.resolve(localResult({ queued: true, action: "block_ip", ...payload }));
}

export function isolateHost(payload) {
  // TODO backend: wire to a real SOAR/network containment endpoint when exposed.
  return Promise.resolve(localResult({ queued: true, action: "isolate_host", ...payload }));
}

export function getSoarDashboardOverview() {
  return getIncidents({ limit: 100 }).then((result) => localResult(summarizeIncidents(result.data || [])));
}

export function getSoarAnalyticsKpis(params = { days: 30 }) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/analytics/kpis`,
    params,
  });
}

export function getSoarAnalyticsReport(params = { days: 30 }) {
  return getIncidents({ limit: 100, ...params }).then((result) => localResult(buildAnalyticsReport(result.data || [])));
}

export function exportSoarAnalytics(payload = { format: "csv", days: 30 }) {
  return Promise.resolve(localResult({ queued: false, ...payload }, "Analytics export is generated client-side in Phase 1"));
}

export function getSoarDashboardAnalysts() {
  return Promise.resolve(localResult([]));
}

export function getPlaybooks(params = {}) {
  const playbooks = readLocalList(LOCAL_PLAYBOOKS_KEY);
  return Promise.resolve(localResult(playbooks, "Playbooks are local-only until backend routes are exposed"));
}

export function createPlaybook(payload) {
  const playbooks = readLocalList(LOCAL_PLAYBOOKS_KEY);
  const playbook = {
    ...payload,
    _id: `local-playbook-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeLocalList(LOCAL_PLAYBOOKS_KEY, [playbook, ...playbooks]);
  return Promise.resolve(localResult(playbook));
}

export function updatePlaybook(id, payload) {
  const playbooks = readLocalList(LOCAL_PLAYBOOKS_KEY);
  const nextPlaybooks = playbooks.map((item) =>
    item._id === id ? { ...item, ...payload, _id: id, updatedAt: new Date().toISOString() } : item
  );
  writeLocalList(LOCAL_PLAYBOOKS_KEY, nextPlaybooks);
  return Promise.resolve(localResult(nextPlaybooks.find((item) => item._id === id) || { _id: id, ...payload }));
}
