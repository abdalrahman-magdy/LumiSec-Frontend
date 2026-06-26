import axios from "axios";
import { getToken } from "../../auth/utils/authStorage";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const PHISHING_BASE = "/api/phishing";

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
    return Promise.reject(new Error("Backend authentication is required for this request."));
  }

  if (status === 429) {
    const retryAfter = error.response.headers?.["retry-after"] || "60";
    return Promise.reject(
      new Error(`Rate limit exceeded. Retry after ${retryAfter}s.`)
    );
  }

  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Phishing API request failed";
  return Promise.reject(new Error(message));
}

export const phishingClient = axios.create({
  baseURL: `${API_BASE_URL}${PHISHING_BASE}`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

phishingClient.interceptors.request.use(attachAuth);

/** Public tracking client — NEVER attaches JWT */
export const phishingTrackClient = axios.create({
  baseURL: `${API_BASE_URL}${PHISHING_BASE}`,
  timeout: 30000,
});

phishingClient.interceptors.response.use((r) => r, handleResponseError);
phishingTrackClient.interceptors.response.use((r) => r, handleResponseError);

export default phishingClient;
