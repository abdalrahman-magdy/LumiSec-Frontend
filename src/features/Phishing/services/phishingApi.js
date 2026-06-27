import phishingClient, { phishingTrackClient } from "./apiClient";
import { apiClient } from "../../../services/apiClient";
import {
  normalizeCampaign,
  normalizeDashboardDepartment,
  normalizeDashboardOverview,
  normalizeDashboardRisks,
  normalizeDashboardTrends,
  normalizeImportResult,
  normalizeLandingPage,
  normalizeList,
  normalizeRecipient,
  normalizeReportStats,
  normalizeTemplate,
  normalizeTrackingEvent,
} from "../utils/normalizers";
import {
  MOCK_CAMPAIGNS,
  MOCK_DEPARTMENTS,
  MOCK_LANDING_PAGES,
  MOCK_OVERVIEW,
  MOCK_QUEUE,
  MOCK_RECIPIENTS,
  MOCK_REPORT_STATS,
  MOCK_RISKS,
  MOCK_TEMPLATES,
  MOCK_TRACKING_EVENTS,
  MOCK_TRENDS,
} from "../utils/mockData";

const USE_MOCK = process.env.REACT_APP_PHISHING_MOCK_FALLBACK !== "false";

function unwrap(body) {
  return body?.success && Object.prototype.hasOwnProperty.call(body, "data")
    ? body.data
    : body;
}

async function withMock(apiCall, mockData, label) {
  try {
    const res = await apiCall();
    return { data: unwrap(res.data), isMock: false };
  } catch (err) {
    if (!USE_MOCK) throw err;
    console.warn(`[Phishing] ${label} — mock fallback`, err.message);
    return { data: mockData, isMock: true, error: err.message };
  }
}

async function mutate(apiCall, mockData = null, label = "mutation") {
  try {
    const res = await apiCall();
    return { data: unwrap(res.data), isMock: false };
  } catch (err) {
    if (!USE_MOCK) throw err;
    console.warn(`[Phishing] ${label} — demo fallback`, err.message);
    return { data: typeof mockData === "function" ? mockData() : mockData, isMock: true, error: err.message };
  }
}

function compactPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function toTemplatePayload(payload = {}) {
  return compactPayload({
    name: cleanText(payload.name),
    subject: cleanText(payload.subject),
    htmlBody: payload.htmlBody ?? payload.body,
    textBody: payload.textBody,
    category: cleanText(payload.category),
    language: cleanText(payload.language) || "en",
  });
}

function toLandingPagePayload(payload = {}) {
  return compactPayload({
    name: cleanText(payload.name),
    title: cleanText(payload.title ?? payload.name),
    htmlContent: payload.htmlContent ?? payload.html,
    redirectUrl: cleanText(payload.redirectUrl ?? payload.url),
  });
}

function toCampaignPayload(payload = {}) {
  return compactPayload({
    name: cleanText(payload.name),
    description: payload.description,
    templateId: payload.templateId,
    landingPageId: payload.landingPageId,
    launchDate: payload.launchDate,
    trackingDomain: payload.trackingDomain,
    status: payload.status,
  });
}

function normalizeQueue(stats = {}) {
  const sent = Number(stats.emailsSent ?? stats.sent ?? 0);
  const total = Number(stats.totalRecipients ?? stats.recipientsCount ?? sent);
  const failed = Number(stats.failed ?? 0);
  return {
    sent,
    total,
    pending: Math.max(total - sent - failed, 0),
    failed,
    status: stats.status ?? "draft",
    logs: [],
    raw: stats,
  };
}

// ─── DASHBOARD ───────────────────────────────────────────────────

export const getDashboardOverview = () =>
  withMock(() => phishingClient.get("/dashboard/overview"), MOCK_OVERVIEW, "overview").then((r) => ({
    ...r,
    data: normalizeDashboardOverview(r.data),
  }));

export const getDashboardRisks = () =>
  withMock(() => phishingClient.get("/dashboard/risks"), MOCK_RISKS, "risks").then((r) => ({
    ...r,
    data: normalizeDashboardRisks(r.data),
  }));

export const getDashboardDepartments = () =>
  withMock(() => phishingClient.get("/dashboard/departments"), MOCK_DEPARTMENTS, "departments").then((r) => ({
    ...r,
    data: (Array.isArray(r.data) ? r.data : []).map(normalizeDashboardDepartment),
  }));

export const getDashboardTrends = (params) =>
  withMock(() => phishingClient.get("/dashboard/trends", { params }), MOCK_TRENDS, "trends").then((r) => ({
    ...r,
    data: normalizeDashboardTrends(r.data),
  }));

// ─── TEMPLATES ───────────────────────────────────────────────────

export const listTemplates = () =>
  withMock(() => phishingClient.get("/templates"), MOCK_TEMPLATES, "templates").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTemplate),
  }));

export const getTemplate = (id) =>
  withMock(
    () => phishingClient.get(`/templates/${id}`),
    MOCK_TEMPLATES.find((t) => t.id === id) ?? MOCK_TEMPLATES[0],
    "getTemplate"
  ).then((r) => ({ ...r, data: normalizeTemplate(r.data?.template ?? r.data) }));

export const createTemplate = (payload) =>
  mutate(() => phishingClient.post("/templates", toTemplatePayload(payload)), null, "createTemplate")
    .then((r) => ({ ...r, data: normalizeTemplate(r.data) }));

export const updateTemplate = (id, payload) =>
  mutate(() => phishingClient.patch(`/templates/${id}`, toTemplatePayload(payload)), null, "updateTemplate")
    .then((r) => ({ ...r, data: normalizeTemplate(r.data) }));

export const deleteTemplate = (id) => mutate(() => phishingClient.delete(`/templates/${id}`), null, "deleteTemplate");

// ─── LANDING PAGES ───────────────────────────────────────────────

export const listLandingPages = () =>
  withMock(() => phishingClient.get("/landing-pages"), MOCK_LANDING_PAGES, "landing-pages").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeLandingPage),
  }));

export const getLandingPage = (id) =>
  withMock(
    () => phishingClient.get(`/landing-pages/${id}`),
    MOCK_LANDING_PAGES.find((p) => p.id === id) ?? MOCK_LANDING_PAGES[0],
    "getLandingPage"
  ).then((r) => ({ ...r, data: normalizeLandingPage(r.data?.page ?? r.data) }));

export const createLandingPage = (payload) =>
  mutate(() => phishingClient.post("/landing-pages", toLandingPagePayload(payload)), null, "createLandingPage")
    .then((r) => ({ ...r, data: normalizeLandingPage(r.data) }));

export const updateLandingPage = (id, payload) =>
  mutate(() => phishingClient.patch(`/landing-pages/${id}`, toLandingPagePayload(payload)), null, "updateLandingPage")
    .then((r) => ({ ...r, data: normalizeLandingPage(r.data) }));

export const deleteLandingPage = (id) => mutate(() => phishingClient.delete(`/landing-pages/${id}`), null, "deleteLandingPage");

// ─── RECIPIENTS ──────────────────────────────────────────────────

export const listRecipients = (params) =>
  withMock(() => phishingClient.get("/recipients", { params }), MOCK_RECIPIENTS, "recipients").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeRecipient),
    total: r.data?.total ?? r.total ?? normalizeList(r.data).length,
  }));

export const getRecipient = (id) =>
  withMock(
    () => phishingClient.get(`/recipients/${id}`),
    MOCK_RECIPIENTS.find((r) => r.id === id),
    "getRecipient"
  ).then((r) => ({ ...r, data: normalizeRecipient(r.data) }));

export const updateRecipient = (id, payload) => mutate(() => phishingClient.patch(`/recipients/${id}`, payload));
export const deleteRecipient = (id) => mutate(() => phishingClient.delete(`/recipients/${id}`), null, "deleteRecipient");

export const importRecipientsCsv = async (file, campaignId) => {
  const csv = typeof file === "string" ? file : await file.text();
  const body = compactPayload({ csv, campaignId });
  const mockFallback = () => {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    const imported = Math.max(lines.length - 1, 0);
    return normalizeImportResult({ imported, recipients: [] });
  };
  return mutate(
    () => phishingClient.post("/recipients/import", body),
    mockFallback,
    "importRecipientsCsv"
  ).then((r) => ({ ...r, data: normalizeImportResult(r.data) }));
};

// ─── CAMPAIGNS ───────────────────────────────────────────────────

export const listCampaigns = (params) =>
  withMock(() => phishingClient.get("/campaigns", { params }), MOCK_CAMPAIGNS, "campaigns").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeCampaign),
  }));

export const getCampaign = (id) =>
  withMock(
    () => phishingClient.get(`/campaigns/${id}`),
    MOCK_CAMPAIGNS.find((c) => c.id === id) ?? MOCK_CAMPAIGNS[0],
    "getCampaign"
  ).then((r) => ({ ...r, data: normalizeCampaign(r.data) }));

export const createCampaign = (payload) => mutate(
  () => phishingClient.post("/campaigns", toCampaignPayload(payload)),
  () => ({ _id: `mock-campaign-${Date.now()}`, ...toCampaignPayload(payload), status: "draft" }),
  "createCampaign"
).then((r) => ({ ...r, data: normalizeCampaign(r.data?.campaign ?? r.data) }));

export const updateCampaign = (id, payload) => mutate(
  () => phishingClient.patch(`/campaigns/${id}`, toCampaignPayload(payload)),
  () => ({ _id: id, ...toCampaignPayload(payload) }),
  "updateCampaign"
).then((r) => ({ ...r, data: normalizeCampaign(r.data) }));

export const deleteCampaign = (id) => mutate(
  () => phishingClient.delete(`/campaigns/${id}`),
  () => ({ deleted: true, id }),
  "deleteCampaign"
);

function toRecipientAttachPayload(item) {
  if (typeof item === "string") return compactPayload({ email: item });
  return compactPayload({
    email: cleanText(item.email),
    fullName: cleanText(item.fullName ?? item.name),
    department: cleanText(item.department),
    jobTitle: cleanText(item.jobTitle),
    manager: cleanText(item.manager),
  });
}

export const attachCampaignRecipients = (id, recipients) => {
  const list = Array.isArray(recipients) ? recipients : [];
  const body = {
    recipients: list.map(toRecipientAttachPayload),
  };
  return mutate(
    () => phishingClient.post(`/campaigns/${id}/recipients`, body),
    () => ({ added: list.length, recipients: [] }),
    "attachCampaignRecipients"
  ).then((r) => ({
    ...r,
    data: {
      added: Number(r.data?.added ?? list.length),
      recipients: r.data?.recipients ?? [],
    },
  }));
};

export const launchCampaign = (id, payload = {}) => mutate(
  () => phishingClient.post(`/campaigns/${id}/launch`, compactPayload(payload)),
  { queued: 0 },
  "launchCampaign"
).then((r) => ({
  ...r,
  data: {
    queued: Number(r.data?.queued ?? 0),
    campaign: r.data?.campaign ? normalizeCampaign(r.data.campaign) : undefined,
    ...r.data,
  },
}));

export const pauseCampaign = (id) => mutate(
  () => phishingClient.post(`/campaigns/${id}/pause`),
  { id, status: "paused" },
  "pauseCampaign"
);

export const resumeCampaign = (id) => mutate(
  () => phishingClient.post(`/campaigns/${id}/resume`),
  { id, status: "running" },
  "resumeCampaign"
);

export const stopCampaign = (id) => mutate(
  () => phishingClient.post(`/campaigns/${id}/stop`),
  { id, status: "cancelled" },
  "stopCampaign"
);

export const getCampaignQueue = (id) =>
  withMock(
    async () => {
      const [statsRes, campaignRes] = await Promise.all([
        phishingClient.get(`/reports/${id}/stats`),
        phishingClient.get(`/campaigns/${id}`),
      ]);
      const stats = unwrap(statsRes.data);
      const campaign = unwrap(campaignRes.data);
      return {
        ...stats,
        totalRecipients: campaign?.recipientsCount ?? stats.totalRecipients,
        recipientsCount: campaign?.recipientsCount,
        status: campaign?.status,
      };
    },
    MOCK_QUEUE,
    "queue"
  ).then((r) => ({
    ...r,
    data: r.isMock ? r.data : normalizeQueue(r.data),
  }));

// ─── TRACKING (admin) ────────────────────────────────────────────

function listTrackingEvents(params = {}) {
  return phishingClient.get("/events", { params });
}

export const getTrackingLogs = (params) =>
  withMock(() => listTrackingEvents(params), MOCK_TRACKING_EVENTS, "tracking-logs").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

export const getTrackingTimeline = (params) =>
  withMock(() => listTrackingEvents(params), MOCK_TRACKING_EVENTS, "timeline").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

// ─── TRACKING (public — no JWT) ──────────────────────────────────

export const trackOpen = (trackingId) =>
  phishingTrackClient.get(`/track/open/${trackingId}`, { responseType: "blob" });

export const trackClick = (trackingId, url) =>
  phishingTrackClient.get(`/track/click/${trackingId}`, { params: { url }, maxRedirects: 0, validateStatus: (s) => s >= 200 && s < 400 });

export const trackVisit = (trackingId) =>
  phishingTrackClient.post(`/track/visit/${trackingId}`);

export const trackSubmit = (trackingId, payload) =>
  phishingTrackClient.post(`/track/submit/${trackingId}`, { username: payload.username ?? payload.email ?? "user" });

export const trackDownload = (trackingId, payload = {}) =>
  phishingTrackClient.post(`/track/download/${trackingId}`, payload);

// ─── REPORTS ─────────────────────────────────────────────────────

export const getReportStats = (campaignId) =>
  campaignId
    ? withMock(() => phishingClient.get(`/reports/${campaignId}/stats`), MOCK_REPORT_STATS, "report-stats")
      .then((r) => ({ ...r, data: normalizeReportStats(r.data) }))
    : withMock(() => phishingClient.get("/dashboard/overview"), MOCK_REPORT_STATS, "report-stats")
      .then((r) => ({ ...r, data: normalizeReportStats(r.data) }));

export const generateReport = (campaignId) => mutate(() => phishingClient.post(`/reports/${campaignId}/generate`));

export const getReport = (id) =>
  withMock(() => phishingClient.get(`/reports/${id}/stats`), { id, summary: MOCK_REPORT_STATS }, "getReport");

export const downloadReport = async (campaignId) => {
  const res = await phishingClient.get(`/reports/${campaignId}/download`, { responseType: "blob" });
  triggerBrowserDownload(res.data, `phishing-report-${campaignId}.pdf`);
  return res;
};

export function triggerBrowserDownload(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

// ─── INTEGRATIONS ────────────────────────────────────────────────

async function postIntegration(path, payload) {
  try {
    return await mutate(() => apiClient.post(path, payload));
  } catch (err) {
    if (!USE_MOCK) throw err;
    return { data: { status: "queued", mock: true, path } };
  }
}

export const pushToGrc = (payload) => postIntegration("/api/grc/integrations/phishing/risk", payload);
export const pushToSoar = (payload) => postIntegration("/api/soar/incidents", payload);
export const pushToSiem = (payload) => postIntegration("/api/grc/integrations/siem/alerts", payload);
export const pushToOpenCti = (payload) => postIntegration("/api/grc/integrations/opencti/ioc", payload);

function inferOpenCtiType(indicator = "") {
  const value = String(indicator).trim();
  if (/^https?:\/\//i.test(value)) return "url";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return "ip";
  return "domain";
}

export function buildIntegrationPayload(campaign) {
  const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
  const campaignId = campaign?._id ?? campaign?.id;
  const validCampaignId = isObjectId(campaignId) ? campaignId : undefined;
  const recipientId = campaign?.recipientId ?? campaign?.raw?.recipientId;
  const validRecipientId = isObjectId(recipientId) ? recipientId : undefined;
  return {
    grc: compactPayload({
      eventType: campaign?.submitted > 0 ? "submit" : "click",
      owner: campaign?.owner,
      title: `Phishing campaign: ${campaign?.name}`,
      description: "Campaign result pushed from phishing simulation",
    }),
    soar: compactPayload({
      title: `[Phishing] ${campaign?.name}`,
      severity: campaign?.submitted > 10 ? "high" : "medium",
      description: "Phishing simulation event escalated to SOAR",
    }),
    siem: validCampaignId && validRecipientId ? compactPayload({
      alertId: `phishing-${validCampaignId}-${validRecipientId}`,
      ruleName: `Phishing event: ${campaign?.name}`,
      severity: campaign?.submitted > 0 ? "high" : "medium",
      sourceIp: campaign?.sourceIp,
      indexName: "phishing",
    }) : null,
    opencti: compactPayload({
      indicator: campaign?.trackingDomain ?? campaign?.name ?? campaignId,
      iocType: inferOpenCtiType(campaign?.trackingDomain ?? campaign?.name),
      title: `Phishing campaign: ${campaign?.name}`,
      description: "Campaign indicator pushed from phishing simulation",
      confidence: 3,
    }),
  };
}
