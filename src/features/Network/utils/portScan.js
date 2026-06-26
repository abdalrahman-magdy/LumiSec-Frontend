export const SCAN_MODES = ["CONNECT", "SYN", "UDP"];

export const SCAN_MODE_OPTIONS = [
  { value: "CONNECT", label: "TCP Scan" },
  { value: "SYN", label: "Stealth Scan" },
  { value: "UDP", label: "UDP Scan" },
];

const UI_SCAN_MODE_MAP = {
  CONNECT: "CONNECT",
  SYN: "SYN",
  UDP: "UDP",
  tcp: "CONNECT",
  stealth: "SYN",
  udp: "UDP",
};

/**
 * Parse port input into a numeric array.
 * Supports comma lists ("22,80,443") and ranges ("1-1024").
 */
export function normalizePortsInput(input) {
  if (Array.isArray(input)) {
    return [...new Set(
      input
        .map((p) => Number(p))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 65535)
    )].sort((a, b) => a - b);
  }

  const raw = String(input ?? "").trim();
  if (!raw) return [];

  const ports = new Set();

  raw.split(",").forEach((segment) => {
    const part = segment.trim();
    if (!part) return;

    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number.parseInt(startRaw.trim(), 10);
      const end = Number.parseInt(endRaw.trim(), 10);
      if (
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start >= 1 &&
        end <= 65535 &&
        start <= end
      ) {
        for (let port = start; port <= end; port += 1) {
          ports.add(port);
        }
      }
      return;
    }

    const port = Number.parseInt(part, 10);
    if (Number.isInteger(port) && port >= 1 && port <= 65535) {
      ports.add(port);
    }
  });

  return Array.from(ports).sort((a, b) => a - b);
}

export function resolveScanMode(scanMode) {
  const normalized = UI_SCAN_MODE_MAP[scanMode] ?? scanMode;
  return SCAN_MODES.includes(normalized) ? normalized : null;
}

export function buildNetworkScanPayload({ target, ports, scanMode }) {
  const trimmedTarget = String(target ?? "").trim();
  const portList = normalizePortsInput(ports);
  const mode = resolveScanMode(scanMode);

  if (!trimmedTarget) {
    throw new Error("Target is required.");
  }
  if (!portList.length) {
    throw new Error("At least one valid port is required.");
  }
  if (!mode) {
    throw new Error("Scan mode must be CONNECT, SYN, or UDP.");
  }

  return {
    target: trimmedTarget,
    ports: portList.join(","),
    type: mode,
  };
}
