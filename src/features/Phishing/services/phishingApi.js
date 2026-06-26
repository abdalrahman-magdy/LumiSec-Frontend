import phishingClient, { phishingTrackClient } from "./apiClient";
import { apiClient } from "../../../services/apiClient";
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
  const selectedTemplate = MOCK_TEMPLATES.find((template) => template.id === payload.templateId || template._id === payload.templateId);
  const selectedLandingPage = MOCK_LANDING_PAGES.find((page) => page.id === payload.landingPageId || page._id === payload.landingPageId);
  return compactPayload({
    name: payload.name,
    description: payload.description,
    template: payload.template || {
      subject: selectedTemplate?.subject || "LumiSec Security Awareness",
      senderName: selectedTemplate?.senderName || "LumiSec Security Team",
      senderEmail: selectedTemplate?.senderEmail || "security@lumisec.local",
      htmlBody: selectedTemplate?.htmlBody || selectedTemplate?.body || "<p>Please review this security awareness message.</p>",
    },
    landingPageUrl: payload.landingPageUrl || selectedLandingPage?.url || selectedLandingPage?.redirectUrl,
    trackingDomain: payload.trackingDomain,
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
  withMock(() => phishingClient.get("/"), MOCK_CAMPAIGNS, "campaigns").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeCampaign),
  }));

export const getCampaign = (id) =>
  listCampaigns().then((r) => ({
    ...r,
    data: normalizeCampaign(r.data.find((c) => c.id === id || c.raw?._id === id) ?? MOCK_CAMPAIGNS.find((c) => c.id === id) ?? MOCK_CAMPAIGNS[0]),
  }));

export const createCampaign = (payload) => mutate(
  () => phishingClient.post("/", toCampaignPayload(payload)),
  () => ({ _id: `mock-campaign-${Date.now()}`, ...toCampaignPayload(payload), status: "draft" }),
  "createCampaign"
);
export const updateCampaign = (id, payload) => mutate(
  () => Promise.reject(new Error("Campaign update endpoint is not available in backend yet")),
  () => ({ _id: id, ...toCampaignPayload(payload) }),
  "updateCampaign"
);
export const deleteCampaign = (id) => mutate(
  () => Promise.reject(new Error("Campaign delete endpoint is not available in backend yet")),
  () => ({ deleted: true, id }),
  "deleteCampaign"
);
export const attachCampaignRecipients = (id, recipientIds) =>
  mutate(
    () => Promise.reject(new Error("Recipient attach endpoint is not available in backend yet")),
    () => ({ campaignId: id, attached: recipientIds.length }),
    "attachCampaignRecipients"
  );
export const launchCampaign = (id) => mutate(() => phishingClient.post(`/${id}/launch`), { queued: 0 }, "launchCampaign");
export const pauseCampaign = (id) => mutate(() => Promise.reject(new Error("Campaign pause endpoint is not available in backend yet")), { id, status: "paused" }, "pauseCampaign");
export const resumeCampaign = (id) => mutate(() => Promise.reject(new Error("Campaign resume endpoint is not available in backend yet")), { id, status: "active" }, "resumeCampaign");
export const stopCampaign = (id) => mutate(() => Promise.reject(new Error("Campaign stop endpoint is not available in backend yet")), { id, status: "completed" }, "stopCampaign");

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

export const trackOpen = (token) => phishingTrackClient.post(`/track/${token}`, { type: "open" });
export const trackClick = (token) => phishingTrackClient.post(`/track/${token}`, { type: "click" });
export const trackVisit = (token) => phishingTrackClient.post(`/track/${token}`, { type: "click" });
export const trackSubmit = (token, payload) => phishingTrackClient.post(`/track/${token}`, { ...payload, type: "submit" });
export const trackDownload = (token, payload = {}) => phishingTrackClient.post(`/track/${token}`, { ...payload, type: "click" });

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
      title: `Phishing campaign: ${campaign?.name}`,
      indicator: campaignId ?? campaign?.name,
      iocType: "domain",
      confidence: 3,
    }),
  };
}
