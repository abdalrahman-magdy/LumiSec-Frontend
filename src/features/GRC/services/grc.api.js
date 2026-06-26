import { request } from "../../../services/apiClient";

const GRC_BASE = "/api/grc";

export function getGrcDashboardOverview() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/overview` });
}

export function getGrcDashboardCompliance() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/compliance` });
}

export function getGrcDashboardTasks() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/tasks` });
}

export function getGrcDashboardRisks() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/risks` });
}

export function getGrcRiskHeatmap() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/risk-heatmap` });
}

export function getGrcTasks(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/tasks`,
    params,
  });
}

export function createGrcTask(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/tasks`,
    data: payload,
  });
}

export function updateGrcTask(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/tasks/${id}`,
    data: payload,
  });
}

export function getGrcFindings(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/findings`,
    params,
  });
}

export function createGrcFinding(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/findings`,
    data: payload,
  });
}

export function updateGrcFinding(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/findings/${id}`,
    data: payload,
  });
}

export function closeGrcFinding(id) {
  return request({ method: "PATCH", url: `${GRC_BASE}/findings/${id}/close` });
}

export function getGrcRisks(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/risks`,
    params,
  });
}

export function createGrcRisk(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/risks`,
    data: payload,
  });
}

export function getGrcControls(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/compliance/controls`,
    params,
  });
}

export function createGrcControl(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/compliance/controls`,
    data: payload,
  });
}

export function updateGrcControl(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/compliance/controls/${id}`,
    data: payload,
  });
}

export function getGrcReports(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/reports`,
    params,
  });
}

export function createGrcReport(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/reports`,
    data: payload,
  });
}

export function generateGrcReport(id) {
  return request({ method: "POST", url: `${GRC_BASE}/reports/${id}/generate` });
}

export function getGrcNotifications(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/notifications`,
    params,
  });
}

export function markGrcNotificationRead(id) {
  return request({ method: "PATCH", url: `${GRC_BASE}/notifications/${id}/read` });
}

export function getGrcAuditLogs(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/audit-logs`,
    params,
  });
}

export function uploadGrcEvidence(formData) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/evidence`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function ingestNetworkFinding(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/integrations/network/findings`,
    data: payload,
  });
}

export function ingestPhishingRisk(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/integrations/phishing/risk`,
    data: payload,
  });
}

export function ingestSiemAlert(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/integrations/siem/alerts`,
    data: payload,
  });
}
