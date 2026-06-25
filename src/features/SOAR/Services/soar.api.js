import { request } from "../../../services/apiClient";

const SOAR_BASE = "/api/soar";

export function getIncidents(params = {}) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents`,
    params,
  });
}

export function getIncident(id) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents/${id}`,
  });
}

export function updateIncident(id, payload) {
  return request({
    method: "PATCH",
    url: `${SOAR_BASE}/incidents/${id}`,
    data: payload,
  });
}

export function closeIncident(id, payload = {}) {
  return request({
    method: "PATCH",
    url: `${SOAR_BASE}/incidents/${id}/close`,
    data: payload,
  });
}

export function getIncidentTimeline(id) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents/${id}/timeline`,
  });
}

export function getIncidentArtifacts(id) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents/${id}/artifacts`,
  });
}

export function createIncidentArtifact(id, payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/incidents/${id}/artifacts`,
    data: payload,
  });
}

export function getIncidentNotes(id) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents/${id}/notes`,
  });
}

export function createIncidentNote(id, payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/incidents/${id}/notes`,
    data: payload,
  });
}

export function getRelatedIncidents(id) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/incidents/${id}/related`,
  });
}

export function runIncidentPlaybook(id, payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/incidents/${id}/playbooks/run`,
    data: payload,
  });
}

export function blockIp(payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/integrations/network/block-ip`,
    data: payload,
  });
}

export function isolateHost(payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/integrations/network/isolate-host`,
    data: payload,
  });
}

export function getSoarDashboardOverview() {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/dashboard/overview`,
  });
}

export function getSoarAnalyticsKpis(params = { days: 30 }) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/analytics/kpis`,
    params,
  });
}

export function getSoarAnalyticsReport(params = { days: 30 }) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/analytics/report`,
    params,
  });
}

export function exportSoarAnalytics(payload = { format: "csv", days: 30 }) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/analytics/export`,
    data: payload,
  });
}

export function getSoarDashboardAnalysts() {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/dashboard/analysts`,
  });
}

export function getPlaybooks(params = {}) {
  return request({
    method: "GET",
    url: `${SOAR_BASE}/playbooks`,
    params,
  });
}

export function createPlaybook(payload) {
  return request({
    method: "POST",
    url: `${SOAR_BASE}/playbooks`,
    data: payload,
  });
}

export function updatePlaybook(id, payload) {
  return request({
    method: "PATCH",
    url: `${SOAR_BASE}/playbooks/${id}`,
    data: payload,
  });
}
