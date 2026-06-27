import { normalizeCampaignStatus } from "./campaignStatus";

export function normalizeList(payload, key = "data") {
  if (Array.isArray(payload)) return payload;
  return payload?.[key] ?? payload?.items ?? payload?.results ?? [];
}

export function normalizeDashboardOverview(raw = {}) {
  const engagement = raw.engagement ?? {};
  const emailsSent = engagement.emailsSent ?? raw.emailsSent ?? 0;
  const openRate = engagement.openRate ?? raw.openRate ?? 0;
  const clickRate = engagement.clickRate ?? raw.clickRate ?? 0;
  const submitRate = engagement.submissionRate ?? raw.submitRate ?? raw.submissionRate ?? 0;
  const activeCampaigns = raw.activeCampaigns ?? 0;
  const risksCreated = raw.totalRisks ?? raw.risksCreated ?? 0;
  const successRate = emailsSent
    ? Math.max(0, Math.round(100 - submitRate))
    : raw.successRate ?? 0;

  return {
    activeCampaigns,
    emailsSent,
    opened: engagement.opened ?? raw.opened ?? 0,
    clicked: engagement.clicked ?? raw.clicked ?? 0,
    submitted: engagement.submitted ?? raw.submitted ?? 0,
    openRate,
    clickRate,
    submitRate,
    risksCreated,
    successRate,
    totalCampaigns: raw.totalCampaigns,
    totalRecipients: raw.totalRecipients,
    industryOpenAvg: raw.industryOpenAvg ?? 65,
    industryClickAvg: raw.industryClickAvg ?? 41,
    criticalThreshold: raw.criticalThreshold ?? 15,
    raw,
  };
}

export function normalizeDashboardRiskUser(raw = {}, i = 0) {
  const recipient = raw.recipientId ?? {};
  const email = recipient.email ?? raw.email ?? "—";
  const name = recipient.fullName ?? raw.name ?? raw.fullName ?? email;
  const department = recipient.department ?? raw.department ?? "General";
  const level = (raw.riskLevel ?? raw.level ?? "medium").toLowerCase();
  const scoreMap = { critical: 95, high: 82, medium: 55, low: 25 };
  return {
    id: raw._id ?? raw.id ?? `risk-${i}`,
    email,
    name,
    department,
    score: raw.score ?? scoreMap[level] ?? 50,
    level,
    reason: raw.reason,
    raw,
  };
}

export function normalizeDashboardRisks(payload = {}) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeDashboardRiskUser);
  }
  const recent = payload.recent ?? payload.risks ?? [];
  return recent.map(normalizeDashboardRiskUser);
}

export function normalizeDashboardDepartment(raw = {}, i = 0) {
  const department = raw.department ?? raw._id ?? `Dept ${i + 1}`;
  const employees = Number(raw.recipients ?? raw.employees ?? 0);
  const clicked = Number(raw.clicked ?? 0);
  const submitted = Number(raw.submitted ?? 0);
  const opened = Number(raw.opened ?? 0);
  const vulnerability = raw.vulnerability ?? (
    employees
      ? Math.round(((clicked + submitted * 2) / Math.max(employees, 1)) * 100)
      : 0
  );
  return {
    department,
    employees,
    clicked,
    opened,
    submitted,
    vulnerability: Math.min(vulnerability, 100),
    avgRiskScore: raw.avgRiskScore,
    raw,
  };
}

export function normalizeDashboardTrends(raw = {}) {
  if (raw.labels && (raw.openRate || raw.clickRate || raw.submitRate)) {
    return raw;
  }
  const rows = Array.isArray(raw) ? raw : raw.events ?? raw.trends ?? [];
  const byDate = new Map();

  rows.forEach((row) => {
    const date = row._id?.date ?? row.date ?? row.label;
    if (!date) return;
    if (!byDate.has(date)) {
      byDate.set(date, { open: 0, click: 0, submit: 0, sent: 0 });
    }
    const bucket = byDate.get(date);
    const type = (row._id?.eventType ?? row.eventType ?? row.type ?? "").toLowerCase();
    const count = row.count ?? row.value ?? 0;
    if (type.includes("open")) bucket.open += count;
    else if (type.includes("click")) bucket.click += count;
    else if (type.includes("submit")) bucket.submit += count;
    else if (type.includes("sent")) bucket.sent += count;
  });

  const labels = [...byDate.keys()].sort();
  const openRate = [];
  const clickRate = [];
  const submitRate = [];

  labels.forEach((label) => {
    const b = byDate.get(label);
    const sent = Math.max(b.sent || b.open + b.click + b.submit, 1);
    openRate.push(Number(((b.open / sent) * 100).toFixed(1)));
    clickRate.push(Number(((b.click / sent) * 100).toFixed(1)));
    submitRate.push(Number(((b.submit / sent) * 100).toFixed(1)));
  });

  return { labels, openRate, clickRate, submitRate, raw };
}

export function campaignRates(campaign = {}) {
  const sent = Number(campaign.sent ?? campaign.sentCount ?? 0);
  const opened = Number(campaign.opened ?? campaign.openedCount ?? 0);
  const clicked = Number(campaign.clicked ?? campaign.clickedCount ?? 0);
  const submitted = Number(campaign.submitted ?? campaign.submittedCount ?? 0);
  return {
    openRate: sent ? Math.round((opened / sent) * 100) : 0,
    clickRate: sent ? Math.round((clicked / sent) * 100) : 0,
    submitRate: sent ? Math.round((submitted / sent) * 100) : 0,
  };
}

function refId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id ?? value.id ?? "";
}

export function normalizeCampaign(raw = {}, i = 0) {
  return {
    id: raw._id ?? raw.id ?? `camp-${i}`,
    name: raw.name ?? raw.title ?? "Untitled Campaign",
    status: normalizeCampaignStatus(raw.status),
    templateId: refId(raw.templateId ?? raw.template_id),
    landingPageId: refId(raw.landingPageId ?? raw.landing_page_id),
    recipientsCount: Number(raw.recipientsCount ?? raw.recipient_count ?? 0),
    sent: Number(raw.sentCount ?? raw.sent ?? raw.emailsSent ?? raw.totalSent ?? 0),
    opened: Number(raw.openedCount ?? raw.opened ?? raw.opens ?? raw.stats?.opens ?? 0),
    clicked: Number(raw.clickedCount ?? raw.clicked ?? raw.clicks ?? raw.stats?.clicks ?? 0),
    submitted: Number(raw.submittedCount ?? raw.submitted ?? raw.submits ?? raw.stats?.submissions ?? 0),
    createdAt: raw.createdAt ?? raw.created_at,
    raw,
  };
}

export function normalizeTemplate(raw = {}, i = 0) {
  return {
    id: raw._id ?? raw.id ?? `tpl-${i}`,
    name: raw.name ?? "Template",
    subject: raw.subject ?? "",
    body: raw.htmlBody ?? raw.body ?? raw.html ?? "",
    category: raw.category || null,
    updatedAt: raw.updatedAt ?? raw.updated_at,
    raw,
  };
}

export function normalizeLandingPage(raw = {}, i = 0) {
  return {
    id: raw._id ?? raw.id ?? `lp-${i}`,
    name: raw.name ?? "Landing Page",
    title: raw.title ?? raw.name ?? "Landing Page",
    url: raw.redirectUrl ?? raw.url ?? raw.path ?? "",
    html: raw.htmlContent ?? raw.html ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at,
    raw,
  };
}

export function normalizeReportStats(raw = {}) {
  return {
    campaigns: raw.campaigns ?? raw.totalCampaigns,
    totalRecipients: raw.totalRecipients ?? raw.recipients ?? raw.emailsSent,
    avgClickRate: raw.avgClickRate ?? raw.clickRate ?? 0,
    avgSubmitRate: raw.avgSubmitRate ?? raw.submissionRate ?? 0,
    highRiskUsers: raw.highRiskUsers ?? raw.submitted ?? 0,
    emailsSent: raw.emailsSent ?? raw.sent ?? 0,
    opened: raw.opened ?? 0,
    clicked: raw.clicked ?? 0,
    submitted: raw.submitted ?? 0,
    openRate: raw.openRate ?? 0,
    clickRate: raw.clickRate ?? raw.avgClickRate ?? 0,
    submissionRate: raw.submissionRate ?? raw.avgSubmitRate ?? 0,
    raw,
  };
}

export function normalizeRecipient(raw = {}, i = 0) {
  const status = (raw.status ?? "pending").toLowerCase();
  return {
    id: raw._id ?? raw.id ?? `rec-${i}`,
    email: raw.email ?? "",
    name: raw.name ?? raw.fullName ?? "",
    department: raw.department ?? "General",
    status,
    valid: raw.valid !== false && raw.isValid !== false && Boolean(raw.email?.includes("@")),
    raw,
  };
}

export function normalizeImportResult(raw = {}) {
  const imported = Number(raw.imported ?? raw.count ?? 0);
  const list = raw.recipients ?? [];
  return {
    imported,
    recipients: Array.isArray(list) ? list.map(normalizeRecipient) : [],
    raw,
  };
}

export function normalizeTrackingEvent(raw = {}, i = 0) {
  const type = (raw.type ?? raw.eventType ?? "open").toLowerCase().replace(/_/g, "_");
  const eventLabel = type.replace(/_/g, " ");
  const severityMap = {
    email_sent: "info",
    email_opened: "info",
    open: "info",
    link_clicked: "warning",
    click: "warning",
    form_visited: "warning",
    visit: "warning",
    credential_submitted: "critical",
    submit: "critical",
    attachment_downloaded: "high",
    download: "high",
  };
  const recipient = raw.recipientId ?? {};
  return {
    id: raw._id ?? raw.id ?? `ev-${i}`,
    type: type.includes("submit") ? "submit" : type.includes("click") ? "click" : type.includes("open") ? "open" : type,
    email: raw.email ?? recipient.email ?? raw.recipient ?? "—",
    campaignId: raw.campaignId?._id ?? raw.campaignId ?? raw.campaign_id,
    timestamp: raw.timestamp ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    severity: raw.severity ?? severityMap[type] ?? "info",
    ip: raw.ipAddress ?? raw.ip,
    userAgent: raw.userAgent ?? raw.user_agent,
    eventLabel,
    raw,
  };
}

export function formatPercent(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  return `${v}%`;
}

export function formatNumber(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return n ?? "—";
  return v.toLocaleString();
}

export function riskLevelClass(level) {
  if (level === "high" || level === "critical") return "phishing-risk-high";
  if (level === "medium") return "phishing-risk-medium";
  return "phishing-risk-low";
}
