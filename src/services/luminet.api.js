import axios from "axios";
import {
  normalizeAsset,
  normalizeAssetList,
  normalizeDiscoveryResult,
  normalizeFlowMetrics,
  normalizeLiveStream,
  normalizeMisconfigurationList,
  normalizePortScanResult,
  normalizeAssetDetails,
  normalizeAssetContext,
} from "../features/Network/utils/normalizers.js";
import { getToken } from "../features/auth/utils/authStorage";
import { buildNetworkScanPayload } from "../features/Network/utils/portScan";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const LUMINET_BASE = "/api/luminet";

export class LuminetApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "LuminetApiError";
    this.status = status ?? null;
    this.data = data ?? null;
  }

  get isRateLimit() {
    return this.status === 429;
  }

  get isBackendIncident() {
    return this.status != null && this.status >= 500;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

function attachAuth(config) {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function handleResponseError(error) {
  const status = error.response?.status ?? null;

  if (status === 401) {
    // Phase 1 keeps demo sessions testable; production 401 handling belongs in Phase 2.
    return Promise.reject(
      new LuminetApiError("Backend authentication is required for this request.", { status })
    );
  }

  if (status === 429) {
    const retryAfter = error.response?.headers?.["retry-after"] || "60";
    return Promise.reject(
      new LuminetApiError(
        `Rate limit exceeded. Retry after ${retryAfter}s.`,
        { status }
      )
    );
  }

  if (status >= 500) {
    const serverMessage = error.response?.data?.message;
    return Promise.reject(
      new LuminetApiError(
        serverMessage || "Backend incident — LumiNet services are temporarily unavailable.",
        { status, data: error.response?.data }
      )
    );
  }

  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "LumiNet request failed";

  return Promise.reject(new LuminetApiError(message, { status }));
}

/** Authenticated client for LumiNet endpoints */
export const luminetClient = axios.create({
  baseURL: `${API_BASE_URL}${LUMINET_BASE}`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

luminetClient.interceptors.request.use(attachAuth);
luminetClient.interceptors.response.use((r) => r, handleResponseError);

function unwrapBackendBody(body) {
  return body?.success && Object.prototype.hasOwnProperty.call(body, "data")
    ? body.data
    : body;
}

function unwrapPaginatedResponse(response, mapItems) {
  const body = response.data ?? {};
  const rawList = unwrapBackendBody(body);
  const list = Array.isArray(rawList) ? rawList : [];
  const pagination = body.pagination ?? {
    page: 1,
    limit: list.length,
    total: list.length,
    pages: 1,
  };

  return {
    items: mapItems(list),
    pagination,
  };
}

async function withRetry(requestFn, { retries = 2, delayMs = 1000, label } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;
      if (status === 401 || status === 429 || attempt === retries) break;
      console.warn(
        `[LumiNet] ${label ?? "request"} failed (attempt ${attempt + 1}/${retries + 1}), retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}

// ─── NETWORK CORE ───────────────────────────────────────────────

export async function discoverNetwork(payload) {
  const response = await withRetry(
    () => luminetClient.post("/network/discover", { subnet: payload.subnet }),
    { retries: 2, label: "discoverNetwork" }
  );
  return normalizeDiscoveryResult(unwrapBackendBody(response.data), payload.subnet);
}

export async function scanPorts(payload) {
  const body = buildNetworkScanPayload(payload);
  const response = await withRetry(
    () => luminetClient.post("/network/scan-ports", body),
    { retries: 2, label: "scanPorts" }
  );
  return normalizePortScanResult(unwrapBackendBody(response.data));
}

export async function getMisconfigurations(params) {
  const response = await luminetClient.get("/network/misconfigurations", { params });
  return unwrapPaginatedResponse(response, normalizeMisconfigurationList);
}

export async function resolveMisconfiguration(id, status = "resolved") {
  const response = await luminetClient.patch(`/network/misconfigurations/${id}`, { status });
  const body = unwrapBackendBody(response.data);
  return normalizeMisconfigurationList([body])[0] ?? body;
}

export async function getFlowMetrics(params) {
  const response = await luminetClient.get("/network/flow-metrics", { params });
  const { items, pagination } = unwrapPaginatedResponse(response, (rows) => rows);
  return {
    metrics: normalizeFlowMetrics(items),
    pagination,
  };
}

// ─── ASSETS ─────────────────────────────────────────────────────

export async function getAssetInventory(params) {
  const response = await withRetry(
    () => luminetClient.get("/assets/inventory", { params }),
    { retries: 2, label: "getAssetInventory" }
  );
  return unwrapPaginatedResponse(response, normalizeAssetList);
}

export async function getAssetDetails(mac) {
  const encoded = encodeURIComponent(mac);
  const response = await luminetClient.get(`/assets/details/${encoded}`);
  const body = unwrapBackendBody(response.data);
  return normalizeAssetDetails(body);
}

export async function getAssetContext(ip) {
  const encoded = encodeURIComponent(ip);
  const response = await luminetClient.get(`/assets/context/${encoded}`);
  return normalizeAssetContext(unwrapBackendBody(response.data));
}

// ─── SNIFFING ───────────────────────────────────────────────────

export async function startSniffing(payload) {
  const response = await luminetClient.post("/sniffing/start", payload);
  return unwrapBackendBody(response.data);
}

export async function getLiveStream(params) {
  const response = await luminetClient.get("/sniffing/live-stream", { params });
  return normalizeLiveStream(unwrapBackendBody(response.data));
}

// ─── INTEGRATIONS ───────────────────────────────────────────────
// All outbound integrations use LumiNet routes per network module spec.

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function resolveRecord(item = {}) {
  return item.raw ?? item;
}

function resolveIpv4(item = {}) {
  const record = resolveRecord(item);
  const candidates = [
    record.assetIp,
    record.ip,
    record.ipAddress,
    record.sourceIp,
    record.source_ip,
    item.ip,
    item.assetIp,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (IPV4_RE.test(trimmed)) return trimmed;
    }
  }

  return null;
}

function resolveSeverity(item = {}) {
  const record = resolveRecord(item);
  const value = String(record.severity ?? item.severity ?? "medium").toLowerCase();
  if (["low", "medium", "high", "critical"].includes(value)) return value;
  if (value.includes("crit")) return "critical";
  if (value.includes("high")) return "high";
  if (value.includes("low")) return "low";
  return "medium";
}

function resolveSourceId(source, item = {}) {
  const record = resolveRecord(item);
  const id = record._id ?? item._id ?? item.id;
  if (id && !String(id).startsWith("mc-")) {
    return String(id);
  }

  const ip = resolveIpv4(item);
  const findingType = record.type ?? item.type ?? source;
  return `luminet:${source}:${findingType}:${ip ?? "unknown"}:${Date.now()}`;
}

function resolveTitle(source, item = {}) {
  const record = resolveRecord(item);
  return (
    record.title ??
    item.title ??
    record.type ??
    item.type ??
    `Network ${source} finding`
  );
}

function resolveDescription(source, item = {}, title) {
  const record = resolveRecord(item);
  const ip = resolveIpv4(item);
  const host =
    record.hostname ??
    item.hostname ??
    record.asset ??
    item.asset ??
    ip ??
    "unknown asset";

  return (
    record.description ??
    item.description ??
    record.summary ??
    item.summary ??
    `${title} detected on ${host} via LumiNet ${source}.`
  );
}

function resolveHostLabel(item = {}) {
  const record = resolveRecord(item);
  return (
    record.hostname ??
    item.hostname ??
    record.host ??
    item.host ??
    resolveIpv4(item) ??
    "Unknown"
  );
}

export async function sendToGrc(payload) {
  const response = await luminetClient.post("/integrations/grc/finding", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToSoar(payload) {
  const response = await luminetClient.post("/integrations/soar/incident", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToUctc(payload) {
  const response = await luminetClient.post("/integrations/uctc/detection-gap", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToSiem(payload) {
  const response = await luminetClient.post("/integrations/siem/event", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToOpenCti(payload) {
  const response = await luminetClient.post("/integrations/opencti/enrichment", payload);
  return unwrapBackendBody(response.data);
}

export function buildIntegrationPayload(source, item = {}) {
  const record = resolveRecord(item);
  const ip = resolveIpv4(item);
  const severity = resolveSeverity(item);
  const title = resolveTitle(source, item);
  const description = resolveDescription(source, item, title);
  const sourceId = resolveSourceId(source, item);
  const findingType = record.type ?? item.type ?? source;
  const hostLabel = resolveHostLabel(item);
  const evidence = record.evidence ?? item.evidence;

  const grc = {
    title,
    description,
    severity,
    sourceId,
    findingType,
    tags: ["network", source, findingType].filter(Boolean),
  };
  if (ip) grc.asset = ip;

  const soar = {
    title: `[Network] ${title}`,
    description,
    severity,
    asset: hostLabel,
    sourceId,
    findingType,
  };
  if (ip) soar.sourceIp = ip;

  const uctc = {
    gapType: item.gapType ?? record.gapType ?? "missing-detection",
    description: description.slice(0, 500),
  };
  if (ip) uctc.assetIp = ip;
  if (record.assetMac ?? item.mac) {
    uctc.assetMac = record.assetMac ?? item.mac;
  }
  if (evidence?.service ?? record.service) {
    uctc.service = evidence?.service ?? record.service;
  }
  if (Number.isInteger(evidence?.port)) {
    uctc.port = evidence.port;
  }

  const siem = {
    eventType: "network_finding",
    severity,
    metadata: {
      source,
      title,
      findingType,
      host: hostLabel,
      sourceId,
    },
  };
  if (ip) siem.target = ip;
  if (record.scanId ?? item.scanId ?? item.taskId) {
    siem.scanId = String(record.scanId ?? item.scanId ?? item.taskId);
  }

  const opencti = {};
  if (ip) opencti.ip = ip;

  return { grc, soar, uctc, siem, opencti };
}

export default luminetClient;
