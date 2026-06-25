import phishingClient, { phishingTrackClient } from "./apiClient";
import {
  normalizeCampaign,
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

const USE_MOCK = process.env.REACT_APP_PHISHING_MOCK_FALLBACK === "true";

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

async function mutate(apiCall) {
  const res = await apiCall();
  return { data: unwrap(res.data), isMock: false };
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
    name: payload.name,
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
    status: stats.status ?? "active",
    logs: [],
    raw: stats,
  };
}

// ─── DASHBOARD ───────────────────────────────────────────────────

export const getDashboardOverview = () =>
  withMock(() => phishingClient.get("/dashboard/overview"), MOCK_OVERVIEW, "overview");

export const getDashboardRisks = () =>
  withMock(() => phishingClient.get("/dashboard/risks"), MOCK_RISKS, "risks");

export const getDashboardDepartments = () =>
  withMock(() => phishingClient.get("/dashboard/departments"), MOCK_DEPARTMENTS, "departments");

export const getDashboardTrends = () =>
  withMock(() => phishingClient.get("/dashboard/trends"), MOCK_TRENDS, "trends");

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

export const createTemplate = (payload) => mutate(() => phishingClient.post("/templates", toTemplatePayload(payload)));
export const updateTemplate = (id, payload) => mutate(() => phishingClient.patch(`/templates/${id}`, toTemplatePayload(payload)));
export const deleteTemplate = (id) => mutate(() => phishingClient.delete(`/templates/${id}`));

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

export const createLandingPage = (payload) => mutate(() => phishingClient.post("/landing-pages", toLandingPagePayload(payload)));
export const updateLandingPage = (id, payload) => mutate(() => phishingClient.patch(`/landing-pages/${id}`, toLandingPagePayload(payload)));
export const deleteLandingPage = (id) => mutate(() => phishingClient.delete(`/landing-pages/${id}`));

// ─── RECIPIENTS ──────────────────────────────────────────────────

export const listRecipients = (params) =>
  withMock(() => phishingClient.get("/recipients", { params }), MOCK_RECIPIENTS, "recipients").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeRecipient),
  }));

export const getRecipient = (id) =>
  withMock(
    () => phishingClient.get(`/recipients/${id}`),
    MOCK_RECIPIENTS.find((r) => r.id === id),
    "getRecipient"
  ).then((r) => ({ ...r, data: normalizeRecipient(r.data) }));

export const updateRecipient = (id, payload) => mutate(() => phishingClient.patch(`/recipients/${id}`, payload));
export const deleteRecipient = (id) => mutate(() => phishingClient.delete(`/recipients/${id}`));

function parseRecipientsCsv(csv = "") {
  return csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [email, fullName, department, jobTitle, manager] = line.split(",").map((cell) => cell?.trim());
      return { email, fullName, department, jobTitle, manager };
    })
    .filter((recipient) => recipient.email);
}

export const importRecipientsCsv = async (file) => {
  const csv = typeof file === "string" ? file : await file.text();
  return mutate(() => phishingClient.post("/recipients/import", {
    csv,
    recipients: parseRecipientsCsv(csv),
  }));
};

// ─── CAMPAIGNS ───────────────────────────────────────────────────

export const listCampaigns = () =>
  withMock(() => phishingClient.get("/campaigns"), MOCK_CAMPAIGNS, "campaigns").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeCampaign),
  }));

export const getCampaign = (id) =>
  withMock(
    () => phishingClient.get(`/campaigns/${id}`),
    MOCK_CAMPAIGNS.find((c) => c.id === id) ?? MOCK_CAMPAIGNS[0],
    "getCampaign"
  ).then((r) => ({ ...r, data: normalizeCampaign(r.data?.campaign ?? r.data) }));

export const createCampaign = (payload) => mutate(() => phishingClient.post("/campaigns", toCampaignPayload(payload)));
export const updateCampaign = (id, payload) => mutate(() => phishingClient.patch(`/campaigns/${id}`, toCampaignPayload(payload)));
export const deleteCampaign = (id) => mutate(() => phishingClient.delete(`/campaigns/${id}`));
export const attachCampaignRecipients = (id, recipientIds) =>
  mutate(() => phishingClient.post(`/campaigns/${id}/recipients`, {
    recipients: recipientIds.map((recipient) =>
      typeof recipient === "string" ? { email: recipient } : recipient
    ),
  }));
export const launchCampaign = (id) => mutate(() => phishingClient.post(`/campaigns/${id}/launch`));
export const pauseCampaign = (id) => mutate(() => phishingClient.post(`/campaigns/${id}/pause`));
export const resumeCampaign = (id) => mutate(() => phishingClient.post(`/campaigns/${id}/resume`));
export const stopCampaign = (id) => mutate(() => phishingClient.post(`/campaigns/${id}/stop`));

export const getCampaignQueue = (id) =>
  withMock(() => phishingClient.get(`/reports/${id}/stats`), MOCK_QUEUE, "queue").then((r) => ({
    ...r,
    data: r.isMock ? r.data : normalizeQueue(r.data),
  }));

// ─── TRACKING (admin) ────────────────────────────────────────────

const unavailableTrackingAdmin = () => Promise.reject(new Error("Tracking admin endpoint is not available in backend yet"));

export const getTrackingLogs = () =>
  withMock(unavailableTrackingAdmin, MOCK_TRACKING_EVENTS, "tracking-logs").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

export const getTrackingTimeline = () =>
  withMock(unavailableTrackingAdmin, MOCK_TRACKING_EVENTS, "timeline").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

// ─── TRACKING (public — no JWT) ──────────────────────────────────

export const trackOpen = (token) => phishingTrackClient.get(`/track/open/${token}`);
export const trackClick = (token) => phishingTrackClient.get(`/track/click/${token}`);
export const trackVisit = (token) => phishingTrackClient.post(`/track/visit/${token}`);
export const trackSubmit = (token, payload) => phishingTrackClient.post(`/track/submit/${token}`, payload);
export const trackDownload = (token, payload = {}) => phishingTrackClient.post(`/track/download/${token}`, payload);

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

export const downloadReport = (id) =>
  phishingClient.get(`/reports/${id}/download`, { responseType: "blob" });

// ─── INTEGRATIONS ────────────────────────────────────────────────

async function postIntegration(path, payload) {
  try {
    return await mutate(() => phishingClient.post(path, payload));
  } catch (err) {
    if (!USE_MOCK) throw err;
    return { data: { status: "queued", mock: true, path } };
  }
}

export const pushToGrc = (payload) => postIntegration("/integrations/grc/risk", payload);
export const pushToSoar = (payload) => postIntegration("/integrations/soar/incident", payload);
export const pushToSiem = (payload) => postIntegration("/integrations/siem/event", payload);
export const pushToOpenCti = (payload) => postIntegration("/integrations/opencti/indicator", payload);

export function buildIntegrationPayload(campaign, type = "campaign") {
  const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
  const campaignId = campaign?._id ?? campaign?.id;
  const validCampaignId = isObjectId(campaignId) ? campaignId : undefined;
  const recipientId = campaign?.recipientId ?? campaign?.raw?.recipientId;
  const validRecipientId = isObjectId(recipientId) ? recipientId : undefined;
  const base = {
    source: "phishing",
    type,
    campaignName: campaign?.name,
    timestamp: new Date().toISOString(),
    metrics: {
      sent: campaign?.sent,
      clicked: campaign?.clicked,
      submitted: campaign?.submitted,
    },
  };
  return {
    grc: compactPayload({
      ...base,
      eventType: "phishing_simulation",
      campaignId: validCampaignId,
      title: `Phishing campaign: ${campaign?.name}`,
      description: "Campaign result pushed from phishing simulation",
    }),
    soar: validCampaignId ? compactPayload({
      ...base,
      eventType: "phishing_simulation",
      campaignId: validCampaignId,
      title: `[Phishing] ${campaign?.name}`,
      severity: campaign?.submitted > 10 ? "high" : "medium",
    }) : null,
    siem: validCampaignId && validRecipientId ? compactPayload({
      ...base,
      eventType: "click",
      campaignId: validCampaignId,
      recipientId: validRecipientId,
      metadata: base.metrics,
    }) : null,
    opencti: compactPayload({
      name: campaign?.name,
      value: campaignId ?? campaign?.name,
      observableType: "campaign",
    }),
  };
}
