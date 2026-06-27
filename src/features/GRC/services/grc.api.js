import { request, apiClient } from "../../../services/apiClient";
import { normalizePaginationParams } from "../utils/grcNormalizers";

const GRC_BASE = "/api/grc";

function withListParams(params = {}) {
  return normalizePaginationParams(params);
}

function compactPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
}

// ─── Dashboard ───────────────────────────────────────────────────

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

// ─── Assignees ───────────────────────────────────────────────────

export function getGrcAssignees(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/users/assignees`,
    params: withListParams(params),
  });
}

export function getGrcUsers(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/users`,
    params: withListParams(params),
  });
}

export function createGrcUser(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/users`,
    data: compactPayload({
      name: payload.name?.trim(),
      email: payload.email?.trim(),
      password: payload.password,
      role: payload.role,
      department: payload.department?.trim() || undefined,
    }),
  });
}

export function updateGrcUser(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/users/${id}`,
    data: compactPayload({
      id,
      name: payload.name?.trim(),
      role: payload.role,
      status: payload.status,
      department: payload.department?.trim(),
    }),
  });
}

// ─── Tasks ───────────────────────────────────────────────────────

export function getGrcTasks(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/tasks`,
    params: withListParams(params),
  });
}

export function createGrcTask(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/tasks`,
    data: compactPayload({
      findingId: payload.findingId,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      assignedTo: payload.assignedTo,
      dueDate: payload.dueDate || undefined,
      priority: payload.priority || "medium",
    }),
  });
}

export function updateGrcTask(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/tasks/${id}`,
    data: compactPayload({
      id,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      assignedTo: payload.assignedTo,
      dueDate: payload.dueDate || undefined,
      priority: payload.priority,
      status: payload.status,
    }),
  });
}

// ─── Findings ────────────────────────────────────────────────────

export function getGrcFindings(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/findings`,
    params: withListParams(params),
  });
}

export function createGrcFinding(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/findings`,
    data: compactPayload({
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      severity: payload.severity || "medium",
      riskRating: payload.riskRating || "medium",
      asset: payload.asset?.trim() || undefined,
      assignedTo: payload.assignedTo || undefined,
      dueDate: payload.dueDate || undefined,
      control: payload.control?.trim() || undefined,
      sourceModule: "manual",
    }),
  });
}

export function updateGrcFinding(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/findings/${id}`,
    data: { id, ...payload },
  });
}

export function closeGrcFinding(id) {
  return request({ method: "PATCH", url: `${GRC_BASE}/findings/${id}/close`, data: { id } });
}

// ─── Risks ───────────────────────────────────────────────────────

export function getGrcRisks(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/risks`,
    params: withListParams(params),
  });
}

export function createGrcRisk(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/risks`,
    data: payload,
  });
}

// ─── Compliance controls ─────────────────────────────────────────

export function getGrcControls(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/compliance/controls`,
    params: withListParams(params),
  });
}

export function createGrcControl(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/compliance/controls`,
    data: compactPayload({
      framework: payload.framework,
      controlId: payload.controlId?.trim(),
      title: payload.title?.trim(),
      description: payload.description?.trim() ?? "",
      status: payload.status || "not_assessed",
    }),
  });
}

export function updateGrcControl(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/compliance/controls/${id}`,
    data: compactPayload({
      id,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      status: payload.status,
    }),
  });
}

// ─── Reports ─────────────────────────────────────────────────────

export function getGrcReports(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/reports`,
    params: withListParams(params),
  });
}

export function getGrcReport(id) {
  return request({ method: "GET", url: `${GRC_BASE}/reports/${id}` });
}

export function createGrcReport(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/reports`,
    data: compactPayload({
      title: payload.title?.trim(),
      framework: payload.framework,
      scope: payload.scope?.trim() || undefined,
      summary: payload.summary?.trim() || undefined,
      findings: Array.isArray(payload.findings) && payload.findings.length ? payload.findings : undefined,
    }),
  });
}

export function addGrcReportFindings(id, findingIds) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/reports/${id}/findings`,
    data: { id, findingIds },
  });
}

export function generateGrcReport(id) {
  return request({ method: "POST", url: `${GRC_BASE}/reports/${id}/generate`, data: { id } });
}

export async function downloadGrcReport(id, filename = "audit-report.pdf") {
  const response = await apiClient.get(`${GRC_BASE}/reports/${id}/download`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/pdf",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ─── Notifications & audit logs ──────────────────────────────────

export function getGrcNotifications(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/notifications`,
    params: withListParams(params),
  });
}

export function markGrcNotificationRead(id) {
  return request({ method: "PATCH", url: `${GRC_BASE}/notifications/${id}/read`, data: { id } });
}

export function getGrcAuditLogs(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/audit-logs`,
    params: withListParams(params),
  });
}

// ─── Evidence ────────────────────────────────────────────────────

export function uploadGrcEvidence(formData) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/evidence`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ─── Integrations (used by other modules; kept for reference) ───

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
