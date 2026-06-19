import { LuminetApiError } from "../../../services/luminet.api";

export function toNetworkError(err) {
  if (!err) return null;
  if (err instanceof LuminetApiError) return err;
  if (typeof err === "string") return new LuminetApiError(err);
  const status = err.status ?? err.response?.status ?? null;
  const message = err.message || "Request failed";
  return new LuminetApiError(message, { status });
}
