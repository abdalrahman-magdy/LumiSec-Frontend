import axios from "axios";
import { clearAuth, getToken } from "../features/auth/utils/authStorage";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? null;
    this.data = data ?? null;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? null;
    const backendMessage =
      error.response?.data?.message || error.response?.data?.error;

    if (status === 401) {
      clearAuth();
    }

    return Promise.reject(
      new ApiError(backendMessage || error.message || "Request failed", {
        status,
        data: error.response?.data,
      })
    );
  }
);

export function unwrapResponse(body) {
  if (!body || body.success === false) {
    throw new ApiError(body?.message || "Unexpected API response", {
      data: body,
    });
  }

  return {
    data: body.data,
    pagination: body.pagination ?? null,
    message: body.message ?? "",
  };
}

export async function request(config) {
  const response = await apiClient.request(config);
  return unwrapResponse(response.data);
}
