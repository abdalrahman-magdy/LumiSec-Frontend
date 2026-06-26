import axios from "axios";
import {
  normalizeAsset,
  normalizeAssetList,
  normalizeDiscoveryResult,
  normalizeFlowMetrics,
  normalizeLiveStream,
  normalizeMisconfigurationList,
  normalizePortScanResult,
} from "../features/Network/utils/normalizers.js";
import { getToken } from "../features/auth/utils/authStorage";
import { buildNetworkScanPayload } from "../features/Network/utils/portScan";
import { apiClient } from "./apiClient";

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
    return Promise.reject(
      new LuminetApiError(
        "Backend incident — LumiNet services are temporarily unavailable.",
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
    () => luminetClient.post("/network/discover", payload),
    { retries: 2, label: "discoverNetwork" }
  );
  return normalizeDiscoveryResult(unwrapBackendBody(response.data));
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
  return normalizeMisconfigurationList(unwrapBackendBody(response.data));
}

export async function getFlowMetrics(params) {
  const response = await luminetClient.get("/network/flow-metrics", { params });
  return normalizeFlowMetrics(unwrapBackendBody(response.data));
}

// ─── ASSETS ─────────────────────────────────────────────────────

export async function getAssetInventory(params) {
  const response = await withRetry(
    () => luminetClient.get("/assets/inventory", { params }),
    { retries: 2, label: "getAssetInventory" }
  );
  return normalizeAssetList(unwrapBackendBody(response.data));
}

export async function getAssetDetails(mac) {
  const encoded = encodeURIComponent(mac);
  const response = await luminetClient.get(`/assets/details/${encoded}`);
  const body = unwrapBackendBody(response.data);
  return normalizeAsset(body?.asset ?? body ?? {});
}

export async function getAssetContext(ip) {
  const encoded = encodeURIComponent(ip);
  const response = await luminetClient.get(`/assets/context/${encoded}`);
  return unwrapBackendBody(response.data);
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

export async function sendToGrc(payload) {
  const response = await apiClient.post("/api/grc/integrations/network/findings", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToSoar(payload) {
  const response = await apiClient.post("/api/soar/incidents", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToUctc(payload) {
  const response = await luminetClient.post("/integrations/uctc/detection-gap", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToSiem(payload) {
  const response = await apiClient.post("/api/grc/integrations/siem/alerts", payload);
  return unwrapBackendBody(response.data);
}

export async function sendToOpenCti(payload) {
  const response = await apiClient.post("/api/grc/integrations/opencti/ioc", payload);
  return unwrapBackendBody(response.data);
}

export function buildIntegrationPayload(source, item = {}) {
  const base = {
    source: "luminet",
    module: source,
    timestamp: new Date().toISOString(),
    asset: item.asset ?? item.hostname ?? item.host ?? "Unknown",
    ip: item.ip ?? item.ipAddress ?? "—",
    severity: item.severity ?? "medium",
    title: item.type ?? item.title ?? "Network finding",
    description: item.description ?? item.summary ?? "",
    metadata: item,
  };

  return {
    grc: {
      title: base.title,
      description: base.description || `Network finding detected on ${base.asset}`,
      severity: base.severity,
      asset: base.ip !== "—" ? base.ip : base.asset,
      sourceId: item.id ?? item._id,
      findingType: item.type ?? source,
      tags: ["network", source].filter(Boolean),
    },
    soar: {
      title: `[Network] ${base.title}`,
      severity: base.severity,
      description: base.description || `Network event detected on ${base.asset}`,
      sourceIP: base.ip !== "—" ? base.ip : undefined,
      affectedHost: base.asset,
    },
    uctc: {
      gapType: item.gapType ?? "detection_coverage",
      detectionRule: item.type ?? base.title,
      affectedAsset: base.asset,
      ip: base.ip,
      ...base,
    },
    siem: {
      alertId: item.alertId ?? `luminet-${source}-${item.id ?? item._id ?? Date.now()}`,
      ruleName: base.title,
      severity: base.severity,
      sourceIp: base.ip,
      destinationIp: item.destinationIp ?? item.destination_ip,
      indexName: "luminet",
    },
    opencti: {
      iocType: item.iocType ?? "ip",
      indicator: base.ip !== "—" ? base.ip : base.asset,
      confidence: item.confidence ?? 3,
      description: base.description,
      title: base.title,
    },
  };
}

export default luminetClient;
