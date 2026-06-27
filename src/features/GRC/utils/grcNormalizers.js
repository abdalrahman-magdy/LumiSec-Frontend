/**
 * Normalizes GRC API responses to shapes expected by existing UI components.
 * Backend is the source of truth; these helpers only map field names and defaults.
 */

export function normalizeDashboardOverview(data) {
  if (!data) return null;
  return {
    openFindings: data.openFindings ?? 0,
    openTasks: data.openTasks ?? 0,
    totalRisks: data.totalRisks ?? 0,
    findingsByStatus: Array.isArray(data.findingsByStatus) ? data.findingsByStatus : [],
    findingsBySeverity: Array.isArray(data.findingsBySeverity) ? data.findingsBySeverity : [],
  };
}

export function normalizeComplianceDashboard(data) {
  if (!data) return null;
  return {
    byFramework: Array.isArray(data.byFramework) ? data.byFramework : [],
    byStatus: Array.isArray(data.byStatus) ? data.byStatus : [],
  };
}

export function normalizeTasksDashboard(data) {
  if (!data) return null;
  return {
    byStatus: Array.isArray(data.byStatus) ? data.byStatus : [],
    byPriority: Array.isArray(data.byPriority) ? data.byPriority : [],
    overdue: data.overdue ?? 0,
  };
}

export function normalizeList(data) {
  return Array.isArray(data) ? data : [];
}

export function normalizePaginationParams(params = {}) {
  const next = { ...params };
  if (next.limit != null) next.limit = Math.min(Number(next.limit) || 20, 100);
  if (next.page != null) next.page = Math.max(Number(next.page) || 1, 1);
  return next;
}

export function normalizeTask(task) {
  if (!task) return task;
  return {
    ...task,
    _id: task._id ?? task.id,
    title: task.title ?? "",
    description: task.description ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "open",
    dueDate: task.dueDate ?? null,
    assignedTo: task.assignedTo ?? null,
    findingId: task.findingId ?? null,
    controlId: task.controlId ?? task.control?.controlId ?? null,
  };
}

export function normalizeFinding(finding) {
  if (!finding) return finding;
  return {
    ...finding,
    _id: finding._id ?? finding.id,
    title: finding.title ?? "Untitled finding",
    description: finding.description ?? "",
    status: finding.status ?? "open",
    severity: finding.severity ?? "medium",
  };
}

export function normalizeAssignee(user) {
  if (!user) return user;
  return {
    ...user,
    _id: user._id ?? user.id,
    name: user.name ?? "Unknown user",
    email: user.email ?? "",
    role: user.role ?? "",
  };
}

export function normalizeGrcUser(user) {
  if (!user) return user;
  return {
    ...user,
    _id: user._id ?? user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "",
    status: user.status ?? "active",
    department: user.department ?? "",
  };
}

export function normalizeControl(control) {
  if (!control) return control;
  return {
    ...control,
    _id: control._id ?? control.id,
    framework: control.framework ?? "UNSPECIFIED",
    controlId: control.controlId ?? "",
    title: control.title ?? "",
    description: control.description ?? "",
    status: control.status ?? "not_assessed",
  };
}

export function normalizeReport(report) {
  if (!report) return report;
  const findings = report.findings ?? [];
  return {
    ...report,
    _id: report._id ?? report.id,
    title: report.title ?? "Untitled report",
    framework: report.framework ?? "—",
    status: report.status ?? "draft",
    scope: report.scope ?? "",
    summary: report.summary ?? "",
    findingsCount: Array.isArray(findings) ? findings.length : 0,
    findings: Array.isArray(findings) ? findings : [],
    generatedBy: report.generatedBy ?? null,
    generatedAt: report.generatedAt ?? null,
  };
}

export function reportProgressPercent(status) {
  const map = { draft: 25, generating: 50, ready: 75, published: 100 };
  return map[status] ?? 10;
}
