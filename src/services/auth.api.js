import { request } from "./apiClient";
import axios from "axios";
import { API_BASE_URL } from "./apiClient";

export class AuthApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "AuthApiError";
    this.status = status ?? null;
    this.data = data ?? null;
  }
}

function mapLoginError(error) {
  if (error instanceof AuthApiError) return error;

  if (!error.response) {
    const isNetwork =
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      error.message?.includes("Network Error");

    if (isNetwork) {
      return new AuthApiError(
        "Cannot reach the LumiSec API. Make sure the backend is running on port 3000, then restart the frontend dev server.",
        { status: null }
      );
    }
  }

  const status = error.response?.status ?? null;
  const backendMessage =
    error.response?.data?.message || error.response?.data?.error;

  if (status === 401) {
    return new AuthApiError(backendMessage || "Invalid credentials", { status });
  }
  if (status === 403) {
    return new AuthApiError(backendMessage || "Access denied", { status });
  }
  if (status === 404) {
    return new AuthApiError(
      "Login service not found. Ensure the backend is running on port 3000.",
      { status }
    );
  }
  if (status === 422) {
    return new AuthApiError(
      backendMessage || "Email and password are required.",
      { status }
    );
  }
  if (status >= 500) {
    return new AuthApiError(
      backendMessage || "Server error. Please try again later.",
      { status }
    );
  }

  return new AuthApiError(
    backendMessage || error.message || "Login failed",
    { status }
  );
}

function unwrapAuthResponse(body) {
  const user = body?.data?.user;
  const token = body?.data?.token;

  if (!body?.success || !token || !user) {
    throw new AuthApiError(body?.message || "Authentication failed");
  }

  return {
    user,
    token,
    message: body.message || "Success",
  };
}

function authUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

/**
 * POST /api/auth/login
 * @returns {{ user: object, token: string, message: string }}
 */
export async function login({ email, password }) {
  try {
    const response = await axios.post(authUrl("/api/auth/login"), {
      email,
      password,
    });

    return unwrapAuthResponse(response.data);
  } catch (error) {
    throw mapLoginError(error);
  }
}

function toSessionUser(profile) {
  if (!profile) return null;
  return {
    _id: profile._id ?? profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department,
  };
}

/**
 * GET /api/auth/profile
 */
export async function getProfile() {
  const result = await request({ method: "GET", url: "/api/auth/profile" });
  return { ...result, user: toSessionUser(result.data) };
}

/**
 * PATCH /api/auth/profile
 */
export async function updateProfile(payload) {
  const result = await request({
    method: "PATCH",
    url: "/api/auth/profile",
    data: payload,
  });
  return { ...result, user: toSessionUser(result.data) };
}
