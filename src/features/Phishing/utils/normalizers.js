export function normalizeList(payload, key = "data") {
  if (Array.isArray(payload)) return payload;
  return payload?.[key] ?? payload?.items ?? payload?.results ?? [];
}

export function normalizeCampaign(raw = {}, i = 0) {
  return {
    id: raw._id ?? raw.id ?? `camp-${i}`,
    name: raw.name ?? raw.title ?? "Untitled Campaign",
    status: (raw.status ?? "draft").toLowerCase(),
    templateId: raw.templateId ?? raw.template_id,
    landingPageId: raw.landingPageId ?? raw.landing_page_id,
    recipientsCount: Number(raw.recipientsCount ?? raw.recipient_count ?? 0),
    sent: Number(raw.sentCount ?? raw.sent ?? raw.emailsSent ?? 0),
    opened: Number(raw.openedCount ?? raw.opened ?? raw.opens ?? 0),
    clicked: Number(raw.clickedCount ?? raw.clicked ?? raw.clicks ?? 0),
    submitted: Number(raw.submittedCount ?? raw.submitted ?? raw.submits ?? 0),
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
    category: raw.category ?? "general",
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
    category: raw.category ?? "general",
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
  return {
    id: raw._id ?? raw.id ?? `rec-${i}`,
    email: raw.email ?? "",
    name: raw.name ?? raw.fullName ?? "",
    department: raw.department ?? "General",
    valid: raw.valid !== false && raw.isValid !== false,
    raw,
  };
}

export function normalizeTrackingEvent(raw = {}, i = 0) {
  const type = (raw.type ?? raw.eventType ?? "open").toLowerCase();
  const severityMap = {
    open: "info",
    click: "warning",
    visit: "warning",
    submit: "critical",
    download: "high",
  };
  return {
    id: raw.id ?? `ev-${i}`,
    type,
    email: raw.email ?? raw.recipient ?? "—",
    campaignId: raw.campaignId ?? raw.campaign_id,
    timestamp: raw.timestamp ?? raw.created_at ?? new Date().toISOString(),
    severity: raw.severity ?? severityMap[type] ?? "info",
    ip: raw.ip,
    userAgent: raw.userAgent ?? raw.user_agent,
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
