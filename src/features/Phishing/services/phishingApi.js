import phishingClient, { phishingTrackClient } from "./apiClient";
import {
  normalizeCampaign,
  normalizeLandingPage,
  normalizeList,
  normalizeRecipient,
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

async function withMock(apiCall, mockData, label) {
  try {
    const res = await apiCall();
    return { data: res.data, isMock: false };
  } catch (err) {
    if (!USE_MOCK) throw err;
    console.warn(`[Phishing] ${label} — mock fallback`, err.message);
    return { data: mockData, isMock: true, error: err.message };
  }
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

export const createTemplate = (payload) => phishingClient.post("/templates", payload);
export const updateTemplate = (id, payload) => phishingClient.put(`/templates/${id}`, payload);
export const deleteTemplate = (id) => phishingClient.delete(`/templates/${id}`);

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

export const createLandingPage = (payload) => phishingClient.post("/landing-pages", payload);
export const updateLandingPage = (id, payload) => phishingClient.put(`/landing-pages/${id}`, payload);
export const deleteLandingPage = (id) => phishingClient.delete(`/landing-pages/${id}`);

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

export const updateRecipient = (id, payload) => phishingClient.put(`/recipients/${id}`, payload);
export const deleteRecipient = (id) => phishingClient.delete(`/recipients/${id}`);

export const importRecipientsCsv = (file, campaignId) => {
  const form = new FormData();
  form.append("file", file);
  if (campaignId) form.append("campaignId", campaignId);
  return phishingClient.post("/recipients/import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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

export const createCampaign = (payload) => phishingClient.post("/campaigns", payload);
export const updateCampaign = (id, payload) => phishingClient.put(`/campaigns/${id}`, payload);
export const deleteCampaign = (id) => phishingClient.delete(`/campaigns/${id}`);
export const attachCampaignRecipients = (id, recipientIds) =>
  phishingClient.post(`/campaigns/${id}/recipients`, { recipientIds });
export const launchCampaign = (id) => phishingClient.post(`/campaigns/${id}/launch`);
export const pauseCampaign = (id) => phishingClient.post(`/campaigns/${id}/pause`);
export const resumeCampaign = (id) => phishingClient.post(`/campaigns/${id}/resume`);
export const stopCampaign = (id) => phishingClient.post(`/campaigns/${id}/stop`);

export const getCampaignQueue = (id) =>
  withMock(() => phishingClient.get(`/campaigns/${id}/queue`), MOCK_QUEUE, "queue");

// ─── TRACKING (admin) ────────────────────────────────────────────

export const getTrackingLogs = (params) =>
  withMock(() => phishingClient.get("/tracking/logs", { params }), MOCK_TRACKING_EVENTS, "tracking-logs").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

export const getTrackingTimeline = (params) =>
  withMock(() => phishingClient.get("/tracking/timeline", { params }), MOCK_TRACKING_EVENTS, "timeline").then((r) => ({
    ...r,
    data: normalizeList(r.data).map(normalizeTrackingEvent),
  }));

// ─── TRACKING (public — no JWT) ──────────────────────────────────

export const trackOpen = (token) => phishingTrackClient.get(`/track/open/${token}`);
export const trackClick = (token) => phishingTrackClient.get(`/track/click/${token}`);
export const trackVisit = (token) => phishingTrackClient.get(`/track/visit/${token}`);
export const trackSubmit = (token, payload) => phishingTrackClient.post(`/track/submit/${token}`, payload);
export const trackDownload = (token) => phishingTrackClient.get(`/track/download/${token}`);

// ─── REPORTS ─────────────────────────────────────────────────────

export const getReportStats = () =>
  withMock(() => phishingClient.get("/reports/stats"), MOCK_REPORT_STATS, "report-stats");

export const generateReport = (payload) => phishingClient.post("/reports/generate", payload);

export const getReport = (id) =>
  withMock(() => phishingClient.get(`/reports/${id}`), { id, summary: MOCK_REPORT_STATS }, "getReport");

export const downloadReport = (id) =>
  phishingClient.get(`/reports/${id}/download`, { responseType: "blob" });

// ─── INTEGRATIONS ────────────────────────────────────────────────

async function postIntegration(path, payload) {
  try {
    return await phishingClient.post(path, payload);
  } catch (err) {
    if (!USE_MOCK) throw err;
    return { data: { status: "queued", mock: true, path } };
  }
}

export const pushToGrc = (payload) => postIntegration("/integrations/grc", payload);
export const pushToSoar = (payload) => postIntegration("/integrations/soar", payload);
export const pushToSiem = (payload) => postIntegration("/integrations/siem", payload);
export const pushToOpenCti = (payload) => postIntegration("/integrations/opencti", payload);

export function buildIntegrationPayload(campaign, type = "campaign") {
  const base = {
    source: "phishing",
    type,
    campaignId: campaign?.id,
    campaignName: campaign?.name,
    timestamp: new Date().toISOString(),
    metrics: {
      sent: campaign?.sent,
      clicked: campaign?.clicked,
      submitted: campaign?.submitted,
    },
  };
  return {
    grc: { ...base, riskType: "phishing_simulation", severity: "medium", finding: `Phishing campaign: ${campaign?.name}` },
    soar: { ...base, title: `[Phishing] ${campaign?.name}`, severity: campaign?.submitted > 10 ? "high" : "medium" },
    siem: { ...base, eventType: "phishing_simulation", message: `Campaign ${campaign?.name} completed` },
    opencti: { ...base, iocType: "campaign", value: campaign?.id, labels: ["phishing", "simulation"] },
  };
}
