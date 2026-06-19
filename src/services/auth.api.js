import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

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

  const status = error.response?.status ?? null;
  const backendMessage =
    error.response?.data?.message || error.response?.data?.error;

  if (status === 401) {
    return new AuthApiError(backendMessage || "Invalid credentials", { status });
  }
  if (status === 403) {
    return new AuthApiError(backendMessage || "Access denied", { status });
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

/**
 * POST /api/auth/login
 * @returns {{ user: object, token: string, message: string }}
 */
export async function login({ email, password }) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    const body = response.data;
    const user = body?.data?.user;
    const token = body?.data?.token;

    if (!body?.success || !token || !user) {
      throw new AuthApiError(body?.message || "Login failed");
    }

    return {
      user,
      token,
      message: body.message || "Logged in successfully",
    };
  } catch (error) {
    throw mapLoginError(error);
  }
}
